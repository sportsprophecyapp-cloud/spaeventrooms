# 📌 Project Master Reference: SportsProphecyApp

## 🛠 Project Identity & Boundaries
- **Project Name:** SportsProphecyApp
- **Root Path:** `/Users/williamcommu/Desktop/mobile`
- **Isolation Rule:** CRITICAL. Stay within this root folder.
- **Type:** Full-stack Mobile/Web Prediction Platform.

## 💻 Tech Stack
- **Frontend:** Next.js (located in `/frontend`). Styling: Outfit Font, Glassmorphism.
- **Backend:** Node.js/Express (located in `/backend`).
- **Database:** PostgreSQL (Render).
- **Real-time:** Socket.io (Instantly broadcasts Chat, Scores, and Polls).

## 📡 Data Architecture (API & Limits)
- **Dual-API Sync:** Uses both **API-Football** and **The Odds API** for maximum coverage.
- **High-Speed Scheduler:** 
    - API-Football: Refreshes every **15 minutes** (96 calls/day).
    - The Odds API: Refreshes every **30 minutes** (48 calls/day).
- **Smart Key Rotation:** 
    - The system supports multiple keys in `THE_ODDS_API_KEY` (comma-separated).
    - **Automatic Failover:** If a key hits its 500-request limit (Status 429), the backend instantly rotates to the next available key.
- **Source of Truth:** All API data is cached in PostgreSQL `soccer_matches`. Users only query the DB, never the external APIs.

## 🚀 Deployment Process (Live Site)
- **Method:** `bash deploy.sh "your message"` (Use from main prompt only).
- **Environment:** Render (Production), Vercel (Testing).
- **Trigger:** Pushes to `main` branch trigger automatic build/deploy.

## 📝 Persistent AI Instructions
1. **Reference First:** Check this file at the start of every session.
2. **Safe Code:** Always verify Typescript interfaces before updating components.
3. **No Mock Data:** Only use live API data for games and prophecies.
4. **Stuck-Proof UI:** Ensure all modals/pages have a back button or click-outside-to-close.
