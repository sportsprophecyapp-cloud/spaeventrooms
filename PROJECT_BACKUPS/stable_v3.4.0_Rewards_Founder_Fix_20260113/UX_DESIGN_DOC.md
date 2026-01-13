# Events Arena - UX Design Document
**Version 3.2.0 | January 2026**

## 🎯 Overview
Events Arena is a full-stack interactive engagement platform optimized for sports, TV, and creator-led events. It is build-stabilized, branding-unified, and runs on a "Pure Live" production data infrastructure.

### Core Philosophy:
- **Events Arena Strategy:** Inclusive branding to capture all major cultural moments.
- **Sponsor Hub Strategy:** Centralized review and instant deployment of branded campaigns.
- **Sponsor Creative Studio:** Self-service ad design tool with real-time placement previews.
- **Logo Integrity System:** Manifest-guided local synchronization for high-performance team branding.
- **Digital-First Prize Economy:** All rewards are Digital Redemption Codes for zero liability and instant scalability.
- **Sponsor Draw Strategy:** Active branded rooms for high-value prize distribution, tied to verified sponsors.

## 🎨 VISUAL SYSTEM (v2.3)
-   **Integrated Ad Inventory:**
    -   **Card Footers:** Non-intrusive "Powered By" glassmorphism footer on match cards for high-frequency impressions.
    -   **Smart Banners:** Responsive 16:9 aspect ratio containers for "Official Room Sponsors" that adapt to device width.
-   **Hybrid Card Architecture:** Unified design for static and interactive cards with deep glassmorphism (`blur(30px)`) and premium lighting.
-   **Neon/Cyber Aesthetic:** High-contrast dark mode with neon accents (Cyan/Magenta) for team indicators.
-   **Fluid Mobile Response:** All core interactive elements (Marquees, Cards) utilize `clamp()` driven sizing for device-agnostic perfect rendering (320px to 4k).

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **Dual-Sync Data Layer:** API-Football (20m) + The Odds API (4h Savings Mode).
- **Auto-Resolution (v1.1):** Automated 15-minute checks for Results, awarding **XP** and **Prize Tickets** instantly.
- **Real-Time Communication:** Global Socket.io layer for chat, private admin messages, and live online status.

## 🏆 ENGAGEMENT & REWARDS (v1)
- **Badge & Inventory System:**
    - Users can unlock a variety of badges for their achievements.
    - A "My Badge Locker" on the profile page allows users to equip their favorite unlocked badge.
    - Equipped badges are displayed next to usernames in the chat.
- **Tiered & Special Badges:**
    - **Automated:** "PIONEER" (1-100), "SETTLER" (101-500), etc. are granted automatically based on user ID.
    - **Manual:** Special badges ("Day One") can be granted by admins.

## 🎁 SPONSOR DRAW SYSTEM (v1.5)
- **Draw Room (`/draw`):** A dedicated arena where users use Prize Tickets to enter sponsored draws.
- **Admin Review Hub:** Centralized dashboard to approve applications and instantly create matching draws.
- **Visuals:** Winner celebration overlays and real-time announcements for live events.

## 🛠️ USER ROLES & HIERARCHY
1. **Supporter (User):** Earns Prize Tickets and XP. Can unlock and equip cosmetic badges.
2. **Admin (Moderator):** Manages users, grants special badges, and sends both private and site-wide announcements.

## 🛡️ ADMIN & MODERATION TOOLS
- **Command Center:** Central hub for user management.
- **Live Online Status:** Admins can see which users are currently online.
- **Private Messaging:** Admins can send real-time private messages to individual users.
- **Global Announcements:** Admins can broadcast a "toast" notification to all online users instantly.

## ⚖️ COMPLIANCE & TRUST
- **Account Deletion:** Full, secure, backend-powered account deletion is implemented.
- **Footer Links:** Homepage footer contains links to `/corporate`, `/privacy`, and `/delete-account`.

---
*This document serves as the master blueprint for the Events Arena platform.*
