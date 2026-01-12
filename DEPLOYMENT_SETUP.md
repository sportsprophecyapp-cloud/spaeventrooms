# Deployment Setup: Events Arena

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

### Backend
- `THE_ODDS_API_KEY`: Comma-separated list (e.g., `key1,key2,key3`)
- `GOOGLE_CLIENT_ID`: OAuth 2.0 Client ID from Google Cloud Console
- `JWT_SECRET`: Secret key for JWT token generation
- `DATABASE_URL`: PostgreSQL connection string (auto-provided by Render)
- `REDIS_URL`: Redis connection string (auto-provided by Render)
- `STRIPE_SECRET_KEY`: For automated sponsorship payments
- `API_FOOTBALL_KEY`: Required for live match data synchronizations (Logos are now served locally)
- `RENDER_EXTERNAL_URL`: Points to the backend for the Keep-Alive service

### Frontend
- `NEXT_PUBLIC_API_URL`: Points to the backend URL (e.g., `https://spa-backend.onrender.com`)

### Optional (Email Service)
- `EMAIL_USER`: SMTP username for password reset emails
- `EMAIL_PASS`: SMTP password
- `EMAIL_HOST`: SMTP host (e.g., `smtp.gmail.com`)
- `EMAIL_PORT`: SMTP port (e.g., `587`)
