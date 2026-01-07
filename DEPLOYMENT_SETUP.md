# Deployment Setup: SportsProphecyApp

This project is deployed on **Render** using a full-stack blueprint.

## 🚀 Live Update Workflow
The project uses a custom deployment script to ensure consistency.

### How to Deploy:
1. Open your terminal in the root folder.
2. Run exactly this command (No `sh` or `bash` first):
   ```bash
   ./deploy.sh "Your descriptive commit message"
   ```

## 🏗 Infrastructure (Render Blueprints)
1. **Database (`sportsprophecy-db`)**: PostgreSQL.
2. **Backend (`spa-backend`)**: 
   - Start Command: `cd backend && node dist/scripts/db-init.js && node dist/index.js`
   - Role: Runs the 15m/30m high-speed scheduler and prediction resolver.
3. **Frontend (`spa-frontend`)**: Next.js.

## 🔑 Required Environment Variables
Must be configured in Render Dashboard:
- `THE_ODDS_API_KEY`: Comma-separated list (e.g., `key1,key2,key3`).
- `API_FOOTBALL_KEY`: Single key from api-football.com.
- `STRIPE_SECRET_KEY`: For automated sponsorship payments.
- `RENDER_EXTERNAL_URL`: Points to the backend for the Keep-Alive service.
- `NEXT_PUBLIC_API_URL`: Points to the backend URL for the frontend.
