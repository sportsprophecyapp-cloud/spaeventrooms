# Sports Prophecy - UX Design Document
**Version 1.4 | January 2026**

## 🎯 Overview
Sports Prophecy is a full-stack, high-energy sports engagement platform designed for **entertainment and social competition**. It is strictly **NOT a gambling site**.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **Dual-API Sync:** Uses API-Football (15m) and The Odds API (30m) for lightning-fast scores and market coverage.
- **Smart Key Rotation:** Automatic failover between 4+ API keys to ensure 100% uptime and stay within free-tier limits.
- **Auto-Resolution Engine:** Analyzes finished scores and automatically awards +100 XP and **+1 Prize Draw Ticket** for correct forecasts every 15 minutes.

---

## 🛠️ USER ROLES & HIERARCHY
1. **Prophet (User):** The core community. Can chat, forecast, and earn status.
2. **Creator (Partner):** Verified Room Owners (e.g., TaylorMade, Twitch Streamers). Can moderate specific arenas.
3. **Admin (Moderator):** Platform support and user management.
4. **Super Admin:** Full platform control (sportsprophecyapp@gmail.com).

---

## 1. IDENTITY & REFERRALS
### 1.1 Persistent Handles (UUID)
- **Immutable Anchor:** System uses internal `user.id` so history/referrals never break if a user changes their @handle.
- **Identity Lab:** Profile page features a neon edit-mode for handle customization with real-time availability checks.

### 1.2 Bulletproof Referral Program
- **Dual-Rewards:** Both the Referrer (+50) and the New Prophet (+50) receive tokens instantly.
- **Welcome Bonus:** New users start with 200 tokens (instead of 150) when using a referral link.

---

## 2. SPONSOR ECOSYSTEM & PRIZE DRAWS
### 3.1 Monetization & Automation
- **Self-Selling Placeholders:** Empty ad spots show "SPONSOR THIS ARENA" cards that link to Stripe-integrated pricing.
- **Auto-Activation:** Sponsor ads go LIVE instantly upon payment confirmation.
- **Admin Alerts:** Instant email notifications to the Super Admin for every checkout and payment.

### 3.2 The Draw Commander (50/50 Strategy)
- **Ticket Stash:** Users track their earned tickets (from Skill, Streaks, and Referrals) on their profile.
- **Fair Resolution:** Admin panel features a 50/50 distribution engine:
    - **50% Skill:** Prizes awarded to the Top Prophets on the Leaderboard.
    - **50% Engagement:** Prizes awarded via a verifiable random draw from all ticket holders.
- **Trust:** Winners are permanently archived and displayed in the draw history.

---

## 3. COMPLIANCE & UX POLISH
- **Non-Gambling:** Strict terminology (No "Bets," "Wagers," or "Money"). Purely skill and loyalty rewards.
- **Native Mobile Experience:** Sticky navigation tabs and compact headers for a high-end app feel.
- **Stuck-Proof UI:** Guaranteed exit paths (Back buttons/Click-outside) for all modals and pages.
- **Keep-Alive:** Cross-ping service ensures the arena stays "warm" and responsive 24/7.

---
*This document serves as the master blueprint for the Sports Prophecy platform.*
