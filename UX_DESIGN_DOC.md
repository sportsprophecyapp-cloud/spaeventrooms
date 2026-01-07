# Events Arena - UX Design Document
**Version 2.13 | January 2026**

## 🎯 Overview
Events Arena is a full-stack interactive engagement platform optimized for sports and creator-led events. It is build-stabilized, branding-unified, and friction-free for returning Supporters.

### Core Philosophy:
- **Zero-Friction Entry (Fast Logs):** Users are automatically logged in upon returning to the site. Session verification occurs instantly in the background via the `/me` handshake.
- **Visual Excellence:** Maintains high-end "Gaming" aesthetics (Glassmorphism, Neon Accents) across all interaction points.
- **Fair Play Integrity:** Prediction inputs lock at kick-off. One match, one call. No retroactive changes allowed.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **Fast Logs Protocol:** Frontend hydrates JWT from localStorage and performs a background handshake with the backend to restore Tokens, XP, and Level status.
- **Dual-Sync Data Layer:** API-Football (20m) + The Odds API (45m) with 4-key sequential rotation.
- **Auto-Resolution:** Automated 15-minute checks for Match Results, awarding XP and Prize Tickets instantly.

---

## 🛠️ USER ROLES & HIERARCHY
1. **Supporter (User):** Earns status and tickets through accurate pre-game calls. Session persistent for 7 days.
2. **Creator (Partner):** Verified room owners with access to the "Remote Control" and OBS Overlays.
3. **Admin (Moderator):** Full platform control, prize draw resolution, and arena data management.

---

## 📱 MOBILE UX STANDARDS
### 2.1 Performance & Navigation
- **One-Tap Access:** Eliminates repeated login prompts, creating a native app feel.
- **Ultra-Compact Header:** 60px height limitation to maximize vertical space for game data.
- **League Accordions:** Matches grouped by league with auto-expand logic for LIVE games.

### 2.2 Participation Clarity
- **Direct Rewards:** Match cards show exactly what is at stake (`🎫 EARN 1 TICKET`).
- **Call Locking:** Clear `✅ CALL SUBMITTED` visual feedback once a choice is made.

---

## 🌏 GLOBAL ACCESSIBILITY
- **Multi-Language Support:** English, ID, and TH with automatic detection and manual overrides.
- **SEO Ready:** Professional metadata and OG tags for elite social sharing.

---
*This document serves as the master blueprint for the Events Arena platform.*
