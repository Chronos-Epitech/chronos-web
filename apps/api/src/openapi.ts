import { generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter } from "./routers";
import {
  TeamId,
  CreateTeamInput,
  UpdateTeamInput,
  SendInvitationInput,
} from "@chronos/types";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Chronos API",
  description: "OpenAPI compliant REST API built using tRPC with Fastify",
  version: "1.0.0",
  baseUrl: "http://localhost:3001/api",
  docsUrl: "https://github.com/Chronos-Epitech/chronos-web",
  tags: ["team", "invitation"],
  defs: {
    TeamId: TeamId,
    CreateTeamInput: CreateTeamInput,
    UpdateTeamInput: UpdateTeamInput,
    SendInvitationInput: SendInvitationInput,
  },
});
