# Events Arena - UX Design Document
**Version 2.3 | January 2026**

## 🎯 Overview
Events Arena is a full-stack, high-energy interactive engagement platform optimized for sports, TV, and creator-led events. Designed as a Progressive Web App (PWA) to ensure zero-friction onboarding in global markets.

### Core Philosophy:
- **Immediate Value Visibility:** Surfaces the 200-token welcome bonus and prize economy on the landing page to maximize conversion.
- **Supporter Loyalty:** Users earn status through consistent "Calls" and grinds, not financial risk.
- **PWA Strategy:** Bypasses app stores via "Add to Home Screen" functionality, creating a native mobile experience.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **Dual-Sync Data Layer:** API-Football (15m) + The Odds API (30m) with 4-key rotation.
- **Resolution Loop:** 15-minute automated checks for Match Calls, XP, and Prize Tickets.
- **Dynamic XP Math:** Progressively harder leveling (`Current Level * 500`).

---

## 🛠️ USER ROLES & HIERARCHY
1. **Supporter (User):** Earns status, XP, and tickets.
2. **Creator (Partner):** Owns rooms, triggers Flash Calls, uses OBS Overlays.
3. **Super Admin:** Generates arenas via the Arena Wizard.

---

## 🏠 MAIN APP SCREENS (Landing Page Hooks)
### 2.1 The High-Conversion Lobby
- **Promo Banner:** Visual callout for the **200 Welcome Tokens** reward.
- **Economy Preview:** Transparent display of the "Win Prizes / Level Up / Recruit" loop.
- **PWA Nudge:** Explicit Chrome/Safari instructions for home-screen installation.
- **Brand Bridge:** Persistent welcome message for legacy Sports Prophecy users.

### 2.2 Room Page & Creator Tools
- **Interactive Remote:** Creators launch manual polls with instant mobile haptic alerts.
- **OBS Stats:** Transparent community-sentiment bars for live stream integration.

---

## 🎙️ REWARD ECONOMY
- **Token Starting Balance:** 150 standard / 200 via referral.
- **Referral Loop:** +50 tokens awarded to both the recruiter and the new Supporter.
- **50/50 Draw Strategy:** Admin resolves prizes by splitting 50% to Top Standings and 50% to Random Tickets.

---

## 4. COMPLIANCE & PERFORMANCE
- **Non-Gambling:** Strictly skill and loyalty based. No "Bets" or "Wagers."
- **Keep-Alive:** Cross-ping service ensures 24/7 responsiveness on free-tier hosting.

---
*This document serves as the master blueprint for the Events Arena platform.*
