---
description: Deploy updates to production (Render)
---

# Deployment Procedure (Render)

We use **Render Blueprints** for deployment relative to the `render.yaml` configuration in the root directory.

## Architecture
- **Repo**: `sportsprophecyapp-cloud/spaeventrooms`
- **Branch**: `main`
- **Services**:
    - `spa-backend`: Node.js API (Backend)
    - `spa-frontend`: Next.js Web App (Frontend)
    - `sportsprophecy-db`: PostgreSQL Database

## Deployment Steps

The deployment process is **Git-based and Automated**.

### 1. Development & Testing
- Make changes locally.
- Run `npm run build` in `frontend` and `backend` to ensure no errors.
- Test locally using `npm run dev`.

### 2. Deployment
- **Commit** your changes.
- **Push** to the `main` branch.

```bash
git add .
git commit -m "feat: your feature description"
git push origin main
```

### 3. Verification
Render will automatically detect the push and start building both services defined in `render.yaml`.

- **Check Render Dashboard**: Verify build status.
- **Backend URL**: `https://spa-backend-mvb1.onrender.com` (from `render.yaml` env var, confirmation required).
- **Frontend URL**: `https://www.sportsprophecyapp.com` (mapped via Render custom domains).

## Database Migrations

The backend `startCommand` automatically runs `dist/scripts/db-init.js` on every deployment.
- This script handles `CREATE TABLE IF NOT EXISTS` and safe `ALTER TABLE` migrations.
- **Note**: If you need to wipe/reset the DB, you must access the Render Shell or connect via external tool.

## Troubleshooting

### Build Failures
- Check `render.yaml` matches `package.json` scripts.
- Ensure `tsconfig.json` correctly outputs to `dist/` (backend) or `.next/` (frontend).

### "Table Not Found" Errors
- The `db-init.js` script runs relative to the `dist` folder. Ensure your TS files in `src/scripts` are included in the build.
