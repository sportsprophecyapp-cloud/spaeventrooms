# 📌 Project Master Reference: Events Arena
**Version 4.0.0**

## 🛠 Project Identity & Tech Stack
- **Project Name:** Events Arena
- **Frontend:** Next.js. Deployed on **Render (Free)**.
- **Backend:** Node.js/Express. Deployed on **Render (Free)**.
- **Database:** PostgreSQL on **Neon (Free)**.
- **Immediate Recovery**: Services migrated to free tiers with Neon DB for sustainability.
- **Multi-Sport Support**: Native support for Soccer and NHL via independent table structures (`soccer_matches` vs `nhl_matches`) to ensure robust $0 scaling.

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
- **Auto-Heal Engine**: `SystemMaintenanceService` runs on every startup to resolve backlogs and force-close matches.
- **Resolution Safety**: 3-hour time-based fallback for all matches ensuring prompt resolution.
- **Key Management:** Supports comma-separated lists for `THE_ODDS_API_KEY`.
- **Logo Integrity System**: Powered by `logo_manifest.json` for 100% reliable production synchronization.
- **Payload Limits**: Backend `express.json` is set to **50MB**.

## 🏢 SPONSOR & PARTNER FLOW
1. **Application:** Creative Studio form at `/sponsors/apply`.
2. **Review:** Admin Hub diagnostic view with stack-trace error reporting.
3. **Deployment:** Instant 1:1 sync of live room placements and draw creation.
4. **Performance:** Automated interaction tracking (Impressions/Clicks) with print-ready reports.

## 🚀 Deployment & Build Rules
- **Strategy:** All services (Backend, Frontend) on **Render Free Tier**.
- **Database:** Migrated to **Neon (Free)** for permanent $0 operations.
- **CSS Rule:** CRITICAL. Always use unique filenames for CSS modules (e.g., `wizard.module.css`) to prevent build cache conflicts.
- **Abort Logic:** Every POST request must include an `AbortController` with a 10s timeout.

## 📝 Persistent AI Instructions
1. **Supporter Identity:** Always use "Supporter" branding for users.
2. **Regionally Intelligent:** Every UI text string must pass through the `useLanguage()` hook.
3. **Safety Buffer:** Schedulers should run at 75% capacity to ensure stability.
4. **Sponsor Review:** Manual approval is required for all new applications.

## 📈 Business Intelligence & Reporting
- **Daily Arena Report:** Run `npx ts-node backend/src/scripts/arena-stats.ts` to see real-time user growth, prediction volume, economy health, and top performers.
- **Safety Logs:** Always check Render logs for "System Maintenance Complete" to verify Auto-Heal success.

## 📧 Email Architecture
- **General Inquiries & Privacy:** `contact@sportsprophecyapp.com`
- **Sales & Partnerships:** `partnerships@sportsprophecyapp.com`

Pribadi.
