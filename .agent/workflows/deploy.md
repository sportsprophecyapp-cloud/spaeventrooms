---
description: Deploy updates to production (www.sportsprophecyapp.com)
---

# Deployment Workflow for Sports Prophecy

**CRITICAL**: This app uses **existing Vercel projects** with custom domains. Do NOT create new projects.

## Production Setup

### Existing Vercel Projects
- **Frontend**: `dist` → www.sportsprophecyapp.com
- **Backend**: `sportsprophecy-backend` → api.sportsprophecyapp.com

### Environment Variables
- **Backend** (`backend/.env`):
  - `MONGODB_URI`: MongoDB connection string
  - `THE_ODDS_API_KEY`: The Odds API key
  - `PORT`: 3001

- **Frontend** (`.env.production`):
  - `EXPO_PUBLIC_API_URL`: Backend API URL (update after backend deployment)

---

## Deployment Steps

### Step 1: Deploy Backend First

```bash
# Navigate to backend directory
cd backend

# Deploy to production (links to existing 'sportsprophecy-backend' project)
npx vercel --prod
```

**Expected Output**:
- ✅ Should deploy to existing `sportsprophecy-backend` project
- ✅ Will be accessible at `api.sportsprophecyapp.com`
- 📝 Note the deployment URL (e.g., `sportsprophecy-backend-xxxxx.vercel.app`)

### Step 2: Update Frontend API URL

```bash
# Return to project root
cd ..

# Edit .env.production
# Update EXPO_PUBLIC_API_URL with the new backend URL from Step 1
```

Example:
```bash
EXPO_PUBLIC_API_URL=https://sportsprophecy-backend-ga4vadwjo.vercel.app/api
```

### Step 3: Verify Frontend Link

```bash
# Check if .vercel directory exists and is linked to 'dist' project
cat .vercel/project.json
```

**Expected Output**:
```json
{"projectId":"...","orgId":"...","projectName":"dist"}
```

**If NOT linked to 'dist' project**:
```bash
# Remove incorrect link
rm -rf .vercel

# Link to existing 'dist' project
npx vercel link --project=dist --yes
```

### Step 4: Deploy Frontend

```bash
# Deploy to production (should use 'dist' project)
npx vercel --prod
```

**Expected Output**:
- ✅ Should deploy to existing `dist` project
- ✅ Will be accessible at `www.sportsprophecyapp.com`

---

## Verification Checklist

After deployment, verify:

- [ ] Backend is accessible at `api.sportsprophecyapp.com`
- [ ] Frontend is accessible at `www.sportsprophecyapp.com`
- [ ] Version number shows 2.1.0 (check Help & Support screen)
- [ ] New features are visible:
  - [ ] Player Profile (bell icon in header)
  - [ ] Help & Support (More → Help & Support)
  - [ ] How to Play (Landing page link, More menu)
  - [ ] Crown balance in header
- [ ] API calls work (test login, predictions, etc.)

---

## Troubleshooting

### Problem: Deployed to wrong project

**Solution**:
```bash
# Remove .vercel directory
rm -rf .vercel

# Link to correct project
npx vercel link --project=dist --yes  # for frontend
# OR
cd backend && npx vercel link --project=sportsprophecy-backend --yes  # for backend
```

### Problem: Custom domain not working

**Solution**:
1. Go to Vercel Dashboard
2. Select the correct project (`dist` or `sportsprophecy-backend`)
3. Go to Settings → Domains
4. Verify custom domain is configured
5. If missing, add the domain

### Problem: Frontend can't connect to backend

**Solution**:
1. Check `.env.production` has correct `EXPO_PUBLIC_API_URL`
2. Verify backend is deployed and accessible
3. Redeploy frontend after updating API URL

---

## Important Notes

⚠️ **DO NOT**:
- Create new Vercel projects
- Answer "No" when asked to link to existing project
- Deploy without checking `.vercel/project.json` first

✅ **DO**:
- Always deploy backend first
- Update frontend API URL after backend deployment
- Verify `.vercel` directory is linked to correct project
- Test the live site after deployment

---

## Quick Reference

**Backend Deploy**:
```bash
cd backend && npx vercel --prod
```

**Frontend Deploy**:
```bash
# Ensure linked to 'dist' project first
npx vercel link --project=dist --yes
npx vercel --prod
```

**Check Current Link**:
```bash
cat .vercel/project.json
```

**Relink to Correct Project**:
```bash
rm -rf .vercel && npx vercel link --project=dist --yes
```
