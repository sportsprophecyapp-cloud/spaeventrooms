# Deployment Setup: SportsProphecyApp

This project is deployed on **Render** using a full-stack blueprint configuration.

## 🚀 Live Update Workflow
The project uses a custom deployment script to ensure all changes are staged, committed, and pushed to Render in a single, consistent step.

### How to Deploy:
1. Open your terminal in the root folder.
2. Run the following command:
   ```bash
   bash deploy.sh "Your descriptive commit message"
   ```

## 🏗 Infrastructure (Render Blueprints)
Defined in `render.yaml`:
1. **Database (`sportsprophecy-db`)**: PostgreSQL.
2. **Backend (`spa-backend`)**: Node.js/Express.
   - Build: `cd backend && npm install && npm run build`
   - Start: `cd backend && npm start`
3. **Frontend (`spa-frontend`)**: Next.js.
   - Build: `cd frontend && npm install && npm run build`
   - Start: `cd frontend && npm start`

## 🔑 Environment Variables
Must be configured in the Render Dashboard:
- `DATABASE_URL`: Postgres connection string.
- `REDIS_URL`: External Redis connection.
- `THE_ODDS_API_KEY`: Can be a single key or a comma-separated list (`key1,key2`).
- `NEXT_PUBLIC_API_URL`: Points to the backend service URL.
