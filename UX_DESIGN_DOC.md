# Events Arena - UX Design Document
**Version 2.6 | January 2026**

## 🎯 Overview
Events Arena is a full-stack, high-energy interactive engagement platform optimized for sports, TV, and creator-led events. It is designed for maximum conversion through a "User-First" lean strategy and professional SEO architecture.

### Core Philosophy:
- **User-First Lean Strategy:** Eliminates "Feature Bloat" and first-touch friction (e.g., PWA installation nudges) to prioritize immediate value and engagement.
- **Immediate Value Visibility:** Surfaces the 200-token welcome bonus and prize economy on the landing page to maximize conversion.
- **Engagement Master:** Uses "Direct Reward Labels" on match cards to show Supporters exactly what they earn (Tickets/XP).
- **SEO & Social Ready:** Built with professional Open Graph (OG) and metadata tags for high visibility on search engines and social platforms.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **Dual-Sync Data Layer:** API-Football (15m) + The Odds API (30m) with 4-key rotation.
- **Resolution Loop:** 15-minute automated checks for Match Calls, XP, and Prize Tickets.
- **Dynamic XP Math:** Progressively harder leveling (`Current Level * 500`).

---

## 🛠️ USER ROLES & HIERARCHY
1. **Supporter (User):** Earns status, XP, and tickets through accurate "Calls."
2. **Creator (Partner):** Owns rooms, triggers Flash Calls, uses OBS Overlays.
3. **Admin (Moderator):** Manages users, prize draws, and system-wide quality assurance.

---

## 🏠 MAIN APP SCREENS
### 2.1 The High-Conversion Lobby
- **Promo Banner:** Visual callout for the **200 Welcome Tokens** reward.
- **Economy Preview:** Transparent display of the "Win Prizes / Level Up / Recruit" loop.
- **Branding:** Versatile "Events Arena" identity with a legacy bridge for Sports Prophecy users.

### 2.2 Perfected Soccer Arena
- **Match Cards:** Features neon status pulsing and direct `🎫 EARN 1 TICKET` tags.
- **League Organization:** Matches grouped by official league headers with logos.

---

## 🛡️ ADMIN & QUALITY ASSURANCE
- **The Command Center:** Full user management and 50/50 prize distribution logic.
- **Resolution Tester (Debug):** Allows real-time verification of the ticket economy via 60-second test games.

---

## 4. COMPLIANCE & PERFORMANCE
- **Non-Gambling:** Strictly skill and loyalty based. No "Bets" or "Wagers."
- **PWA Ready:** Manifest and background architecture active, but installation is optional and non-intrusive.
- **SEO Optimized:** Full meta-tag suite for high-end search rankings and social previews.

---
*This document serves as the master blueprint for the Events Arena platform.*
