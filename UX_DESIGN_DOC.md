# Events Arena - UX Design Document
**Version 3.4.6 | January 2026**

## 🎯 Overview
Events Arena is a high-prestige engagement platform that gamifies cultural moments through sports, TV, and creator events. It features a "Pure Live" production data infrastructure and a premium, glassmorphic visual system.

### Core Philosophy:
- **Elite Recognition:** Rewards are earned, not bought. High-tier cosmetics are strictly achievement-gated.
- **Pure Prediction:** Tinder-style swipe mechanics with real-time API resolution.
- **Digital-First Economy:** Zero-liability redemption codes for prizes.
- **Sponsor Synergies:** Instant partner onboarding with creative studio tools and performance analytics.

## 🎨 VISUAL SYSTEM (v3.4)
- **Glassmorphism Premium:** Deep blurs (`blur(30px)`), rim-lighting, and neon accents (Cyan/Magenta).
- **Match Card Architecture:** 1:1 consistent layout across mobile/desktop using `clamp()` logic.
- **Arena Navigation:** Dynamic league grid with instructional overlays for new recruits.
- **Roadmap Visuals:** Animated, node-based tracking for recruitment and honors progression.
- **Future Concept - Multi-Step Cards:** Evolution of the swipe mechanic where one card handles multiple prediction types (Winner → Total → BTTS) through sequential "inner swipes" before being discarded.

## 💰 ECONOMY & REWARDS
Events Arena operates on a dual-currency system designed for sustainable engagement:

### 1. Tokens (Spending Currency)
- **Earn:** Daily Logins, Successful Predictions, Referral Milestones.
- **Spend:** Standard Cosmetics (Avatars/Frames) in the Token Shop.

### 2. Prize Tickets (Entry Currency)
- **Earn:** Winning Streaks, Referral Milestones, High Accuracy.
- **Utility:** Used to enter Sponsor Prize Draws in the `/draw` room.

### 3. XP & Ranks
- **Earn:** Every swipe and interaction builds XP.
- **Progression:** Novice → Veteran (1k XP) → Elite (2.5k XP) → Legendary (5k XP).

## 🏆 THE HONORS SYSTEM (Grand Champion)
The "Hall of Fame" distinguishes the elite from the masses.
- **Achievement Gating:** High-fidelity items (e.g., Grand Champion Avatar) cannot be purchased. They appear as "Motive Previews" (grayscale) until unlocked.
- **Grand Champion:** Awarded automatically to prize draw winners.
- **Status Indicators:** Equipped honors persist across chat, profile, and leaderboards.

## 🗺️ SOCIAL GROWTH (Referral Roadmap)
Recruitment is a visual journey with 4 distinct milestones:
1. **Recruiter (1 Recruit):** Entry Badge + 100 Tokens.
2. **Guardian (10 Recruits):** "Social Guardian" Frame + 500 Tokens.
3. **Influencer (25 Recruits):** "Arena Influencer" Avatar + 1k Tokens.
4. **Master (50 Recruits):** "Network Master" Elite Avatar + 2.5k Tokens + Custom Uploads.

| Keep-Alive 404s | ✅ FIXED (May 5) | Added /health endpoint to prevent free tier spin-downs |
| Duplicate 2X Cards | ✅ FIXED (May 11)| Implemented aggressive deduplication & consolidated to 1-card-per-match |

## 💡 FUTURE ROADMAP & IDEAS

### 1. Multi-Step "Story" Cards
- **Problem**: Showing 3 separate cards for Winner, Total, and BTTS feels like "duplicate" work to the user.
- **Solution**: One card per match. The user swipes 3 times *within* the same card.
  - Swipe 1: Winner (Card stays, labels change).
  - Swipe 2: Over/Under (Card stays, labels change).
  - Swipe 3: BTTS (Card finally flies away).
- **Goal**: High engagement with low perceived effort.

## 🏢 SPONSOR UX (Partner Hub)
Sponsors are integrated into the heart of the action without breaking immersion:
- **Creative Studio:** Self-service ad design with real-time placement previews.
- **Integrated Inventory:** Sponsor Marquees (Header), Card Footers ("Powered By"), and Official Draw Rooms.
- **Feedback Loop:** Winners provide star ratings and social testimonials, creating social proof for partners.
- **Analytics:** Admins can generate instant performance reports (Impressions/Clicks) for sponsors.

## 🛠️ USER ROLES
1. **Supporter (User):** Predicts, earns, and competes.
2. **Admin (Moderator):** Approves sponsors, picks winners, manages the economy, and broadcasts live announcements.

## 🛡️ COMPLIANCE & SAFETY
- **Transparency:** Founder's Letter establishes vision and trust.
- **Privacy:** One-click account deletion and clear legal routing to `contact@sportsprophecyapp.com`.
- **Integrity:** Zero tolerance for prohibited wagering terminology.

---
*This document is the authoritative blueprint for the Events Arena ecosystem.*
Pribadi.
