# Project Context: Events Arena

> [!TIP]
> **AI ASSISTANTS**: Read [AI_HANDOFF.md](file:///Users/williamcommu/Desktop/Sports Prophecy Events Arena/AI_HANDOFF.md) for critical session-start context and architecture notes.

**PROJECT:** Events Arena
**TYPE:** Multi-Event Prediction & Engagement Platform (Sports, TV, Creators)
**PATH:** `/Users/williamcommu/Desktop/Sports Prophecy Events Arena`

## 🚀 CURRENT STATUS (Phase 35 - Painkiller Revenue Pivot ✅)
**Version**: 4.2.0
**Release Date**: May 11, 2026
**Status**: Live on Render. Strategic studio updates pushed to align with the "Painkiller" model. Focus has shifted from general engagement to high-value creator rooms and sponsor-driven revenue.

### ✅ COMPLETED (Phase 35 - Painkiller Revenue Pivot - May 11, 2026):
1.  **Studio Integration**: Updated the platform's positioning within the JustMe Media "Painkiller" portfolio.
2.  **Strategic Documentation**: Finalized the `MARKETING_GROWTH_PLAN.md` and `SPONSOR_STRATEGY_PLAN.md` to prioritize high-ticket influencer contracts.
3.  **Deployment Verification**: Confirmed successful push to production (`spaeventrooms.git`) via the JustMe Media studio terminal.

### ✅ COMPLETED (Phase 34 - True $0 Budget Hardening - May 5, 2026):
1.  **Ghost Billing Elimination**: Confirmed manual deletion of legacy Render PostgreSQL instances and Starter Web Services that were accruing charges despite being removed from the `render.yaml` configuration.
2.  **API Routing & Mobile Sync**: Deprecated the custom domain `api.sportsprophecyapp.com` (which was causing NXDOMAIN crashes) to fit within Render's Free tier limits (max 2 custom domains). Mobile application (`.env.production`) was hardcoded to directly target the Render backend URL (`https://spa-backend-mvb1.onrender.com/api`).
3.  **Keep-Alive Stability**: Fixed the backend cron-job that pings the server every 14 minutes. Added a dedicated `/health` endpoint in `app.ts` to prevent the Keep-Alive engine from triggering silent `404` errors, ensuring the free instances never sleep.

### ✅ COMPLETED (Phase 33 - Viral Growth & Gamification - April 29, 2026):
1.  **Automated Backups**: Replaced manual `pg_dump` with a Node.js cron job that runs nightly at 3:00 AM, saving JSON snapshots to a persistent 1GB Render disk.
2.  **Viral SEO**: Fully integrated OpenGraph, Twitter Cards, a 1200x630 Hero Banner, `sitemap.xml`, and `robots.txt` to maximize organic reach and social "unfurl" graphics.
3.  **UI/UX & Gamification**: Deployed 3D glassmorphic assets for badges/achievements, added a massive glowing CTA to the landing page, and integrated a persistent "Draw Room" ticket icon in the global Navbar.
4.  **Translation Parity**: Fully localized all NHL GameDeck states (e.g., "Season Complete") across English, Indonesian, and Thai.

### ✅ COMPLETED (Phase 32 - NHL Arena Integration - April 29, 2026):
1.  **Additive Architecture**: Deployed `nhl_matches` and `nhl_predictions` tables alongside existing soccer logic to guarantee 0% risk to active user predictions.
2.  **Smart Polling Engine**: Updated `SystemMaintenanceService` and `scheduler.ts` to dynamically poll NHL The Odds API endpoints only when matches are imminent or live.
3.  **UI Extension**: Added NHL Arena directly to the frontend lobby and bridged it into the universal `GameDeck` using dynamic `roomId` routing.

### ✅ COMPLETED (Phase 31 - Site Health Repair - April 11, 2026):
1.  **Match Resolver Confirmed**: `resolveSoccerPredictions()` engine is active and processing predictions correctly.
2.  **Image Compression**: Sponsor apply form now compresses images (logos to 300px, prize banners to 600px at 70% quality) before Base64 storage — preventing 1.4MB blobs in DB.
3.  **Documentation Sync**: `PROJECT_CONTEXT.md` and `QA_CHECKLIST.md` updated to reflect live infrastructure and real stats.

### ✅ COMPLETED (Phase 30 - Cost Optimization & $0 Budget - January 26, 2026):
1.  **Free Tier Migration**:
    - Downgraded Render Backend and Frontend services from Starter to Free plans.
    - Migrated Database from Render Paid to Neon Postgres 17 (AWS US East 1).
2.  **Infrastructure Sustainability**:
    - Eliminated monthly recurring costs to achieve a true $0 budget.
    - Documented "Cold Start" behavior expectations for free tier usage.

### 📦 ARCHIVED HISTORICAL PHASES (Phases 4.2 - 29)
*These phases represent the foundational builds of the platform from January 2026. They have been archived here to keep the context clean for current development.*
1. **Core Prediction Engine**: Tinder-style swipe mechanics, odds API integration, and Match resolution.
2. **Gamification & Economy**: Token shop, cosmetic customization, achievement badges, referral system, and daily logins.
3. **Sponsorship & Prize Draws**: Sponsor application flow, drawing rooms, ticket entry system, and analytics/impression tracking.
4. **Platform Infrastructure**: Google OAuth, chat rooms, automated email hierarchy, UI glassmorphism overhaul, and initial mobile app (EAS) readiness.

### 💡 FUTURE FEATURES PLANNED (Multi-Prediction System):
This roadmap details how we will expand the new swipeable UI to include multiple prediction types per match. Now that the UI foundation is stable, this is our next major task.

*   **Phase 1 (Core + 2 Extras):**
    *   `Match Winner` (Home / Away / Draw) - *This is the core swipe gesture.*\
    *   `Team to Score First` (Team A / Team B / No Goals)
    *   `Both Teams to Score` (Yes / No)

*   **Phase 2 (Add Depth):**
    *   `Total Goals Over/Under 2.5`
    *   `Halftime Result` (Home / Draw / Away) - *Note: This will require an API upgrade or a new data source.*\

## 🔧 WORKFLOW SUMMARY & KEY LESSONS:
- **Build Failures are Part of the Process:** Critical build failures (missing exports, syntax errors) are a normal part of rapid development. Our process of deploying, inspecting, and immediately fixing is working.
- **Site Inspect is CRITICAL:** The browser's **console output** is the only reliable way to distinguish between silent failures, `404` errors, and `500` server crashes.

---


### 📱 Platform Strategy: Separation of Concerns
While the platform aims for **UI/UX Parity** (e.g., the Tinder-swipe "Arena" experience), the Web and Mobile codebases are intentionally maintained as separate entities for specific feature implementations:

1.  **Interaction Layer**: 
    - **Web**: Uses `react-spring` and `@use-gesture/react` for mouse/touch swipe physics.
    - **Mobile**: Uses `react-native-reanimated` and `react-native-gesture-handler` for high-performance native gestures and haptic feedback.
2.  **Viral Growth Loop**:
    - **Web**: Relies on **OpenGraph (OG)** meta tags, Twitter Cards, and browser-based `navigator.share` for social "unfurls".
    - **Mobile**: Utilizes **Native Share APIs** (`expo-sharing`) and `react-native-view-shot` to generate premium, high-resolution shareable graphics for social media story sharing.
3.  **Revenue & Compliance**:
    - **Web**: Handles direct Stripe/PayPal integrations for sponsor applications.
    - **Mobile**: Adheres to strict **App Store / Play Store guidelines** regarding virtual currency and prize draws, utilizing native store-compliant flows where necessary.
4.  **Notifications**:
    - **Web**: Browser-based Push API (when active).
    - **Mobile**: Native Push Notifications (APNs/FCM) for real-time match alerts and win celebrations.

*Last Updated: April 30, 2026*
