# 📌 Project Master Reference: Events Arena

## 🛠 Project Identity & Tech Stack
- **Project Name:** Events Arena (formerly Sports Prophecy)
- **Frontend:** Next.js (located in `/frontend`). Styling: Outfit Font, Glassmorphism.
- **Backend:** Node.js/Express (located in `/backend`).
- **Real-time:** Socket.io (Instantly broadcasts Chat, Scores, and Creator Events).

## 📡 Data Architecture (API & Limits)
- **Dual-API Sync:** API-Football (15m) + The Odds API (30m).
- **Smart Key Rotation:** 4+ keys with automatic failover on Status 429.
- **Source of Truth:** All data cached in PostgreSQL `soccer_matches`.

## 🚀 Deployment & Build Rules
- **Method:** `./deploy.sh "message"` (Run from root only).
- **CSS Rule:** CRITICAL. Always use unique filenames for CSS modules (e.g., `wizard.module.css`) instead of `page.module.css` to prevent Render build cache conflicts.
- **Relative Paths:** Next.js App Router requires strict relative pathing for context imports (e.g., `../../../context/AuthContext`).

## 📝 Persistent AI Instructions
1. **Supporter Identity:** Always use "Supporter" branding for users.
2. **Creator Toolset:** Respect the isolation of the OBS Overlay (`/overlay`) and Creator Remote (`/creator`) routes.
3. **No Mock Data:** Only use live API data for events.
4. **Keep-Alive:** Maintain the dual-ping service to prevent Render free-tier sleep.
