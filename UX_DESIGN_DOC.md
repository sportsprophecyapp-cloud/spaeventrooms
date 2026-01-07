# Events Arena - UX Design Document
**Version 2.7 | January 2026**

## 🎯 Overview
Events Arena is a full-stack, high-energy interactive engagement platform optimized for sports, TV, and creator-led events. It is build-stabilized, branding-unified, and mobile-optimized for global pre-launch.

### Core Philosophy:
- **Mobile-First Compaction:** Eliminates "Scrolling Nightmares" by using sticky navigation and compact content sections.
- **Resilient Reliability:** Implementation of AbortControllers and timeouts ensure the platform never "gets stuck" during critical user actions (e.g., submitting calls).
- **User-First Lean Strategy:** Prioritizes immediate value (200 Welcome Tokens) over intrusive installation prompts.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **Dual-Sync Data Layer:** API-Football (15m) + The Odds API (30m) with 4-key rotation.
- **Resolution Engine:** 15-minute automated checks for Match Calls, XP, and Prize Tickets.
- **Transmission Layer:** Resilient Fetch logic with 8-second safety timeouts and explicit error reporting.

---

## 🛠️ USER ROLES & HIERARCHY
1. **Supporter (User):** Earns status and rewards through accurate "Calls."
2. **Creator (Partner):** Triggers Flash Calls and uses real-time OBS Overlays.
3. **Admin (Moderator):** Full system oversight and Resolution Testing (Debug tools).

---

## 📱 MOBILE UX STANDARDS
### 2.1 The Optimized Arena Page
- **Sticky Tabs:** `Calls | Standings | Fan Arena` navigation remains fixed at the top for instant section jumping.
- **Compact Header:** Vertical space is preserved by shrinking room headers and lobby navigation.
- **Announcement Tickers:** Scrollable, capped-height sections for official news.
- **League Grouping:** Match list organized by official league headers with logos.

### 2.2 Interactive Interaction
- **Match Cards:** Direct `🎫 EARN 1 TICKET` labels and explicit `Make your call` instructions.
- **Neon Pulsing:** Real-time visual feedback for Live and Active events.

---

## 🛡️ ADMIN & QUALITY ASSURANCE
- **Debug Dashboard:** Real-time generation of 60-second test games to verify the prize ticket economy.
- **Role Management:** Internal tools for promoting users to Creator or Admin status.

---

## 4. COMPLIANCE & SEO
- **Non-Gambling:** Strictly skill and loyalty based. No "Bets" or "Wagers."
- **SEO & Social:** Professional metadata and Open Graph (OG) tags for elite social sharing and search ranking.

---
*This document serves as the master blueprint for the Events Arena platform.*
