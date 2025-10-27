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
import { appRouter, type AppRouter } from "./routers";
import { openApiDocument } from "./openapi";
import { createContext } from "./context";

const server = fastify();

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

// Serve OpenAPI spec and Swagger UI
server.get("/openapi.json", async () => openApiDocument);

server.register(fastifySwagger as any, {
  mode: "static",
  specification: { document: openApiDocument },
});

server.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

server.listen({ port, host }).catch((err) => {
  server.log.error(err);
  process.exit(1);
});

export default server;
