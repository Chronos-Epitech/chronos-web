# Vercel deployment issue — `@chronos/api` (Fastify + tRPC, Turborepo/Bun)

## Symptom

Deploy succeeds, but every request returns **500** at runtime:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/apps/api/src/routers/index' imported from /var/task/apps/api/src/server.js
```

## Symptom (variant): Clerk import crashes on Vercel

If you add Clerk and get:

```
SyntaxError: The requested module '@clerk/fastify' does not provide an export named 'clerkPlugin'
```

This usually means **the Vercel build/runtime pipeline is treating `@clerk/fastify` as CommonJS during execution**, so ESM named imports can fail even though the package supports ESM.

## What this error actually means (the online “why”)

This is a **Node.js ESM module resolution** issue, not a compile error:

- **Node ESM requires explicit file extensions for relative imports** (ex: `./routers/index.js`). If your compiled output contains `import "./routers/index"`, Node will throw `ERR_MODULE_NOT_FOUND`. This commonly happens when TypeScript is compiled/transpiled without enforcing Node’s ESM rules. (See TypeScript/ESM and Node ESM resolution notes; a concise explanation is in many guides, e.g. `ERR_MODULE_NOT_FOUND` in ESM when omitting `.js` extensions.)
- **Vercel’s Node builder often transpiles TS to JS in-place** for serverless functions (so you’ll see paths like `src/server.js` under `/var/task/...`). That’s why your stacktrace references `src/server.js` even though you “built dist” locally.
- **Bun “works locally”** because Bun is permissive here: it can run `.ts` and resolves extensionless imports in ways Node ESM won’t.
- **Monorepo exports pointing at `.ts`** (`"exports": { "import": "./src/index.ts" }`) will also break on Node unless the builder/bundler inlines them, because Node cannot execute TS modules.
- **“Vercel only detects one endpoint /” is not a reliable signal.** With serverless, Vercel usually shows _one function entrypoint_ (catch-all). Your Fastify routes are inside that function; they won’t appear as separate “endpoints”.

Extra gotcha to double-check (also common on Vercel/Linux):

- **Case sensitivity**: macOS can hide casing mismatches; Vercel’s Linux environment is case-sensitive. A mismatched import path can produce the same runtime error. (Vercel has a guide on resolving “module not found” errors, and casing is one of the first things they call out.)

## Root cause in this repo

From the error:

- The function is executing `apps/api/src/server.js`
- That file is importing `/var/task/apps/api/src/routers/index` (no extension)
- In Node ESM, that specifier will not resolve to `index.js` automatically ⇒ runtime crash

Additionally, multiple internal workspace packages export `.ts` entrypoints (types/data/supabase), which is incompatible with Node runtime unless you bundle everything or ship compiled JS.

## Fix options (pick one)

### Option A (recommended): Make the API runnable on Node ESM

Goal: Make **compiled output valid Node ESM**, and make Vercel execute that output.

1. **Enforce Node ESM rules in TypeScript**
   - Set `moduleResolution` to `NodeNext` (or `Node16`) for `apps/api` so TypeScript forces you to write Node-correct imports.
   - Update all relative imports in `apps/api/src/**` to include `.js` in the specifier (yes, even in `.ts` sources):
     - ✅ `import { router } from "./routers/index.js"`
     - ❌ `import { router } from "./routers/index"`

2. **Stop exporting `.ts` from workspace packages**
   - Build `packages/types`, `packages/data`, `packages/supabase` to `dist/`.
   - Update their `package.json` fields:
     - `exports.import` → `./dist/index.js`
     - `types` / `exports.types` → `./dist/index.d.ts`

3. **Use Vercel’s Node runtime for Fastify**
   - Fastify is supported on Vercel via the Node runtime/framework guidance (see Vercel Fastify docs: `https://vercel.com/docs/frameworks/backend/fastify/`).
   - Ensure the Vercel project’s build/install uses your workspace tooling (Turbo/Bun), but the function runtime is Node.

This option makes your code “boringly correct” for Node and avoids surprises.

### Option B: Switch `@chronos/api` to CommonJS (avoid `.js` specifiers)

Goal: Let Node use CommonJS resolution (extensionless `require()`-style behavior), which avoids the ESM “must include `.js`” rule.

High level:

- Remove/avoid `"type": "module"` for the API package (or output `.cjs`)
- Compile the API to CommonJS (`module: "CommonJS"`)
- Ensure Vercel uses the compiled entry

This is often the fastest path if you don’t want to touch many import specifiers.

### Option C: Bundle the API into a single file and explicitly point Vercel at it

Goal: Produce **one JS entry** that contains all internal imports, then configure Vercel to run that file.

Key detail (this is why your tsup attempt didn’t help):

- Bundling alone isn’t enough if Vercel still chooses `src/server.ts` as the function entrypoint.
- You must **override the entrypoint** so the function executes your bundle.

On Vercel this is typically done by providing an explicit function entry file (and/or `vercel.json` builds/routes) that targets the bundled output.

## What we tried (and why it didn’t fix it)

### Attempt 1: Bundle with tsup

Bundling succeeded locally, but Vercel still executed `src/server` (seen in stacktrace), so the runtime still hit Node ESM resolution rules and crashed before the bundle mattered.

### Attempt 2: Bun runtime on Vercel

Bun runtime on Vercel is limited to certain frameworks (see `https://vercel.com/docs/functions/runtimes/bun`). Even if Bun can run the code, Vercel's framework/build pipeline for Fastify may still run under Node and/or not route requests through Bun the way you expect.

## Community Solution (Worth Trying)

Someone with the exact same error (`ERR_MODULE_NOT_FOUND` on Vercel, Fastify API, monorepo with workspace packages) fixed it by:

1. **Adding CommonJS polyfills in tsup banner**:

   ```typescript
   // apps/api/tsup.config.ts
   import { defineConfig } from "tsup";

   export default defineConfig({
     entry: ["src/index.ts"],  // your entry point
     format: ["esm"],
     target: "node20",
     outDir: "dist",
     clean: true,
     bundle: true,
     noExternal: [
       // Bundle workspace packages that export .ts
       "@chronos/types",
       "@chronos/data",
       "@chronos/supabase"
     ],
     banner: {
       js: `import { createRequire } from 'module';
   import { fileURLToPath } from 'url';
   import { dirname } from 'path';
   ```

const require = createRequire(import.meta.url);
const **filename = fileURLToPath(import.meta.url);
const **dirname = dirname(\_\_filename);`,
},
});

````

2. **Explicit Vercel configuration**:
```json
// apps/api/vercel.json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist"
}
````

3. **Updated package.json**:
   ```json
   {
     "main": "dist/server.js",
     "files": ["dist"],
     "scripts": {
       "build": "tsup"
     }
   }
   ```

**Why this approach might work:**

- The `banner` restores CommonJS globals (`require`, `__filename`, `__dirname`) that some bundled dependencies might expect in ESM
- Explicit `buildCommand` and `outputDirectory` tells Vercel to use the bundle
- `noExternal` forces workspace packages to be inlined, avoiding `.ts` exports

**Caveat:** This is essentially Option C (bundling) with better Vercel configuration. If Vercel still executes `src/server` instead of `dist/server.js`, it won't help.

## References

- Vercel “module not found” troubleshooting guide: `https://vercel.com/guides/how-do-i-resolve-a-module-not-found-error`
- Vercel Bun runtime docs: `https://vercel.com/docs/functions/runtimes/bun`
- Vercel Fastify docs: `https://vercel.com/docs/frameworks/backend/fastify/`
