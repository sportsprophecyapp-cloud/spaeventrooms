# Events Arena - v3.4.6

**Version**: 3.4.6  
**Release**: January 13, 2026

Events Arena is a high-performance prediction & engagement platform designed for sports, TV, and creator-led events. It features a premium glassmorphic UI, a robust dual-currency economy, and achievement-gated rewards.

## 🚀 Key Features

- **⚜️ Honors & Hall of Fame:** Automated "Grand Champion" rewarding. High-tier items are "Earned, Not Bought."
- **🗺️ Referral Roadmap:** Animated 4-tier recruitment path with escalating rewards and integrated sharing.
- **💰 Dual Economy:** Tokens for standard shop items and Prize Tickets for high-stakes draw entries.
- **🏢 Sponsor Hub:** Creative Studio for partner onboarding, real-time ad placement, and performance analytics.
- **✨ Premium UI:** Native-quality glassmorphism (`30px blur`), fluid mobile response, and high-fidelity crests.
- **🛡️ Brand Trust:** Integrated Founder's Letter and social proof feedback systems.

## 🎮 How to Play
1. **Predict:** Swipe match cards to predict winners (Risk-free).
2. **Win:** Earn **XP** and **Tokens** for every call. Earn **Tickets** for Correct Calls.
3. **Customize:** Spend Tokens on exclusive Avatars and Frames in the Shop.
4. **Draws:** Enter Tickets into the **Draw Room** for a chance to win real sponsor prizes.

## 🗺️ Feature Map
- `/rooms/soccer`: Live match predictions and real-time scores.
- `/draw`: The prize economy hub.
- `/profile`: Personal performance history, rank, and equipped items.
- `/achievements`: Progress-based cosmetic unlocks.
- `/corporate`: The story and vision of the Arena.

## 🛠️ Architecture
- **Frontend:** Next.js 16 (Outfit/Merriweather Fonts, React Spring Animations).
- **Backend:** Node.js/Express (PostgreSQL, Socket.io, Express 50MB Payload support).
- **Data:** The Odds API with robust key rotation and local logo manifest synchronization.
- **Compliance:** Full store compliance with zero wagering terminology and secure account deletion.

## 📦 Getting Started
1. `npm install` in `/frontend` and `/backend`.
2. Sync `.env` from `.env.example`.
3. `npm run dev` to launch the arena.

---
*Built for the next generation of social competition. Pribadi.*
