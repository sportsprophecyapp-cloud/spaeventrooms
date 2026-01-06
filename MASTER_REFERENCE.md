# 📌 Project Master Reference: SportsProphecyApp

## 🛠 Project Identity & Boundaries
- **Project Name:** SportsProphecyApp
- **Root Path:** `/Users/williamcommu/Desktop/mobile`
- **Isolation Rule:** CRITICAL. DO NOT access or assume context from other projects. Stay within this root folder.
- **Type:** Full-stack Mobile/Web Prediction Platform.

## 💻 Tech Stack
- **Frontend:** Next.js (located in `/frontend`)
- **Backend:** Node.js/Express (located in `/backend`)
- **Database:** PostgreSQL (hosted on Render)
- **Cache:** Redis (Upstash)

## 🚀 Deployment Process (Live Site)
- **Platform:** Render (using `render.yaml` Blueprints)
- **Trigger:** Any push to the `main` branch triggers an automatic build/deploy.
- **Production URL:** sportsprophecyapp.com
- **Note:** Vercel is for testing ONLY; Render is for Production.

## 📂 Key Directories
- `/frontend`: Next.js web application.
- `/backend`: API services and database logic.
- `/legacy_backup`: Old versions and backups (for read-only context).

## 📝 AI & Developer Instructions
- **Project Scope:** Always operate within `/Users/williamcommu/Desktop/mobile`.
- **Reference First:** Check this file at the start of every session to confirm project state.
- **No Hallucinations:** Do not assume the existence of files not found via `ls` or `find`.
- **Documentation:** Keep `PROJECT_CONTEXT.md` and `DEPLOYMENT_SETUP.md` updated alongside this file.
- **Security:** Do not expose sensitive credentials or environment variables in public-facing files.
