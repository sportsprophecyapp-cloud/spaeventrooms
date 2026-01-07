# Sports Prophecy - UX Design Document
**Version 1.1 | January 2026**

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
- Default: Email prefix (e.g., @sportsprophecyapp).
- Editing: High-energy identity edit field on the Profile Page with availability checks.

### 1.2 Auth Flow
- Dedicated `/auth/login` and `/auth/register` pages.
- Smart Redirects: "Enter Room -> Login -> Auto-return to Room."
- Compliance: Forms include all necessary attributes for accessibility and autofill.

---

## 2. MAIN APP SCREENS
### 2.1 Homepage / Lobby (`/`)
- **Compact Mobile Header:** Shrunk logo/tagline to show rooms "above the fold."
- **Quick Nav:** Mobile-optimized rankings and profile buttons.
- **Legal Disclaimer:** Persistent footer stating: *"Sports Prophecy is a social platform for entertainment purposes only. No real money can be won or wagered."*

### 2.2 Room Page (`/rooms/[roomId]`)
- **3-Column Layout (Desktop):** [Predictions] | [Ranks] | [Live Chat].
- **Tab System (Mobile):** Sticky `Predict | Ranks | Chat` bar for native app feel.
- **Official Sponsor Widget:** Real-time injection of active Stripe-verified sponsors.

---

## 3. SPONSOR ECOSYSTEM (Monetization)
### 3.1 Automated Ad Slots
- **Placeholder System:** Empty slots show "SPONSOR THIS ARENA" cards that link to pricing.
- **Tiered Packages:** Starter, Growth, and Premium tiers via Stripe.
- **Auto-Activation:** Ad is instantly LIVE the moment Stripe confirms payment.
- **Admin Alerts:** Automatic email notifications to `sportsprophecyapp@gmail.com` for checkouts and payments.

---

## 4. GAMIFICATION & ENGAGEMENT
### 4.1 Token Shop & Cosmetic Lab
- **"Try-on" Preview:** Users see gear on their avatar before spending tokens.
- **Prophecy Gear:** High-end titles like "Master Seer" and "Gilded Aura."
- **Animations:** High-energy `+10 PTS` floating score animations on successful prophecies.

### 4.2 Social & Discussion
- **Live Arena Chat:** Real-time room-wide communication with user level badges.
- **Poll Discussions:** Collapsible comment sections under every specific forecast.

---

## 5. COMPLIANCE & SAFETY
- **Non-Gambling:** No "Bets," "Wagers," or "Payouts." Only "Prophecies," "XP," and "Rewards."
- **Age Gating:** 13+ only (Enforced in terms).
- **Data Privacy:** Full transparency on data handling and deletion.

---
*This document serves as the master blueprint for the Sports Prophecy platform.*
