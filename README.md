# Chronos

Chronos is a modern time management web application built as a monorepo with Next.js and tRPC. It provides team-based time tracking and scheduling capabilities with role-based access control.

## Architecture

This project is structured as a monorepo with the following components:

- **Web App** (`apps/web/`) - Next.js frontend application
- **API** (`apps/api/`) - tRPC backend server
- **Data Layer** (`packages/data/`) - Shared data access layer
- **Supabase Integration** (`packages/supabase/`) - Database and authentication
- **Types** (`packages/types/`) - Shared TypeScript types and Zod schemas

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Backend**: tRPC for type-safe APIs with OpenAPI REST endpoints
- **API Server**: Fastify with tRPC adapter
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk with Supabase integration
- **Type Safety**: Shared Zod schemas and generated Supabase types
- **UI Components**: shadcn/ui with Tailwind CSS
- **Package Manager**: Bun
- **Monorepo**: Turborepo for task orchestration and caching
- **Deployment**: Docker

## Getting Started

First, install dependencies using [bun](https://bun.sh):

```bash
bun install
```

Then, start all development servers using Turborepo:

```bash
# Start all services (API + Web) in parallel
bun dev
```

This will start:

- **API Server** at [http://localhost:3001](http://localhost:3001)
- **Web Application** at [http://localhost:3000](http://localhost:3000)

### Running Individual Services

You can also run individual services using Turborepo filters:

```bash
# Start only the API server
bunx turbo dev --filter=@chronos/api

# Start only the web application
bunx turbo dev --filter=@chronos/web
```

### Other Available Commands

```bash
# Build all packages
bun run build

# Run linting across all packages
bun run lint

# Start production servers
bun run start
```

## API Documentation

The API server provides both tRPC and REST endpoints:

- **tRPC Endpoints**: Available at `http://localhost:3001/trpc`
- **REST API**: Available at `http://localhost:3001/api` (OpenAPI compliant)
- **Swagger Documentation**: Available at `http://localhost:3001/docs`
- **OpenAPI Spec**: Available at `http://localhost:3001/openapi.json`

The REST API is automatically generated from tRPC procedures using the `trpc-to-openapi` extension, providing full OpenAPI compliance with automatic Swagger documentation.

## Features

- **Team Management**: Create and manage teams with role-based permissions
- **Time Tracking**: Track time across different projects and tasks
- **Scheduling**: Calendar-based scheduling and availability management
- **User Roles**: Admin, Manager, and Member roles with different access levels
- **Role-Based Access Control**: Middleware-based authorization with single source of truth
- **Invitations**: Invite team members with email invitations
- **Dashboard**: Role-specific dashboards for different user types

## Project Structure

```
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # tRPC backend server
├── packages/
│   ├── data/         # Data access layer
│   ├── supabase/     # Database migrations and client
│   └── types/        # Shared TypeScript types and Zod schemas
└── nginx/            # Nginx configuration for production
```

## Using Docker

To build and run the application with Docker:

```bash
# Build the Docker image
docker build -f Dockerfile.bun -t chronos-app .

# Run the container
docker run -p 3000:3000 chronos-app
```

Or use Docker Compose for the full stack:

```bash
# Development environment
docker-compose up

# Production environment
docker-compose -f compose.prod.yml up
```

## Authentication & Authorization

This project uses **Clerk** for authentication with **Supabase** integration and implements comprehensive role-based access control:

### Authentication

- **Clerk Authentication**: Handles user sign-in, sign-up, and session management
- **Supabase Integration**: Clerk's JWT tokens are used to authenticate requests to Supabase
- **Row Level Security (RLS)**: Database policies are based on the user's Clerk access token

### Authorization Middleware

- **tRPC Middleware**: Role-based procedures (`protectedProcedure`, `managerProcedure`, `adminProcedure`)
- **Next.js Middleware**: Route-level protection with Clerk integration
- **Single Source of Truth**: Consistent role checking across frontend and backend
- **Role Hierarchy**: Admin > Manager > Member with appropriate access levels

### Database

- **Database Migrations**: Located in `packages/supabase/migrations/` and include:
  - Full database remote schema
  - RLS policies migrations

## Type Generation

Generate Supabase types from the database schema:

```bash
bun run generate:types
```

This command uses the Supabase CLI to generate TypeScript types directly from your database schema and saves them to `packages/types/src/supabase-types.ts`.

## Turborepo

This project uses [Turborepo](https://turbo.build/) for monorepo task orchestration. Turborepo provides:

- **Parallel Execution**: Runs tasks across workspaces in parallel
- **Intelligent Caching**: Skips tasks that haven't changed
- **Task Dependencies**: Automatically handles build order based on workspace dependencies
- **Graceful Shutdown**: Handles Ctrl+C gracefully for all services

The Turborepo configuration is in `turbo.json`. All tasks respect workspace dependencies and run in the correct order.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [tRPC OpenAPI Extension](https://github.com/mcampa/trpc-to-openapi)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
