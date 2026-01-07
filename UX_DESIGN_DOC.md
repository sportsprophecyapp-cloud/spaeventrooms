# Events Arena - UX Design Document
**Version 2.11 | January 2026**

## 🎯 Overview
Events Arena is a full-stack, high-energy interactive engagement platform optimized for sports, TV, and creator-led events. It is build-stabilized, branding-unified, and integrity-locked for global pre-launch.

### Core Philosophy:
- **Fair Play Integrity:** Prediction inputs are locked the moment an event begins. Users must "Make their call" before the official start time.
- **Time-Priority Organization:** The arena surface prioritizes the most immediate opportunities, sorting events by "Time to Start" (Soonest first).
- **Room Isolation Strategy:** Dedicated UI for different event types. Pure Soccer Arena focuses on data; Creator Rooms focus on interactive stream engagement.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **Dual-Sync Data Layer:** API-Football (15m) + The Odds API (30m) with 4-key sequential rotation.
- **Economy Integrity:** Cross-table synchronization ensures XP and Prize Tickets are awarded only for correct, locked-in calls.
- **Auto-Resolution Engine:** 15-minute automated checks for Match Results, XP, and Prize Tickets.

---

## 🛠️ USER ROLES & HIERARCHY
1. **Supporter (User):** Earns status and rewards through accurate "Calls."
2. **Creator (Partner):** Owns rooms, triggers Flash Calls, uses OBS Overlays.
3. **Admin (Moderator):** Full system oversight with interactive match deletion and categorized Debug tools.

---

## 📱 MOBILE UX STANDARDS
### 2.1 The Intelligent Match List
- **League Accordions:** Collapsible blocks grouped by official league headers.
- **Auto-Expand:** Sections containing **LIVE** events automatically expand for immediate engagement.
- **Chronological Sorting:** Matches within each league are sorted by start time (Soonest first).
- **Kick-off Lock:** The "Predict" button is replaced by live scores/status once the event starts.

### 2.2 Ultra-Compact Navigation
- **Dynamic Header:** 60px height. Redundant text is hidden on mobile to prioritize the 🎯 Icon and Language Picker.
- **Sticky Tabs:** Persistent social and prediction navigation.

---

## 🌏 GLOBAL ACCESSIBILITY
- **Multi-Language Engine:** Automatic browser detection with manual overrides and sticky localStorage persistence.
- **SEO & Social Ready:** Professional metadata and OG tags optimized for global search and sharing.

---
*This document serves as the master blueprint for the Events Arena platform.*
