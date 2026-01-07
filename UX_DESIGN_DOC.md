# Events Arena - UX Design Document
**Version 2.9 | January 2026**

## 🎯 Overview
Events Arena is a full-stack, high-energy interactive engagement platform optimized for sports, TV, and creator-led events. It is build-stabilized, branding-unified, and mobile-organized for global pre-launch.

### Core Philosophy:
- **Room Isolation Strategy:** Dedicated UI for different event types. Pure Soccer Arena focuses on data; Creator Rooms focus on interactive stream engagement.
- **Accordion Arena:** Eliminates "Scrolling Nightmares" by grouping content into collapsible, intelligent blocks.
- **User-First Lean Strategy:** Prioritizes immediate value (200 Welcome Tokens) over intrusive installation prompts.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **Dual-Sync Data Layer:** API-Football (15m) + The Odds API (30m) with 4-key rotation.
- **Intelligent Deduplication:** Frontend fuzzy-match logic ensures unique event listings across multiple data providers.
- **Auto-Resolution Engine:** 15-minute automated checks for Match Calls, XP, and Prize Tickets.

---

## 🛠️ USER ROLES & HIERARCHY
1. **Supporter (User):** Earns status and rewards through accurate "Calls."
2. **Creator (Partner):** Owns rooms, triggers Flash Calls, uses OBS Overlays.
3. **Admin (Moderator):** Full system oversight and QA Debug tools.

---

## 📱 MOBILE UX STANDARDS
### 2.1 The Isolated Arena Page
- **Pure Soccer Room:** Lean layout focused 100% on official match data and prize tickets.
- **Creator Hub:** Interactive dashboard featuring real-time stream sentiment and haptic alerts.
- **Unified Sidebar:** Consolidated `Fan Arena | Standings` tabs for integrated social experience.

### 2.2 Organized Match List
- **League Accordions:** Collapsible blocks grouped by official league headers.
- **Auto-Expand:** Sections containing **LIVE** events automatically expand for immediate engagement.
- **Status Pulsing:** High-contrast neon visual feedback for active and finishing events.

---

## 🌏 GLOBAL ACCESSIBILITY
- **Multi-Language Engine:** Automatic browser detection with manual `[ EN | ID | TH ]` toggle and sticky persistence.
- **SEO Ready:** Professional metadata and OG tags for global visibility and sharing.

---
*This document serves as the master blueprint for the Events Arena platform.*
