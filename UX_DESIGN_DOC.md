# Events Arena - UX Design Document
**Version 2.8 | January 2026**

## 🎯 Overview
Events Arena is a full-stack, high-energy interactive engagement platform optimized for sports, TV, and creator-led events. It is build-stabilized, branding-unified, and regionally intelligent for global pre-launch.

### Core Philosophy:
- **Regional Intelligence:** Automatic language detection combined with manual overrides to ensure Supporters in any market feel at home.
- **Mobile-First Compaction:** Eliminates "Scrolling Nightmares" by using sticky navigation and compact content sections.
- **User-First Lean Strategy:** Prioritizes immediate value (200 Welcome Tokens) over intrusive installation prompts.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **Dual-Sync Data Layer:** API-Football (15m) + The Odds API (30m) with 4-key rotation.
- **Resolution Engine:** 15-minute automated checks for Match Calls, XP, and Prize Tickets.
- **Localization Engine:** Context-based translation system supporting English, Bahasa Indonesia (ID), and Thai (TH).

---

## 🛠️ USER ROLES & HIERARCHY
1. **Supporter (User):** Earns status and rewards through accurate "Calls."
2. **Creator (Partner):** Triggers Flash Calls and uses real-time OBS Overlays.
3. **Admin (Moderator):** Full system oversight and Resolution Testing (Debug tools).

---

## 🌏 GLOBAL ACCESSIBILITY
### 2.1 Multi-Language Support
- **Auto-Detection:** Detects browser locale (`navigator.language`) to serve native text immediately.
- **Manual Toggle:** Sleek `[ EN | ID | TH ]` selector in the Navbar for user preference.
- **Persistence:** User language choices are stored in `localStorage` for returning visits.

### 2.2 Native Mobile UX
- **Sticky Navigation:** Persistent tabs for seamless section jumping.
- **PWA Ready:** Background architecture for home-screen installation without store friction.

---

## 🏠 MAIN APP SCREENS
- **Landing Page Hooks:** Promo banners and economy previews surface the platform's value immediately.
- **Match Cards:** Direct `🎫 EARN 1 TICKET` labels and explicit `Make your call` instructions.

---

## 4. COMPLIANCE & SEO
- **Non-Gambling:** Strictly skill and loyalty based. No "Bets" or "Wagers."
- **SEO Ready:** Professional metadata and Open Graph tags optimized for global search and social sharing.

---
*This document serves as the master blueprint for the Events Arena platform.*
