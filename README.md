# Events Arena (Sports Prophecy)

**Version**: 3.2.0  
**Release**: January 9, 2026

A multi-room prediction platform with premium UI, Google Login, and real-time chat.

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

## Data Modes
- **Real Data**: Active when valid keys (`THE_ODDS_API_KEY`) are present in `.env`.
- **Mock Data**: Automatically activates when keys are missing. Populates the app with realistic demo data for testing.

## Deployment
See [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md) for full details.

- **Backend**: Hosted on Render.
- **Frontend**: Hosted on Render.
- **Database**: Hosted on Render (PostgreSQL).
- **Testing**: Vercel is used for testing environments only.
