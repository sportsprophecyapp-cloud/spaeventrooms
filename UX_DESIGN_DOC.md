# Sports Prophecy - UX Design Document
**Version 1.3 | January 2026**

## 🎯 Overview
Sports Prophecy is a full-stack, high-energy sports engagement platform designed for **entertainment and social competition**. It is strictly **NOT a gambling site**.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **High-Speed Sync:** 
    - **API-Football (15m interval):** Lightning-fast score updates.
    - **The Odds API (30m interval):** High-coverage market and schedule sync.
- **Smart Failover:** Automatic rotation between multiple API keys to prevent downtime.
- **Auto-Resolution:** The "Resolver Engine" automatically awards +100 Points/XP every 15 minutes for correct prophecies.

---

## 🛠️ USER ROLES & HIERARCHY
1. **Prophet (User):** Regular user. Can chat, forecast, and buy gear.
2. **Creator (Partner):** Room Owners (e.g., PGA, PGA, Kick Streamers). Link to specific `room_id`.
3. **Admin (Moderator):** Platform-wide support.
4. **Super Admin:** Full control (sportsprophecyapp@gmail.com).

---

## 1. AUTHENTICATION & IDENTITY
### 1.1 Bulletproof Handles (UUID)
- Users choose a unique **Prophet Handle** (e.g., @SeerOne).
- Anchor: Uses DB `user.id`. Data remains persistent even if the handle or email changes.
- Access: Profile page includes high-energy "✎ Edit Identity" field.

### 1.2 Dual-Reward Referral Program
- **Referrer:** Receives **+50 tokens** instantly.
- **New User:** Receives **+50 token Welcome Bonus** (Start: 200).
- **Security:** Links use the unique numeric `user.id` for maximum stability.

---

## 2. MAIN APP SCREENS
### 2.1 Homepage / Lobby (`/`)
- **Compact Mobile Header:** Optimized vertical space.
- **Stuck-Proof UI:** Navigation fixes ensure no "dead-ends" in modals or pages.
- **Real-Time Data:** Matches grouped by League (EPL, La Liga, etc.) with logos.

### 2.2 Room Page (`/rooms/[roomId]`)
- **Native Experience:** Sticky `Predict | Ranks | Chat` tab bar for mobile.
- **Interactive Discussion:** Collapsible comments under every specific prophecy.

---

## 3. SPONSOR ECOSYSTEM & PRIZE DRAWS
### 3.1 Automated Monetization
- **"Your Ad Here" Placeholders:** link to tiered pricing.
- **Auto-Activation:** Ad goes LIVE the second payment is confirmed via Stripe Webhook.
- **Admin Alerts:** Instant email notifications to `sportsprophecyapp@gmail.com`.

### 3.2 Prize Draw (Ticket System)
- **Automatic Entry:** Users earn virtual tickets for Streaks, Referrals, and Skill.
- **Trust:** Random winner selector in the Admin Command Center.

---

## 4. COMPLIANCE & SAFETY
- **Non-Gambling:** Strict terminology audit (No "Bets," "Wagers," or "Payouts"). 
- **Time as Currency:** Prizes are earned through engagement and sports IQ, not financial risk.
- **Keep-Alive:** Dual-ping system ensures the site never "sleeps," providing a 24/7 high-end experience.

---
*This document serves as the master blueprint for the Sports Prophecy platform.*
