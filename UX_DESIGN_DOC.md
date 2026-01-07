# Events Arena - UX Design Document
**Version 1.8 | January 2026**

## 🎯 Overview
Events Arena is a versatile, high-energy interactive engagement platform designed for **entertainment and social competition**. It is optimized for cross-platform expansion into sports, TV, and creator-led events.

### Core Philosophy:
- **PWA Strategy (Native-Like):** Designed as a Progressive Web App to bypass App Store friction. Users "Add to Home Screen" for a full-screen, immersive experience without downloads.
- **The Brand Bridge:** Users entering via legacy domains are greeted with: *"Sports Prophecy welcomes you to the Events Arena."*
- **Mutual Benefit:** Users get a free, gamified interactive experience. Sponsors get automated, high-visibility ad placements.

---

## 🏗️ SYSTEM ARCHITECTURE (Real-Time Data)
- **High-Frequency Dual-Sync:** API-Football (15m) + The Odds API (30m).
- **Smart Key Rotation:** Failover across 4+ API keys to ensure 100% uptime.
- **Auto-Resolution:** Every 15 minutes, the engine awards **+100 XP** and **+1 Prize Draw Ticket**.

---

## 🛠️ USER ROLES & HIERARCHY
1. **User (Pro):** Regular player. Can chat, forecast calls, and buy gear.
2. **Creator (Partner):** Room Owners. Can moderate and co-brand specific arenas.
3. **Admin (Moderator):** Platform-wide support.
4. **Super Admin:** Full control (sportsprophecyapp@gmail.com).

---

## 1. IDENTITY & REFERRALS
### 1.1 Persistent Handles (UUID)
- **Immutable Anchor:** Uses DB `user.id`. Identity remains stable even if handle changes.
- **Identity Lab:** Profile page features a neon edit-mode for real-time customization.

### 1.2 Dual-Reward Referrals
- **The Reward:** Both Referrer and New User receive **+50 tokens** instantly.
- **The Welcome:** Referral signups start with 200 tokens.

---

## 2. MAIN APP SCREENS
### 2.1 Homepage / Lobby (`/`)
- **Compact UX:** Mobile-optimized header showing active arenas "above the fold."
- **PWA Ready:** Manifest and meta-tags configured for "Add to Home Screen" prompts.

### 2.2 Room Page (`/rooms/[roomId]`)
- **Native Navigation:** Sticky `Predict | Standings | Chat` tab bar for mobile.
- **Interactive Discussion:** Collapsible comments under every specific prophecy.

---

## 3. SPONSOR ECOSYSTEM & PRIZE DRAWS
### 3.1 Automated Monetization
- **Self-Selling Slots:** Automated placeholders link to Stripe-integrated pricing.
- **Auto-Activation:** Ad placements go LIVE instantly upon payment confirmation.

### 3.2 Draw Commander (50/50 Strategy)
- **Ticket Stash:** Users track tickets earned from skill, streaks, and referrals.
- **Fair Resolution:** 50% Skill (Leaderboard) / 50% Engagement (Random Draw).

---

## 4. COMPLIANCE & SAFETY
- **Non-Gambling:** Strictly skill and loyalty based. No real-money wagering.
- **Cultural Neutrality:** Modern terminology ("Pro", "Standings", "Call") for global appeal.
- **Keep-Alive:** Dual-ping service ensures 24/7 site responsiveness.

---
*This document serves as the master blueprint for the Events Arena platform.*
