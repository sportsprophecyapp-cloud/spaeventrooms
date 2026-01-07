# Sports Prophecy - UX Design Document
**Version 1.6 | January 2026**

## 🎯 Overview
Sports Prophecy is a full-stack, high-energy sports engagement platform designed for **entertainment and social competition**. It is strictly **NOT a gambling site**.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **Dual-API Sync:** High-frequency scores (15m) and market sync (30m) with automatic key rotation.
- **Auto-Resolution Engine:** Analyzes scores and automatically awards **+100 XP** and **+1 Prize Draw Ticket** for correct match calls every 15 minutes.
- **Dynamic XP Scaling:** Leveling follows a linear-growth formula: `XP Required = Current Level * 500`. Leveling gets progressively harder, adding prestige to high-level Pros.

---

## 🛠️ USER ROLES & HIERARCHY
1. **User (Pro):** Regular player. Can chat, forecast match calls, and earn status.
2. **Creator (Partner):** Verified Room Owners. Can moderate and co-brand specific arenas.
3. **Admin (Moderator):** Platform support and user management.
4. **Super Admin:** Full platform control (sportsprophecyapp@gmail.com).

---

## 1. IDENTITY & REFERRALS
### 1.1 Persistent Handles (UUID)
- **Immutable Anchor:** Uses `user.id` so history never breaks during handle changes.
- **Identity Lab:** Profile page neon edit-mode for handle customization.

### 1.2 Bulletproof Referral Program
- **Dual-Rewards:** Both Referrer and New User receive **+50 tokens** instantly.
- **Welcome Bonus:** New users start with 200 tokens (instead of 150) via referral link.

---

## 2. MAIN APP SCREENS
### 2.1 Homepage / Lobby (`/`)
- **Compact UX:** Mobile-optimized header showing rooms "above the fold."
- **Arena Standings:** Global rankings showing user XP and dynamic Levels.

### 2.2 Room Page (`/rooms/[roomId]`)
- **Tab System:** Sticky `Predict | Standings | Chat` navigation for native feel.
- **Official Sponsor Widget:** Auto-injection of active, Stripe-verified sponsors.

---

## 3. SPONSOR ECOSYSTEM & PRIZE DRAWS
### 3.1 Automated Monetization
- **Self-Selling Placeholders:** Empty ad spots show "SPONSOR THIS ARENA" links.
- **Auto-Activation:** Sponsor ads go LIVE instantly upon payment confirmation.

### 3.2 The Draw Commander (50/50 Strategy)
- **Ticket Stash:** Users track tickets earned from Skill, Streaks, and Referrals.
- **Fair Resolution:** 50% Skill (Leaderboard) / 50% Engagement (Random Draw).

---

## 4. COMPLIANCE & SAFETY
- **Non-Gambling:** Pure skill/loyalty rewards. No "Bets," "Wagers," or financial risk.
- **Cultural Neutrality:** Modern sports terminology ("Pro", "Standings", "Call") for global appeal.
- **Performance:** Mutual keep-alive system ensures 24/7 responsiveness on Render.

---
*This document serves as the master blueprint for the Sports Prophecy platform.*
