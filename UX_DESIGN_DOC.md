# Events Arena - UX Design Document
**Version 2.5 | January 2026**

## 🎯 Overview
Events Arena is a full-stack, high-energy interactive engagement platform optimized for sports, TV, and creator-led events. Designed as a Progressive Web App (PWA) to ensure zero-friction onboarding in global markets.

### Core Philosophy:
- **Immediate Value Visibility:** Surfaces the 200-token welcome bonus and prize economy on the landing page to maximize conversion.
- **Engagement Master:** Uses "Direct Reward Labels" on match cards to show Supporters exactly what they earn (Tickets/XP) for every action.
- **PWA Strategy:** Bypasses app stores via "Add to Home Screen" functionality, creating a native mobile experience.

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
### 2.1 High-Conversion Lobby
- **Promo Banner:** Visual callout for the **200 Welcome Tokens** reward.
- **Economy Preview:** Transparent display of the "Win Prizes / Level Up / Recruit" loop.

### 2.2 Perfected Soccer Room
- **Match Cards:** Features neon status pulsing and direct `🎫 EARN 1 TICKET` tags.
- **Clarity:** Explicit `Make your call` instructions under primary interaction buttons.
- **League Organization:** Matches grouped by official league headers with logos.

---

## 🛡️ ADMIN & QUALITY ASSURANCE
- **The Command Center:** Full user management and 50/50 prize distribution logic.
- **Resolution Tester (Debug):** Allows real-time verification of the ticket economy via 60-second test games.

---

## 🎙️ REWARD ECONOMY
- **Token Starting Balance:** 150 standard / 200 via referral.
- **Prize Ticket Engine:** Correct calls automatically award +1 Ticket to the active room's draw.

---

## 4. COMPLIANCE & PERFORMANCE
- **Non-Gambling:** Purely skill and loyalty based. No "Bets" or "Wagers."
- **Cultural Neutrality:** Secular terminology ("Supporter", "Standings", "Call") for global appeal.
- **Keep-Alive:** Cross-ping service ensures 24/7 responsiveness.

---
*This document serves as the master blueprint for the Events Arena platform.*
