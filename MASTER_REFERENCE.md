# 📌 Project Master Reference: Events Arena

## 🛠 Project Identity & Tech Stack
- **Project Name:** Events Arena
- **Frontend:** Next.js (located in `/frontend`). Styling: Outfit Font, Glassmorphism.
- **Backend:** Node.js/Express (located in `/backend`).
- **Real-time:** Socket.io (Instantly broadcasts Chat, Scores, and Creator Events).
- **Gamification:** Sponsor & Draw Hub (`/draw`) powered by Prize Tickets and Admin-verified partner campaigns.
- **Social Proof:** Winner Feedback System with star ratings, testimonials, and viral sharing incentives (X, WhatsApp, native).
- **Brand Trust:** Integrated **Founder's Letter** on the landing page to establish authenticity and vision.
- **Referral Engine:** Unique 8-character codes, tiered rewards, and milestone tracking (4-tier path: Recruiter, Guardian, Influencer, Master).
- **Profile System:** Dynamic routing at `/profile/[userId]` with **Grand Champion** honors, Hall of Fame, and the premium **Referral Roadmap**.

## 📡 Data Architecture (API & Limits)
- **Resilient Dual-API Sync:** API-Football (20m) + The Odds API (4h Savings Mode).
- **Sequential Key Rotation:** Supports comma-separated lists for both `THE_ODDS_API_KEY` and `API_FOOTBALL_KEY`.
- **Fail-Over Logic:** Automatic rotation to the next key index on 401/429 errors.
- **Accuracy:** Frontend fuzzy-match logic ensures unique match cards across live API providers.
- **Logo Integrity System**: Finalized. Powered by `backend/src/data/logo_manifest.json` for 100% reliable local production synchronization.
- **Payload Limits**: Backend `express.json` is set to **50MB** to support high-resolution sponsor design uploads.

## 🚀 Deployment & Build Rules
- **Method:** `./deploy.sh "message"` (Run from root only).
- **CSS Rule:** CRITICAL. Always use unique filenames for CSS modules (e.g., `wizard.module.css`) instead of `page.module.css` to prevent Render build cache conflicts.
- **Transmission:** Every POST request must include an `AbortController` with a 10s timeout and a dedicated state reset.

## 📝 Persistent AI Instructions
1. **Supporter Identity:** Always use "Supporter" branding for users.
2. **Room Isolation:** Maintain strict separation between Pure Soccer (`/rooms/soccer`) and Interactive Creator Hubs.
3. **Regionally Intelligent:** Every UI text string must pass through the `useLanguage()` hook.
4. **Safety Buffer:** Keep schedulers 25% under free-tier limits to allow for manual admin refreshes.
5. **Sponsor Review:** Manual approval is required for all new applications before they go live in an arena.

## 📧 Email Architecture
- **General Inquiries & Privacy:** `contact@sportsprophecyapp.com` (Used for Corporate, Legal, and Support).
- **Sales & Partnerships:** `partnerships@sportsprophecyapp.com` (Exclusively for Sponsor onboardings and brand deals).
