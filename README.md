# Sports Prophecy Rebuild

A multi-room prediction platform architecture.

## Structure

- **frontend/**: Next.js 14+ application.
- **backend/**: Node.js + Express application.
- **legacy_backup/**: Archived codebase.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

### Setup

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `backend/.env` and `frontend/.env.local`.
   - Update database credentials.

3. **Database Migration**
   ```bash
   cd backend
   npm run build
   # Run the migration script (ensure DB is running)
   npx ts-node src/scripts/migrate.ts
   ```

4. **Running Locally**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

## Architecture

- **Room Isolation**: Each room (e.g., `soccer`) has its own folder in `backend/src/rooms/` and `frontend/app/rooms/`.
- **Extraction**: To spinoff a room, copy the respective folders to a new repo.

## Deployment

- **Backend**: Ready for Render (see `render.yaml`) or Docker (`backend/Dockerfile`).
- **Frontend**: Ready for Vercel (see `vercel.json`).
