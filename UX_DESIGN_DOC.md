# Events Arena - UX Design Document
**Version 1.9 | January 2026**

## 🎯 Overview
Events Arena is a full-stack, high-energy sports engagement platform designed for **entertainment and social competition**. It is optimized for cross-platform expansion into sports, TV, and creator-led events.

### Core Philosophy:
- **PWA Strategy (Native-Like):** Designed as a Progressive Web App to bypass App Store friction. Users "Add to Home Screen" for a full-screen, immersive experience without downloads.
- **The Brand Bridge:** Users entering via legacy domains are greeted with: *"Sports Prophecy welcomes you to the Events Arena."*
- **Mutual Benefit:** Users get a 100% free, gamified interactive experience. Sponsors get automated, high-visibility ad placements.
- **Skill over Luck:** Everything is framed as "Forecasting" and "Knowledge," avoiding all religious and gambling terminology.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **High-Frequency Dual-Sync:** API-Football (15m interval) + The Odds API (30m interval).
- **Auto-Failover:** Intelligent key rotation across 4+ API keys to stay within free-tier limits while maintaining 100% uptime.
- **Auto-Resolution:** Every 15 minutes, the engine awards **+100 XP** and **+1 Prize Draw Ticket** for every correct match call.
- **Dynamic XP Scaling:** Leveling follows a linear growth formula: `XP Required = Current Level * 500`.

---

## 🛠️ USER ROLES & HIERARCHY
1. **User (Pro):** Regular player. Can chat, forecast calls, and buy gear.
2. **Creator (Partner):** Room Owners (e.g., Streamers/Brands). Can moderate and co-brand their specific arenas.
3. **Admin (Moderator):** Platform-wide user management and moderation.
4. **Super Admin:** Full platform control (sportsprophecyapp@gmail.com).

---

## 1. IDENTITY & ECONOMY
### 1.1 Persistent Handles (UUID)
- **Immutable Anchor:** System uses internal `user.id`. Identity remains stable even if handle or email changes.
- **Identity Lab:** Profile page features a neon edit-mode for real-time handle customization.

### 1.2 Welcome Package & Rewards
- **Starting Balance:** All new Pros start with **150 tokens**.
- **Welcome Bonus:** Referral signups start with **200 tokens** (+50 bonus).
- **Dual-Reward Referrals:** The sender receives **+50 tokens** instantly upon a successful recruit.
- **Consistency:** Daily logins award tokens and build streaks for massive bonuses.

---

## 2. MAIN APP SCREENS
### 2.1 Homepage / Lobby (`/`)
- **Compact UX:** Mobile-optimized header showing active arenas "above the fold."
- **PWA Prompts:** Integrated prompts for mobile home-screen installation.
- **Global Standings:** Real-time leaderboard showing the elite Pros of the arena.

### 2.2 Room Page (`/rooms/[roomId]`)
- **Native Navigation:** Sticky `Predict | Standings | Chat` tab bar for mobile.
- **Interactive Discussion:** Collapsible comments under every specific match call.
- **Official Sponsor Widget:** Real-time injection of active, Stripe-verified sponsors.

---

## 3. SPONSOR ECOSYSTEM & PRIZE DRAWS
### 3.1 Automated Monetization
- **Self-Selling Slots:** Automated placeholders link to Stripe-integrated pricing.
- **Instant Live:** Ad placements go LIVE instantly upon payment confirmation.
- **Admin Alerts:** Automated email notifications to the Super Admin for every financial event.

### 3.2 Draw Commander (50/50 Strategy)
- **Ticket Stash:** Users track tickets earned from skill, streaks, and referrals on their profile.
- **Fair Resolution:** Admin engine splits prizes:
    - **50% Skill:** Awarded to Top Pros on the Standings board.
    - **50% Engagement:** Verifiable random draw from all ticket holders.

---

## 4. COMPLIANCE & SAFETY
- **Non-Gambling:** Strictly skill and loyalty based. No real-money wagering or payouts.
- **Cultural Neutrality:** Clean terminology ("Pro", "Standings", "Call") for global appeal.
- **Resilience:** Dual-ping Keep-Alive system ensures the arena stays "warm" and responsive 24/7.

---
*This document serves as the master blueprint for the Events Arena platform.*
