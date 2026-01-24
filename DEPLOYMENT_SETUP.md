# Deployment Setup: Events Arena

This project uses a **Single-Platform Multi-Tier Strategy** on **Render**:
- **Backend**: **Starter Plan ($7/mo)**. Ensures 24/7 uptime for scores and schedulers.
- **Frontend**: **Starter Plan ($7/mo)** (Currently paid for immediate recovery).
    - *Note: Can be moved to **Free Tier** on Feb 1st without hitting limits.*

## 🚀 Live Update Workflow
The project uses a unified deployment script for instant updates.

### How to Deploy:
1. Open your terminal in the root folder.
2. Run exactly this command (No `sh` or `bash` first):
   ```bash
   ./deploy.sh "Your descriptive commit message"
   ```
3. **Render** will automatically rebuild both the Backend and Frontend.

## 🏗 Infrastructure
1. **Database (`sportsprophecy-db`)**: PostgreSQL on Render.
2. **Backend (`spa-backend`)**: 
   - Platform: Render (Starter Plan).
   - Start Command: `cd backend && node dist/scripts/db-init.js && node dist/index.js`
3. **Frontend (`spa-frontend`)**: 
   - Platform: Render (Free Tier).
   - Start Command: `cd frontend && npm start`

## 🔑 Required Environment Variables

### Backend
- `THE_ODDS_API_KEY`: Comma-separated list.
- `GOOGLE_CLIENT_ID`, `JWT_SECRET`.
- `DATABASE_URL`, `REDIS_URL`.
- `RENDER_EXTERNAL_URL`: Points to the backend (e.g., `https://spa-backend.onrender.com`).

### Frontend
- `NEXT_PUBLIC_API_URL`: Points to the Backend URL.
