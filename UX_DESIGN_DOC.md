# Events Arena - UX Design Document
**Version 2.10 | January 2026**

## 🎯 Overview
Events Arena is a full-stack, high-energy interactive engagement platform optimized for sports, TV, and creator-led events. It is build-stabilized, branding-unified, and mobile-organized for global pre-launch.

### Core Philosophy:
- **Room Isolation Strategy:** Dedicated UI for different event types. Pure Soccer Arena focuses on data; Creator Rooms focus on interactive stream engagement.
- **User-First Lean Strategy:** Prioritizes immediate value (200 Welcome Tokens) over intrusive installation prompts or distracting banners.
- **Resilient Reliability:** Implementation of AbortControllers and state reset logic ensure the platform never "gets stuck" during critical user actions.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **Dual-Sync Data Layer:** API-Football (15m) + The Odds API (30m) with 4-key sequential rotation.
- **Transmission Layer:** Resilient Fetch logic with 10-second safety timeouts, dynamic API URL detection, and explicit state reset on every interaction.
- **Auto-Resolution Engine:** 15-minute automated checks for Match Calls, XP, and Prize Tickets.

---

## 🛠️ USER ROLES & HIERARCHY
1. **Supporter (User):** Earns status and rewards through accurate "Calls."
2. **Creator (Partner):** Owns rooms, triggers Flash Calls, uses OBS Overlays.
3. **Admin (Moderator):** Full system oversight with interactive match deletion and "Nuclear" debug tools.

---

## 📱 MOBILE UX STANDARDS
### 2.1 Ultra-Compact Navigation
- **Dynamic Header:** 60px height limitation. Text logos hide on mobile to prioritize the 🎯 Icon, Language Picker, and User Tray.
- **Sticky Tabs:** Persistent `Calls | Standings | Fan Arena` navigation for instant section jumping.

### 2.2 Organized Match List
- **League Accordions:** Collapsible blocks grouped by official league headers.
- **Auto-Expand:** Sections containing **LIVE** events automatically expand for immediate engagement.
- **Direct Rewards:** Every card features a golden `🎫 EARN 1 TICKET` tag and explicit `Make your call` instructions.

---

## 🌏 GLOBAL ACCESSIBILITY
- **Multi-Language Engine:** Automatic browser detection with manual overrides and sticky localStorage persistence.
- **SEO & Social Ready:** Professional metadata and OG tags optimized for global search and sharing.

---
*This document serves as the master blueprint for the Events Arena platform.*
