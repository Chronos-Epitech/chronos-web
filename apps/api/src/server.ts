import "dotenv/config"; // dotenv must be imported before @clerk/fastify
import fastify from "fastify";
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { clerkPlugin } from "@clerk/fastify";
import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { fastifyTRPCOpenApiPlugin } from "trpc-to-openapi";
import { appRouter, type AppRouter } from "./routers/index";
import { openApiDocument } from "./openapi";
import { createContext } from "./context";

const server = fastify({ logger: true });

server.get("/", async () => {
  return { hello: "world" };
});

// Clerk: parse Authorization bearer and expose req.auth
server.register(clerkPlugin);

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  routerOptions: {
    maxParamLength: 5000,
  },
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`Error in tRPC handler on path '${path}':`, error.message);
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

// Enable CORS globally
server.register(cors, {});

// OpenAPI REST routes via trpc-to-openapi
server.register(fastifyTRPCOpenApiPlugin, {
  basePath: "/api",
  router: appRouter,
  createContext,
});

// Health check endpoint
server.get("/health", async () => {
  return { status: "ok" };
});

// Serve OpenAPI spec and Swagger UI
server.get("/openapi.json", async () => openApiDocument);

server.register(fastifySwagger as any, {
  mode: "static",
  specification: { document: openApiDocument },
});

server.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  server.log.info(`Received ${signal}, shutting down gracefully...`);

  try {
    await server.close();
    server.log.info("Server closed successfully");
    process.exit(0);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    server.log.error(`Error during shutdown: ${errorMessage}`);
    process.exit(1);
  }
};

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

server.listen({ port: 3001 });
