# Deployment Setup

This project is configured for full-stack deployment on [Render](https://render.com), hosting the Frontend, Backend, and Database services.

> [!NOTE]
> Vercel is NOT used for production deployment. It is currently used for testing purposes only.

## Architecture

The `render.yaml` file defines the following services:

### 1. Database (`sportsprophecy-db`)
- **Type**: PostgreSQL
- **Plan**: Free Tier
- **Database Name**: `sportsprophecy`
- **User**: `sportsprophecy`

### 2. Backend Service (`spa-backend`)
- **Type**: Web Service
- **Runtime**: Node.js 22
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && node dist/scripts/db-init.js && node dist/index.js`
- **Environment Variables**:
  - `DATABASE_URL`: Connection string from `sportsprophecy-db`
  - `REDIS_URL`: External Redis connection string
  - `JWT_SECRET`: Auto-generated
  - `NODE_ENV`: `production`

### 3. Frontend Service (`spa-frontend`)
- **Type**: Web Service
- **Runtime**: Node.js 22
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `cd frontend && npm start`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: Points to the backend service (e.g., `https://spa-backend-mvb1.onrender.com`)

## Deployment Process

1. **Push to Main**: The configuration tracks the `main` branch. Pushing to this branch triggers automatic deployments.
2. **Infrastructure as Code**: Render uses the `render.yaml` file in the root directory to provision and configure all services automatically (Blueprints).

## Local Development vs. Production

- **Local**: Uses local PostgreSQL and Redis (or Docker).
- **Production**: Uses Render internals for Postgres and an external provider (Upstash) for Redis, as configured in `render.yaml`.
