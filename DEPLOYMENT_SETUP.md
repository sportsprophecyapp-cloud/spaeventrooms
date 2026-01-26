# Deployment Setup: Events Arena

This project uses a **Resilient Blueprint Strategy** on **Render**:
- **Backend**: **Free Plan ($0/mo)**. Requires manual `DATABASE_URL` (Neon) in environment settings.
- **Frontend**: **Free Plan ($0/mo)**.
- **Database**: **Neon (Postgres 17)**. Free tier, hosted on AWS.

## 🚀 Live Update Workflow
The project uses a unified deployment script for instant updates.

### How to Deploy:
1. Open your terminal in the root folder.
2. Run exactly this command:
   ```bash
   ./deploy.sh "Your descriptive commit message"
   ```
3. **Render** will automatically rebuild the entire stack (DB -> Backend -> Frontend).

## 🏗 Infrastructure
1. **Database (`sportsprophecy-db`)**: PostgreSQL on Render (Starter).
2. **Backend (`spa-backend`)**: 
   - Platform: Render (Starter Plan).
   - Features: Auto-resolves backlog on startup.
3. **Frontend (`spa-frontend`)**: 
   - Platform: Render (Starter Plan).
   - Start Command: `cd frontend && npm start`

## 🔑 Required Environment Variables

### Backend
- `THE_ODDS_API_KEY`: Comma-separated list.
- `GOOGLE_CLIENT_ID`, `JWT_SECRET`.
- `DATABASE_URL`, `REDIS_URL`.
- `RENDER_EXTERNAL_URL`: Points to the backend (e.g., `https://spa-backend.onrender.com`).

### Frontend
- `NEXT_PUBLIC_API_URL`: Points to the Backend URL.
