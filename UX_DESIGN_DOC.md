# Events Arena - UX Design Document
**Version 2.4 | January 2026**

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
3. **Admin (Moderator):** Platform-wide user management, prize draw resolution, and debug verification.
4. **Super Admin:** Generates arenas via the Arena Wizard.

---

## 🏠 MAIN APP SCREENS
### 2.1 The High-Conversion Lobby
- **Promo Banner:** Visual callout for the **200 Welcome Tokens** reward.
- **Economy Preview:** Transparent display of the "Win Prizes / Level Up / Recruit" loop.
- **PWA Nudge:** Explicit Chrome/Safari instructions for home-screen installation.

### 2.2 Room Page & Creator Tools
- **League Grouping:** Matches are organized by official leagues (EPL, MLS, etc.) with logos.
- **Interactive Remote:** Creators launch manual polls with instant mobile haptic alerts.
- **OBS Stats:** Transparent community-sentiment bars for live stream integration.

---

## 🛡️ ADMIN & QUALITY ASSURANCE
### 3.1 The Command Center
- **User/Role Manager:** Promotion of users to Admin or Creator status.
- **Draw Commander:** Executes 50/50 prize distribution strategy.
- **Resolution Tester (Debug):** Allows admins to generate 60-second test games to verify ticket awarding and XP scaling in real-time.

---

## 🎙️ REWARD ECONOMY
- **Token Starting Balance:** 150 standard / 200 via referral.
- **Referral Loop:** +50 tokens awarded to both the recruiter and the new Supporter.
- **Prize Ticket Engine:** Correct calls automatically award +1 Ticket to the active room's draw.

---

## 4. COMPLIANCE & PERFORMANCE
- **Non-Gambling:** Strictly skill and loyalty based. No "Bets" or "Wagers."
- **Identity Sync:** All error messages and middleware labels are sanitized to remove religious or legacy terminology.
- **Keep-Alive:** Cross-ping service ensures 24/7 responsiveness.

---
*This document serves as the master blueprint for the Events Arena platform.*
