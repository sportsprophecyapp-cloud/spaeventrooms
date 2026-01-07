# Sports Prophecy - UX Design Document
**Version 1.2 | January 2026**

## 🎯 Overview
Sports Prophecy is a full-stack, high-energy sports engagement platform designed for **entertainment and social competition**. It is strictly **NOT a gambling site**. Users "prophesy" (forecast) live game outcomes to earn status and rewards, while sponsors gain highly targeted brand exposure.

### Core Philosophy:
- **Mutual Benefit:** Users get a 100% free, gamified second-screen experience. Sponsors get automated, high-visibility ad placements.
- **Skill over Luck:** Everything is framed as "Prophecy" and "Knowledge," avoiding all gambling terminology.
- **Gaming Aesthetic:** A high-end Dark/Neon "Esports" vibe with Glassmorphism and real-time responsiveness.

---

## 🛠️ USER ROLES & HIERARCHY
1. **Prophet (User):** Regular user. Can chat, forecast, and buy gear.
2. **Creator (Partner):** Room Owners (e.g., TaylorMade, PGA, Twitch Streamers). Can moderate their own rooms.
3. **Admin (Moderator):** Platform-wide support and moderation.
4. **Super Admin:** Full platform control (sportsprophecyapp@gmail.com).

---

## 1. AUTHENTICATION & IDENTITY
### 1.1 Custom Prophet Handles (UUID)
- Users can choose a unique **Prophet Handle** (e.g., @GamerPro).
- **Bulletproof Persistence:** The system uses the DB `user.id` as the anchor. If a user changes their handle or email, their historical data and referral codes remain active.
- Editing: High-energy identity edit field on the Profile Page with availability checks.

### 1.2 Bulletproof Referral Program (Dual-Rewards)
- **Anchor:** Referral links use the numeric `user.id` (e.g., `/register?ref=104`) for privacy and technical stability.
- **Dual-Reward Loop:** 
    - **Sender (Referrer):** Receives **+50 tokens** instantly upon successful signup.
    - **Receiver (New Prophet):** Receives a **+50 token Welcome Bonus** (Starting balance: 200).
- **Trust:** Automated transaction logs notify both users: *"Welcome Bonus: Referred by @ProphetX"*.

---

## 2. MAIN APP SCREENS
### 2.1 Homepage / Lobby (`/`)
- **Real-Data Focus:** Matches are fetched in high-frequency (15m/30m) from API-Football and The Odds API.
- **League Sorting:** Match schedule is automatically grouped by competition (EPL, La Liga, etc.) with logos.
- **Legal Disclaimer:** Persistent footer stating: *"Sports Prophecy is a social platform for entertainment purposes only."*

### 2.2 Room Page (`/rooms/[roomId]`)
- **3-Column Layout (Desktop):** [Predictions] | [Ranks] | [Live Chat].
- **Tab System (Mobile):** Sticky `Predict | Ranks | Chat` bar for native app feel.
- **Official Sponsor Widget:** Real-time injection of active Stripe-verified sponsors.

---

## 3. SPONSOR ECOSYSTEM (Monetization)
### 3.1 Automated Ad Slots
- **Placeholder System:** Empty slots show "SPONSOR THIS ARENA" cards that link to pricing.
- **Recommendation Logic:** Placeholders suggest appropriate tiers based on the room's high-traffic spots.
- **Auto-Activation:** Ad is instantly LIVE the moment Stripe confirms payment.
- **Admin Alerts:** Automatic email notifications to `sportsprophecyapp@gmail.com` for checkouts and payments.

---

## 4. GAMIFICATION & ENGAGEMENT
### 4.1 Token Shop & Cosmetic Lab
- **"Try-on" Preview:** Users see gear on their avatar before spending tokens.
- **Animations:** High-energy `+10 PTS` floating score animations on successful prophecies.

### 4.2 Automatic Resolution Engine
- **The Loop:** Every 15 minutes, the system checks finished match scores against pending prophecies.
- **XP & Levels:** Correct forecasts automatically award +100 Points and increase user levels.

---

## 5. COMPLIANCE & SAFETY
- **Non-Gambling:** Strict terminology audit (No "Bets," "Wagers," or "Payouts"). 
- **Time as Currency:** Users earn entry into **Sponsor Prize Draws** through engagement and consistency (Grind), not financial risk.

---
*This document serves as the master blueprint for the Sports Prophecy platform.*
