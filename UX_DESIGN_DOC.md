# Events Arena - UX Design Document
**Version 1.7 | January 2026**

## 🎯 Overview
Events Arena is a versatile, high-energy interactive engagement platform designed for **entertainment and social competition**. While built on the foundations of Sports Prophecy, it is optimized for cross-platform expansion into sports, TV, and creator-led events.

### Core Philosophy:
- **The Brand Bridge:** Users entering via legacy domains are greeted with: *"Sports Prophecy welcomes you to the Events Arena."*
- **Mutual Benefit:** Users get a free, gamified interactive experience. Sponsors/Creators get automated, high-visibility ad placements and engagement data.
- **Skill over Luck:** Everything is framed as "Forecasting" and "Knowledge," strictly avoiding religious and gambling terminology.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **High-Frequency Dual-Sync:** 
    - **API-Football (15m interval):** Lightning-fast score updates.
    - **The Odds API (30m interval):** High-coverage market and schedule sync.
- **Smart Key Rotation:** Failover across 4+ API keys to ensure 100% uptime.
- **Automatic Resolution:** Every 15 minutes, the "Resolver Engine" awards **+100 XP** and **+1 Prize Draw Ticket** for correct match calls.

---

## 🛠️ USER ROLES & HIERARCHY
1. **User (Pro):** Regular player. Can chat, forecast match calls, and earn status.
2. **Creator (Partner):** Room Owners (Streamers/Brands). Can moderate and co-brand their specific arenas.
3. **Admin (Moderator):** Platform-wide support.
4. **Super Admin:** Full control (sportsprophecyapp@gmail.com).

---

## 1. IDENTITY & REFERRALS
### 1.1 Persistent Handles (UUID)
- **Anchor:** Uses internal DB `user.id`. Identity remains stable even if @handle or email changes.
- **Identity Lab:** Profile page features a neon edit-mode for real-time handle customization.

### 1.2 Dual-Reward Referrals
- **The Reward:** Both Referrer and New User receive **+50 tokens** instantly.
- **The Welcome:** Referral signups start with 200 tokens (vs 150 standard).

---

## 2. MAIN APP SCREENS
### 2.1 Homepage / Lobby (`/`)
- **Visual:** Compact header showing active arenas "above the fold."
- **Standings:** Global leaderboard showing Pro XP and Level rankings.
- **Branding:** footer links Events Arena to the parent "Powered by Sports Prophecy" legacy.

### 2.2 Room Page (`/rooms/[roomId]`)
- **Layout:** Professional 3-column desktop view; sticky tabbed mobile view.
- **The Call:** Users transmit their "Call" on live events with immediate score feedback.

---

## 3. SPONSOR ECOSYSTEM & PRIZE DRAWS
### 3.1 Automated Monetization
- **Self-Selling Slots:** Automated ad placeholders link to Stripe-integrated pricing.
- **Auto-Activation:** Ad placements go LIVE instantly upon payment confirmation.

### 3.2 Draw Commander (50/50 Strategy)
- **Ticket Stash:** Users track tickets earned from skill, streaks, and referrals.
- **Fair Resolution:** Admin resolution engine splits prizes:
    - **50% Skill:** Awarded to Top Pros on the Standings board.
    - **50% Engagement:** Random draw from all ticket holders.

---

## 4. COMPLIANCE & SAFETY
- **Non-Gambling:** Strictly skill and loyalty based. No real-money wagering.
- **Cultural Neutrality:** Modern, professional terminology ("Pro", "Standings", "Call") for global appeal.
- **Performance:** Dual-ping Keep-Alive system ensures 24/7 site responsiveness.

---
*This document serves as the master blueprint for the Events Arena platform.*
