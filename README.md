# Chronos

Chronos is a modern time management web application built as a monorepo with Next.js and tRPC. It provides team-based time tracking and scheduling capabilities with role-based access control.

## Architecture

This project is structured as a monorepo with the following components:

- **Web App** (`apps/web/`) - Next.js frontend application
- **API** (`apps/api/`) - tRPC backend server
- **Data Layer** (`packages/data/`) - Shared data access layer
- **Supabase Integration** (`packages/supabase/`) - Database and authentication
- **Types** (`packages/types/`) - Shared TypeScript types

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Backend**: tRPC for type-safe APIs with OpenAPI REST endpoints
- **Server**: Fastify with tRPC adapter
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk with Supabase integration
- **Styling**: Tailwind CSS
- **Package Manager**: Bun
- **Deployment**: Docker

## Getting Started

First, install dependencies using bun:

```bash
bun install
```

Then, run the development servers:

```bash
# Start the API server
bun --filter @chronos/api dev

# Start the web application (in another terminal)
bun --filter @chronos/web dev
```

The web application will be available at [http://localhost:3000](http://localhost:3000).

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
│   └── types/        # Shared TypeScript types
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
  - User management with RLS policies
  - Team and team member management
  - Role-based access control
  - Invitation system

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [tRPC OpenAPI Extension](https://github.com/mcampa/trpc-to-openapi)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
