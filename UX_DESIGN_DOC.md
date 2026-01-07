# Events Arena - UX Design Document
**Version 2.2 | January 2026**

## 🎯 Overview
Events Arena is a full-stack, high-energy interactive engagement platform designed for **entertainment and social competition**. It is strictly **NOT a gambling site**.

### Core Philosophy:
- **Supporter Strategy:** Users are defined as "Supporters," reflecting loyalty to both sports teams and content creators.
- **PWA Strategy (Native-Like):** Designed as a Progressive Web App to bypass App Store friction. Users "Add to Home Screen" for a full-screen, immersive experience without downloads.
- **Mutual Benefit:** Supporters get a free, gamified experience. Sponsors get automated, high-visibility ad placements.
- **Skill over Luck:** Action is framed as "Forecasting" and "Knowledge," avoiding all religious and gambling terminology.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **High-Frequency Dual-Sync:** API-Football (15m interval) + The Odds API (30m interval) with automatic key rotation.
- **Auto-Resolution Engine:** Every 15 minutes, the engine awards **+100 XP** and **+1 Prize Draw Ticket** for correct calls.
- **Dynamic XP Scaling:** Leveling follows a linear growth formula: `XP Required = Current Level * 500`.

---

## 🛠️ USER ROLES & HIERARCHY
1. **Supporter (User):** Regular player. Can chat, forecast calls, and build status.
2. **Creator (Partner):** Room Owners. Access to the "Creator Remote" and OBS Overlays.
3. **Admin (Moderator):** Platform-wide user management and moderation.
4. **Super Admin:** Full platform control (sportsprophecyapp@gmail.com).

---

## 🎙️ CREATOR TOOLS (Interactive Streaming)
- **Creator Remote:** Real-time dashboard to trigger "Flash Calls" (Yes/No polls).
- **OBS Overlay:** Transparent, high-contrast UI for live streamers to display community stats.
- **Haptic Alerts:** Supporters receive instant mobile vibrations and pop-ups during live creator events.

---

## 1. IDENTITY & ECONOMY
- **Persistent Handles:** Anchored to DB `user.id` for immutable history.
- **Welcome Package:** 150 token starting balance (200 via referral).
- **Identity Lab:** Profile page features a neon edit-mode for handle customization.

---

## 4. COMPLIANCE & PERFORMANCE
- **Non-Gambling:** Pure skill/loyalty rewards. No "Bets," "Wagers," or financial risk.
- **Cultural Neutrality:** Terminology like "Supporter," "Standings," and "Call" ensures global accessibility.
- **Keep-Alive:** Dual-ping service ensures 24/7 responsiveness on Render.

---
*This document serves as the master blueprint for the Events Arena platform.*
