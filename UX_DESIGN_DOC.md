# Sports Prophecy - UX Design Document
**Version 1.5 | January 2026**

## 🎯 Overview
Sports Prophecy is a full-stack, high-energy sports engagement platform designed for **entertainment and social competition**. It is strictly **NOT a gambling site**.

### Core Philosophy:
- **Mutual Benefit:** Users get a 100% free, gamified second-screen experience. Sponsors get automated, high-visibility ad placements.
- **Skill over Luck:** Everything is framed as "Forecasting" and "Knowledge," avoiding all religious and gambling terminology.
- **Gaming Aesthetic:** A high-end Dark/Neon "Esports" vibe with real-time responsiveness.

---

## 🛠️ USER ROLES & HIERARCHY
1. **User (Pro):** Regular player. Can chat, forecast match calls, and buy gear.
2. **Creator (Partner):** Verified Room Owners (e.g., TaylorMade, PGA, Pro Streamers). Can moderate specific arenas.
3. **Admin (Moderator):** Platform support and user management.
4. **Super Admin:** Full platform control (sportsprophecyapp@gmail.com).

---

## 1. IDENTITY & REFERRALS
### 1.1 Persistent Handles (UUID)
- **Immutable Anchor:** System uses internal `user.id` so history/referrals never break if a user changes their @handle.
- **Identity Lab:** Profile page features a neon edit-mode for handle customization with real-time availability checks.

### 1.2 Bulletproof Referral Program
- **Dual-Rewards:** Both the Referrer (+50) and the New User (+50) receive tokens instantly.
- **Welcome Bonus:** New users start with 200 tokens (instead of 150) when using a referral link.

---

## 2. MAIN APP SCREENS
### 2.1 Homepage / Lobby (`/`)
- **Real-Data Focus:** Matches fetched every 15m/30m from API-Football and The Odds API.
- **League Sorting:** Match schedule automatically grouped by competition (EPL, La Liga, etc.).
- **Arena Standings:** Global rankings of the top-performing analysts.

### 2.2 Room Page (`/rooms/[roomId]`)
- **Native Experience:** Sticky `Predict | Ranks | Chat` tab bar for mobile.
- **The Call:** Users make their "Call" on live matches (Home/Draw/Away).
- **Official Sponsor Widget:** Real-time injection of active Stripe-verified sponsors.

---

## 3. SPONSOR ECOSYSTEM & PRIZE DRAWS
### 3.1 Automated Monetization
- **Self-Selling Placeholders:** Empty ad spots show "SPONSOR THIS ARENA" cards that link to Stripe-integrated pricing.
- **Auto-Activation:** Sponsor ads go LIVE instantly upon payment confirmation.

### 3.2 The Draw Commander (50/50 Strategy)
- **Ticket Stash:** Users track their earned tickets (from Skill, Streaks, and Referrals) on their profile.
- **Fair Resolution:** Admin panel features a 50/50 distribution engine:
    - **50% Skill:** Prizes awarded to the Top Pros on the Standings board.
    - **50% Engagement:** Prizes awarded via a verifiable random draw from all ticket holders.

---

## 4. COMPLIANCE & SAFETY
- **Non-Gambling:** Strict terminology audit (No "Bets," "Wagers," or "Money"). Purely skill and loyalty rewards.
- **Cultural Neutrality:** Terminology like "Ace" or "Prophet" is avoided in favor of "Pro" and "Standings" for global accessibility.
- **Keep-Alive:** Dual-ping service ensures the arena stays "warm" and responsive 24/7.

---
*This document serves as the master blueprint for the Sports Prophecy platform.*
