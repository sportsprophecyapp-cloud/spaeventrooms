# 📌 Project Master Reference: Events Arena

## 🛠 Project Identity & Tech Stack
- **Project Name:** Events Arena (formerly Sports Prophecy)
- **Frontend:** Next.js (located in `/frontend`). Styling: Outfit Font, Glassmorphism.
- **Backend:** Node.js/Express (located in `/backend`).
- **Real-time:** Socket.io (Instantly broadcasts Chat, Scores, and Creator Events).

## 📡 Data Architecture (API & Limits)
- **Resilient Dual-API Sync:** API-Football (15m) + The Odds API (30m).
- **Sequential Key Rotation:** Supports comma-separated lists for both `THE_ODDS_API_KEY` and `API_FOOTBALL_KEY`.
- **Fail-Over Logic:** Automatic rotation to the next key index on 401/429 errors.
- **Source of Truth:** All data cached in PostgreSQL `soccer_matches`.

## 🚀 Deployment & Build Rules
- **Method:** `./deploy.sh "message"` (Run from root only).
- **CSS Rule:** CRITICAL. Always use unique filenames for CSS modules (e.g., `wizard.module.css`) instead of `page.module.css` to prevent Render build cache conflicts.
- **Relative Paths:** Next.js App Router requires strict relative pathing for context imports.

## 📝 Persistent AI Instructions
1. **Supporter Identity:** Always use "Supporter" branding for users.
2. **Creator Toolset:** Respect the isolation of the OBS Overlay (`/overlay`) and Creator Remote (`/creator`) routes.
3. **No Mock Data:** Only use live API data for events.
4. **Resilience:** Maintain the sequential retry logic for data sync to maximize uptime on free-tier APIs.
