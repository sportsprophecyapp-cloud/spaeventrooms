# Sports Prophecy - UX Design Document
**Version 1.0 | January 2026**

## 🎯 Overview
This document details every major screen and user interaction in Sports Prophecy, from onboarding through active gameplay.

### Design Principles:
- Dark mode (gaming aesthetic)
- Fast, responsive interactions
- Clear information hierarchy
- Mobile-first responsive design
- Progressive disclosure (hide complexity)

---

## 1. AUTHENTICATION FLOW
### 1.1 Login Screen (`/auth/login`)
- **Purpose:** Entry point for existing users.
- **Interactions:** Tab between fields, "SIGN UP" and "RESET" links.
- **States:** Loading spinner on button, error highlights.

### 1.2 Signup Screen (`/auth/register`)
- **Purpose:** New user registration.
- **Features:** Real-time validation, password strength indicator, Terms checkbox.
- **Referral Integration:** Automatic +50 tokens for referrers via `?ref=USER_ID`.

---

## 2. ONBOARDING FLOW (FTUE)
- **Step 1: Welcome:** Quick 2-min tour intro.
- **Step 2: Tokens:** Explains earning (Daily login, Sharing, Referral).
- **Step 3: First Prediction:** Guided practice prediction with YES/NO toggle.
- **Step 4: Leaderboard:** Shows user's rank relative to others.
- **Step 5: Token Shop:** Preview of cosmetic items (Avatars, Frames, Badges).

---

## 3. MAIN APP SCREENS
### 3.1 Homepage / Lobby (`/`)
- Header with Menu, Token Bar, Shop link.
- **Sponsor Placements:** Premium Banner + Footer Carousel.
- **Sections:** Live Now, Upcoming (24h), Global Leaderboard Preview.
- **Bottom Nav:** [HOME] [LIVE] [LEADERBOARD] [PROFILE].

### 3.2 Room Page (`/rooms/[roomId]`)
- **Active Gameplay:** Question card with live vote % (YES/NO).
- **Social:** Live Chat + Share Room button (+50 tokens).
- **Competition:** Room-specific Top 5 Leaderboard.
- **Mobile:** Collapsible Leaderboard and Chat sections.

### 3.3 Token Shop (Modal)
- Filter by Avatars, Frames, Badges.
- Affordability indicators (grayed out if insufficient funds).
- "✓ OWNED" status and "Preview on Avatar" functionality.

### 3.4 User Profile (`/profile/[userId]`)
- Showcase equipped cosmetics (Avatar/Frame).
- Stats: Accuracy, Streak, Level, Total Predictions.
- History: Recent results (✓ CORRECT / ✗ INCORRECT).

### 3.5 Daily Login & Rewards
- Navbar button to claim daily tokens.
- Streak bonuses: Day 7 (+100), Day 30 (+500).

---

## 4. INTERACTION PATTERNS
- **Prediction Loop:** Click -> Glow -> Countdown -> Resolve -> Score Animation.
- **Cosmetic Purchase:** Preview -> Confirm -> Animate Balance Change -> Equip Prompt.
- **Share & Earn:** Generate Link -> Copy -> Animate Token Gain -> Cooldown Timer.

---

## 5. TECHNICAL & DESIGN SPECS
- **Colors:** Background `#050505`, Cards `#1a1a2e`, Accent `Electric Blue`, Success `Neon Green`.
- **Glassmorphism:** `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(10px)`.
- **Responsive:** 3-col (Desktop), 2-col (Tablet), 1-col (Mobile with Tabs).
- **Performance:** Load time <3s, 60fps animations.

---
*Document stored for AI/Developer reference.*
