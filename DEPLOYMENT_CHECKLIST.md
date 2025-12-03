# DEPLOYMENT CHECKLIST

Use this checklist before deploying to production.

## Pre-Deployment

- [ ] All tests passing locally
- [ ] Version number updated in:
  - [ ] `package.json`
  - [ ] `backend/package.json`
  - [ ] `src/screens/HelpSupportScreen.js`
  - [ ] `README.md`
- [ ] Changelog updated in README.md
- [ ] Full backup created
- [ ] Environment variables verified

## Backend Deployment

- [ ] Navigate to `backend/` directory
- [ ] Run `npx vercel --prod`
- [ ] Verify deployment to `sportsprophecy-backend` project
- [ ] Note the deployment URL
- [ ] Test backend API endpoint

## Frontend Deployment

- [ ] Update `.env.production` with new backend URL
- [ ] Verify `.vercel/project.json` shows `"projectName":"dist"`
- [ ] If not, run: `rm -rf .vercel && npx vercel link --project=dist --yes`
- [ ] Run `npx vercel --prod`
- [ ] Verify deployment to `dist` project

## Post-Deployment Verification

- [ ] Visit `www.sportsprophecyapp.com`
- [ ] Verify version number (Help & Support)
- [ ] Test login/registration
- [ ] Test making a prediction
- [ ] Test entering weekly draw
- [ ] Check Player Profile (bell icon)
- [ ] Check Help & Support page
- [ ] Check How to Play page
- [ ] Verify crown balance displays in header
- [ ] Test logout functionality
- [ ] Check API connectivity

## Rollback Plan (if needed)

If deployment fails:
1. Note the previous deployment URL from Vercel dashboard
2. Revert to previous deployment in Vercel UI
3. Or redeploy previous version from git

## Notes

- **DO NOT** create new Vercel projects
- **ALWAYS** deploy backend before frontend
- **VERIFY** project links before deploying
- **TEST** thoroughly after deployment
