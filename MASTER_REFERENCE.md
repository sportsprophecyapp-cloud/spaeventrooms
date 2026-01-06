# 📌 Project Master Reference: SportsProphecyApp

## 🛠 Project Identity & Boundaries
- **Project Name:** SportsProphecyApp
- **Root Path:** `/Users/williamcommu/Desktop/mobile`
- **Isolation Rule:** CRITICAL. DO NOT access or assume context from other projects. Stay within this root folder.
- **Type:** Full-stack Mobile/Web Prediction Platform (Gaming/Esports Aesthetic).

## 💻 Tech Stack
- **Frontend:** Next.js (located in `/frontend`)
- **Backend:** Node.js/Express (located in `/backend`)
- **Database:** PostgreSQL (hosted on Render)
- **Cache:** Redis (Upstash)
- **Real-time:** Socket.io

## 🚀 Deployment Process (Live Site)
- **Method:** One-click custom deploy script.
- **Command:** `bash deploy.sh "your commit message"`
- **Prompt:** Always run this from the main terminal prompt (`192:mobile...`). 
- **⚠️ Important:** DO NOT type `sh` or `bash` by themselves before running the script, as this enters a sub-shell and prevents the deploy from starting.
- **Trigger:** Any push to the `main` branch triggers an automatic build/deploy on Render.
- **Production URL:** https://www.sportsprophecyapp.com

## 📂 Key Directories
- `/frontend`: Next.js web application.
- `/backend`: API services, Socket logic, and DB Management.
- `deploy.sh`: The master deployment script.

## 📝 Persistent AI Instructions
1. **Reference First:** Check this file at the start of every session.
2. **Methodical Updates:** After making changes, use `bash deploy.sh` to update the live site.
3. **Smart Cache:** Always query the DB first; only use APIs for updates during live game windows.
4. **Key Rotation:** Support multiple API keys in `.env` (comma-separated).
