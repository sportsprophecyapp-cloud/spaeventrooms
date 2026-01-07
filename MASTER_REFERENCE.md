# 📌 Project Master Reference: Events Arena

## 🛠 Project Identity & Tech Stack
- **Project Name:** Events Arena (formerly Sports Prophecy)
- **Frontend:** Next.js (located in `/frontend`). Styling: Outfit Font, Glassmorphism.
- **Backend:** Node.js/Express (located in `/backend`).
- **Real-time:** Socket.io (Instantly broadcasts Chat, Scores, and Creator Events).

## 📡 Data Architecture (API & Limits)
- **Resilient Dual-API Sync:** API-Football (20m) + The Odds API (45m).
- **Sequential Key Rotation:** Supports comma-separated lists for both `THE_ODDS_API_KEY` and `API_FOOTBALL_KEY`.
- **Fail-Over Logic:** Automatic rotation to the next key index on 401/429 errors.
- **Accuracy:** Frontend fuzzy-match logic (`home-away-time`) ensures unique match cards across multiple APIs.

## 🚀 Deployment & Build Rules
- **Method:** `./deploy.sh "message"` (Run from root only).
- **CSS Rule:** CRITICAL. Always use unique filenames for CSS modules (e.g., `wizard.module.css`) instead of `page.module.css` to prevent Render build cache conflicts.
- **Transmission:** Every POST request must include an `AbortController` with a 10s timeout and a dedicated state reset.

## 📝 Persistent AI Instructions
1. **Supporter Identity:** Always use "Supporter" branding for users.
2. **Room Isolation:** Maintain strict separation between Pure Soccer (`/rooms/soccer`) and Interactive Creator Hubs.
3. **Regionally Intelligent:** Every UI text string must pass through the `useLanguage()` hook.
4. **Safety Buffer:** Keep schedulers 25% under free-tier limits to allow for manual admin refreshes.
