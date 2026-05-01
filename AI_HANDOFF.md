# AI Handoff — Events Arena Master Status
**Last Updated: May 1, 2026**

---

## 🗺️ PLATFORM OVERVIEW

Events Arena is a **skill-based sports prediction platform** owned by **Just Me Media**. Users make free predictions on live matches, earn Tickets for correct calls, and spend Tickets on prize draw entries sponsored by third parties. No real money. No gambling. Pure skill.

---

## 🌐 DEPLOYMENT STATUS — WHAT IS ACTUALLY LIVE

| Platform | Status | URL / Notes |
|---|---|---|
| **Website (Web App)** | ✅ **LIVE IN PRODUCTION** | Hosted on Render. The ONLY product available to users right now. |
| **Android App** | ⏳ **UNDER GOOGLE PLAY REVIEW — NOT RELEASED** | Submitted for review. NOT downloadable. NOT visible to users in the store. |
| **iOS App** | ⛔ **BLOCKED — ACCOUNT TYPE** | Apple Developer account type must be upgraded before ANY submission is possible. No timeline. |

> ⚠️ **CRITICAL — READ BEFORE EVERY SESSION:**
> - **NO mobile app exists for any users.** Zero public downloads. Zero active installs outside of local development devices.
> - The Android binary is sitting in Google Play's review queue — it has not passed review and is not visible in the store.
> - iOS has not been submitted at all.
> - **DO NOT use `eas update` (OTA).** OTA delivers JS updates to devices that already have the app installed. Since no users have the app, OTA commands are pointless and should NOT be run.
> - **DO NOT tell users the app is "available"** in any FAQ, help text, or copy. Correct language: *"A mobile app is in development and coming soon."*

---

## 🏗️ INFRASTRUCTURE

| Component | Platform | Cost | Notes |
|---|---|---|---|
| **Frontend** | Render (Free Plan) | $0/mo | Next.js 16, auto-deploys from `main` branch |
| **Backend** | Render (Free Plan) | $0/mo | Node.js / Express, spins down when idle |
| **Database** | Neon (PostgreSQL 17) | $0/mo | Free tier, hosted on AWS |
| **Auth** | JWT + Google OAuth | $0 | |
| **OTA Updates** | EAS (Expo) | $0 | Used for mobile JS-only changes |

**Deploy Command (Web):**
```bash
./deploy.sh "your commit message"
# OR manually:
git add . && git commit -m "message" && git push origin main
```

---

## 📱 MOBILE APP — BUILD & UPDATE RULES

### Current State
- The mobile app is a **local development build only**. No users have it installed.
- A binary was submitted to Google Play for review. It has **not passed review** and is **not visible or downloadable** in the store.
- iOS has not been submitted. Apple Developer account type must be resolved first.

### Update Rules

| Action | When to Use | Command |
|---|---|---|
| Web deployment | Anytime | `git push origin main` or `./deploy.sh "message"` |
| Mobile local changes | Anytime — just commit | `git add . && git commit -m "..." && git push` |
| `eas update` (OTA) | ❌ **DO NOT USE** until app is live in stores with real users | N/A |
| `eas build` (new binary) | Only after Google Play review is APPROVED and a change requires it | `eas build --platform android` |

> **Why no OTA?** EAS OTA updates deliver JavaScript changes to devices that already have the app installed. Since zero users have the app installed, running `eas update` accomplishes nothing. **Stop running it.**

### Path to Launch
1. ✅ Google Play review passes → app becomes live for Android users
2. ✅ Apple Developer account type resolved → iOS binary built and submitted
3. After real users install the app → OTA updates become useful again

---

## ✅ FEATURES COMPLETED & LIVE (Web)

### Core Platform
- User registration / login (Email + Google OAuth)
- Age verification gate (18+)
- JWT session management with auto-refresh
- Multi-language support (EN, ID, TH)

### Prediction Engine
- Soccer (EPL, MLS, etc.) match predictions
- NHL match predictions
- Score + winner prediction with validation
- Automatic result resolution + Ticket awards
- Prediction history on Profile page

### Live Ticker
- Scrolling match ticker on homepage (fixed May 1 — was missing due to `upcoming` vs `scheduled` status mismatch)
- Shows scheduled, live, and recently finished matches

### Gamification
- **Tickets** — earned per correct prediction, daily login, streaks
- **Draw Room** — enter prize draws with Tickets; countdown timer
- **Golden Ticket Share Card** — shareable image with social sharing to WhatsApp, X, Facebook, Snapchat, Instagram, Copy Link
- Leaderboard
- Achievements & cosmetics (avatar frames)

### Social / Community
- Live chat rooms (Soccer Arena, NHL Arena)
- Chat moderation (word filter, admin tools)
- Room announcements

