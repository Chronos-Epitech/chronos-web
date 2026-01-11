FROM oven/bun:1 AS base
WORKDIR /app

# Install workspace dependencies (monorepo)
FROM base AS deps
COPY package.json bun.lock* ./
COPY apps/api/package.json apps/api/bun.lock* ./apps/api/
COPY packages ./packages
RUN bun install --no-save

# Development image (source is bind-mounted by docker compose)
FROM deps AS dev
WORKDIR /app/apps/api
ENV NODE_ENV=development \
    PORT=4000 \
    HOST=0.0.0.0
EXPOSE 4000
CMD ["bun", "run", "dev"]

# Build API (tsup -> dist/)
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/api
RUN bun run build

# Production runtime
FROM base AS runner
WORKDIR /app/apps/api
ENV NODE_ENV=production \
    PORT=4000 \
    HOST=0.0.0.0
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY apps/api/package.json ./
EXPOSE 4000
CMD ["bun", "dist/server.js"]
