import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "node20",
  clean: true,
  // Bundle workspace packages since they export .ts files
  noExternal: ["@chronos/types", "@chronos/data", "@chronos/supabase"],
});