### Administrative Hub
- Command Center (admin only) — manage users, permissions, draws, sponsors
- Granular role-based permissions: `can_moderate_chat`, `can_manage_users`, `can_create_rooms`, `can_view_sponsors`
- Sponsor management + analytics

### Support System
- **Events Arena Live Support** via WhatsApp (`+1 647 554 0219`)
- ❓ Help icon in Navbar links to `/help` page
- `/help` page — Full FAQ + Live Support button (no floating widget on screen)
- `/terms` — Terms of Service (May 2026, Just Me Media)
- `/privacy` — Privacy Policy (May 2026)

---

## 📱 FEATURES COMPLETED — MOBILE (Local, Not Yet Published)

All of the above, plus:
- Native tab navigation (Home, Arenas, Draw, Profile, More)
- `HelpSupportScreen.js` — FAQ-first with WhatsApp concierge escalation
- `MoreScreen.js` — links to Help, Terms, Privacy, Settings
- `TermsOfServiceScreen.js` — updated May 2026
- `PrivacyPolicyScreen.js` — updated May 2026
- Tournament Hub screen
- Layered Profile Card
- Push notifications (local)

---

## 🐛 KNOWN BUGS / RESOLVED

| Bug | Status | Fix Applied |
|---|---|---|
| Live Ticker not showing | ✅ FIXED (May 1) | SQL used `upcoming` but DB stores `scheduled` — corrected in controller + frontend |
| `router` not defined in RoomPage | ✅ FIXED | Added `useRouter()` import |
| WhatsApp share not pre-filling message | ✅ FIXED | Replaced native share with direct web intents per platform |
| db-init not creating NHL tables | ✅ FIXED | Added missing `await client.query(schema)` call |

---

## ⏳ PENDING / NEXT STEPS

### Immediate
1. **Google Play Review** — Wait for approval. No action needed unless reviewer contacts you.
2. **Apple Developer Account** — Upgrade account type to allow app submission. (Account holder action required.)
3. **First binary post-review** — Once Play Store approves, run `eas build --platform android` to include all recent OTA changes in the next binary.

### Short-Term
4. **iOS Submission** — After Apple account is resolved, build and submit iOS binary.
5. **Help page expansion** — Add new FAQs as real user questions come in from WhatsApp support.
6. **NHL data pipeline** — `nhl_matches` table now exists; needs a data feed to populate real NHL games.

### Medium-Term
7. **Crisp (or similar) web chat** — Consider adding for users who don't use WhatsApp once traffic grows.
8. **Sponsor acquisition** — Prize Draw needs real-world sponsor integration beyond the founding SaaSPriceDB sponsor.

---

## 📂 KEY FILES REFERENCE

### Web Frontend (`frontend/app/`)
| File | Purpose |
|---|---|
| `components/LiveTicker/LiveTicker.tsx` | Scrolling match ticker (fixed May 1) |
| `components/WhatsAppSupport/WhatsAppSupport.tsx` | Support widget (now dismissible) |
| `components/TicketShareCard/TicketShareCard.tsx` | Golden Ticket social sharing |
| `components/DrawRoom/DrawRoom.tsx` | Prize draw room |
| `components/Navbar.tsx` | Top navigation (includes ❓ Help icon) |
| `help/page.tsx` | Help & FAQ page with live support |
| `terms/page.tsx` | Terms of Service |
| `privacy/page.tsx` | Privacy Policy |

### Backend (`backend/src/`)
| File | Purpose |
|---|---|
| `shared/pulse/controller.ts` | Live Ticker data feed (fixed May 1) |
| `scripts/db-init.ts` | Schema sync script — run manually to update DB |

### Mobile (`mobile/src/screens/`)
| File | Purpose |
|---|---|
| `HelpSupportScreen.js` | FAQ + WhatsApp support (FAQ-first flow) |
| `MoreScreen.js` | Settings menu |
| `TermsOfServiceScreen.js` | ToS (May 2026) |
| `PrivacyPolicyScreen.js` | Privacy Policy (May 2026) |
| `TournamentHubScreen.js` | Sport-specific tournament views |

---

## 🔑 CONTACTS & CREDENTIALS

| Item | Value |
|---|---|
| Support WhatsApp | +1 647 554 0219 |
| Support Email | contact@sportsprophecyapp.com |
| Admin Email | sportsprophecyapp@gmail.com |
| Web URL | https://eventsarena.sportsprophecy.app |
| GitHub Repo | sportsprophecyapp-cloud/spaeventrooms |
| EAS Project | expo.dev/accounts/sportsprophecy/projects/sportsprophecyapp |

---

*This document is the single source of truth for any AI assistant or developer picking up this project. Always check here first before making assumptions about deployment status.*
