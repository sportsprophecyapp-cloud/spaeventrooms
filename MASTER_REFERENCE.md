# 📌 Project Master Reference: Events Arena
**Version 3.4.6**

## 🛠 Project Identity & Tech Stack
- **Project Name:** Events Arena
- **Frontend:** Next.js (located in `/frontend`). Styling: Outfit Font, Glassmorphism.
- **Backend:** Node.js/Express (located in `/backend`).
- **Real-time:** Socket.io (Instantly broadcasts Chat, Scores, and Creator Events).
- **Gamification:** Sponsor & Draw Hub (`/draw`) powered by Prize Tickets and Admin-verified partner campaigns.
- **Social Proof:** Winner Feedback System with star ratings, testimonials, and viral sharing incentives (X, WhatsApp, native).
- **Brand Trust:** Integrated **Founder's Letter** on the landing page to establish authenticity and vision.

## 💰 THE EVENTS ECONOMY
- **Dual-Currency Model:** 
    - **Tokens (Gold):** Acquired via login/predictions. Used for standard shop items.
    - **Prize Tickets (Silver):** Acquired through streaks and referrals. Used for draw entries.
- **Achievement Gating:** Core "Earn, Don't Buy" rule. High-tier items (Grand Champion, Network Master) are flagged `is_achievement_reward` and are hard-blocked from purchase.
- **Loot Showcase:** Dynamic dashboard component that previews upcoming rewards to drive retention.

## 📡 Data Architecture (API & Limits)
- **Primary Data Source:** The Odds API (Optimized "Targeted Polling" Scheduler).
- **Key Management:** Supports comma-separated lists for `THE_ODDS_API_KEY`.
- **Logo Integrity System**: Powered by `backend/src/data/logo_manifest.json` for 100% reliable local production synchronization.
- **Payload Limits**: Backend `express.json` is set to **50MB** to support high-resolution sponsor design uploads.

## 🏢 SPONSOR & PARTNER FLOW
1. **Application:** Creative Studio form at `/sponsors/apply`.
2. **Review:** Admin Hub diagnostic view with stack-trace error reporting.
3. **Deployment:** Instant 1:1 sync of live room placements and draw creation.
4. **Performance:** Automated interaction tracking (Impressions/Clicks) with print-ready reports.

## 🚀 Deployment & Build Rules
- **Method:** Git push to `main` triggers Render deployment for both Backend and Frontend.
- **CSS Rule:** CRITICAL. Always use unique filenames for CSS modules (e.g., `wizard.module.css`) to prevent Render build cache conflicts.
- **Abort Logic:** Every POST request must include an `AbortController` with a 10s timeout.

## 📝 Persistent AI Instructions
1. **Supporter Identity:** Always use "Supporter" branding for users.
2. **Regionally Intelligent:** Every UI text string must pass through the `useLanguage()` hook.
3. **Safety Buffer:** Keep schedulers 25% under free-tier limits.
4. **Sponsor Review:** Manual approval is required for all new applications.

## 📧 Email Architecture
- **General Inquiries & Privacy:** `contact@sportsprophecyapp.com`
- **Sales & Partnerships:** `partnerships@sportsprophecyapp.com`

Pribadi.
