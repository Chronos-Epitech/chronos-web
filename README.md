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

# Run API tests (requires API server to be running)
bun run test:api
```

## API Documentation

The API server provides both tRPC and REST endpoints:

- **tRPC Endpoints**: Available at `http://localhost:3001/trpc`
- **REST API**: Available at `http://localhost:3001/api` (OpenAPI compliant)
- **Swagger Documentation**: Available at `http://localhost:3001/docs`
- **OpenAPI Spec**: Available at `http://localhost:3001/openapi.json`

The REST API is automatically generated from tRPC procedures using the `trpc-to-openapi` extension, providing full OpenAPI compliance with automatic Swagger documentation.

## API Testing

This project uses [StepCI](https://stepci.com/) for automated API testing. StepCI is a modern API testing tool that validates REST endpoints, schemas, and workflows.

### Running API Tests

Make sure the API server is running first, then run the tests with your authentication token:

```bash
# Start the API server
bun dev

# In another terminal, run the API tests with your auth token
AUTH_TOKEN="your-clerk-jwt-token-here" bun run test:api
```

**Alternative way to pass the token:**

```bash
# Use a local .env.test file
cp .env.test.example .env.test
# Edit .env.test and add your token
source .env.test && bun run test:api
```

### Test Configuration

The API tests are defined in `workflow.yml` at the root of the project. This file contains:

- **23 test steps** covering all major API endpoints
- **Automated dependency management** using JSONPath captures to link test steps
- **Schema validation** ensuring responses match OpenAPI specifications
- **Authentication** using Bearer tokens for protected endpoints

### Test Coverage

The test suite validates the following API endpoints:

- **Teams**: CRUD operations, member management
- **Users**: User creation, updates, deletion
- **Invitations**: Sending and revoking invitations
- **Schedules**: Schedule management, check-in/check-out workflows

### Test Design Decisions

**Why some tests were modified or removed:**

1. **Team Creation Test**: The original test attempted to create a new team with a manager who might already have a team. Since the business logic enforces that a manager can only have one team, the test was modified to use the existing team for CRUD operations instead of creating a new one. This approach:
   - Avoids conflicts with existing data
   - Tests the actual CRUD operations (get, update) which are more important than creation in a test environment
   - Prevents cascade failures when a manager already has a team

2. **Team Deletion Test**: Removed because deleting teams would break dependent tests that rely on team data (team members, schedules). The workflow uses a single test suite where tests run sequentially and share state through captures.

3. **ID Capturing Strategy**: All tests now use JSONPath captures to extract IDs from responses and use them in subsequent requests. This ensures:
   - Tests work with real data from the database
   - No hardcoded test IDs that might not exist
   - Proper test isolation and data flow

4. **User Dependencies**: User-related tests create a new user with a unique email and strong password, then perform CRUD operations on that user. This avoids conflicts with existing users and ensures the password meets Clerk's security requirements.

### Prerequisites for Testing

Before running tests, ensure:

1. **API server is running** at `http://localhost:3001`
2. **Valid authentication token** is available (passed via `AUTH_TOKEN` environment variable)
3. **Database has seed data** including at least one team and manager user
4. **Clerk is configured** and authentication is working

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
- [StepCI Documentation](https://docs.stepci.com/)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
