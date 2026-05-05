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
3. **Render** will automatically rebuild the active stack (Backend -> Frontend).

## 🏗 Infrastructure
1. **Database (`sportsprophecy-db`)**: PostgreSQL on **Neon (Free)**. *Note: Render legacy databases must be manually deleted to avoid ghost charges.*
2. **Backend (`spa-backend`)**: 
   - Platform: Render (Free Plan).
   - Features: Auto-resolves backlog on startup and maintains a custom Keep-Alive cron that pings `/health` to prevent sleeping.
3. **Frontend (`spa-frontend`)**: 
   - Platform: Render (Free Plan).
   - Start Command: `cd frontend && npm start`
4. **Mobile API Routing**:
   - The custom domain `api.sportsprophecyapp.com` is **deprecated**. The mobile application must point directly to the Render URL (`https://spa-backend-mvb1.onrender.com/api`) to fit within free-tier limits.

## 🔑 Required Environment Variables

### Backend
- `THE_ODDS_API_KEY`: Comma-separated list.
- `GOOGLE_CLIENT_ID`, `JWT_SECRET`.
- `DATABASE_URL`, `REDIS_URL`.
- `RENDER_EXTERNAL_URL`: Points to the backend (e.g., `https://spa-backend.onrender.com`).

### Frontend
- `NEXT_PUBLIC_API_URL`: Points to the Backend URL.
