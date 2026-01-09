# Events Arena - UX Design Document
**Version 2.18 | January 2026**

## 🎯 Overview
Events Arena is a full-stack interactive engagement platform optimized for sports, TV, and creator-led events. It is build-stabilized, branding-unified, and runs on a "Pure Live" production data infrastructure.

### Core Philosophy:
- **Events Arena Strategy:** Inclusive branding to capture all major cultural moments.
- **Sponsor Sandbox Strategy:** Interactive, self-serve campaign design for partners.
- **Digital-First Prize Economy:** All rewards are Digital Redemption Codes for zero liability and instant scalability.
- **Sponsor Draw Strategy:** Interactive branded rooms for high-value prize distribution.

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

## 🎁 SPONSOR DRAW SYSTEM (v1.2)
- **Draw Room (`/draw`):** A dedicated arena where users use Prize Tickets to enter sponsored draws.
- **Demo Mode:** "Mock Draw" functionality allows for zero-token simulation of winner selection for presentations.
- **Visuals:** Winner celebration overlays and real-time winner announcements.

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
