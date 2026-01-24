# Deployment Setup: Events Arena

This project uses a **Full-Production Blueprint Strategy** on **Render**:
- **Backend**: **Starter Plan ($7/mo)**. Ensures 24/7 uptime for scores and schedulers.
- **Frontend**: **Starter Plan ($7/mo)**. Bypasses Free Tier minute limits and ensure 100% availability.
- **Database**: **Starter Plan ($7/mo)**. Essential for production—ensures data is **NOT deleted** after 90 days.

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
