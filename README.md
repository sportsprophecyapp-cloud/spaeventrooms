# Events Arena - v4.0.0

**Version**: 4.0.0  
**Release**: April 29, 2026

Events Arena is a high-performance prediction & engagement platform designed for sports, TV, and creator-led events. It features a premium glassmorphic UI, a robust dual-currency economy, and achievement-gated rewards.

## 🚀 Key Features

- **🩹 Auto-Heal Engine:** Integrated server startup maintenance that automatically resolves prediction backlogs and secures data integrity.
- **🎲 Multi-Entry Draws:** Increased user engagement via re-entry capabilities for prize draws with weighted winning probabilities.
- **⚜️ Honors & Hall of Fame:** Automated "Grand Champion" rewarding. High-tier items are "Earned, Not Bought."
- **✨ Premium UI:** Native-quality glassmorphism (`30px blur`), ultra-compact history view, and high-fidelity crests.
- **🏒 Multi-Sport Support:** Independent tracking for Soccer and NHL predictions, optimizing API usage and maintaining a $0 cloud budget.

## 🎮 How to Play
1. **Predict:** Swipe match cards to predict winners (Risk-free).
2. **Win:** Earn **XP** and **Tokens** for every call. Earn **Tickets** for Correct Calls.
3. **Customize:** Spend Tokens on exclusive Avatars and Frames in the Shop.
4. **Draws:** Enter Tickets into the **Draw Room** for a chance to win real sponsor prizes.

## 🗺️ Feature Map
- `/rooms/soccer`: Live soccer match predictions and real-time scores.
- `/rooms/nhl`: Live NHL hockey predictions.
- `/draw`: The prize economy hub.
- `/profile`: Personal performance history, rank, and equipped items.
- `/achievements`: Progress-based cosmetic unlocks.
- `/corporate`: The story and vision of the Arena.

## 🛠️ Architecture
- **Infrastructure:** Render Free Tier (Sustainable $0 Infrastructure).
- **Database:** Neon PostgreSQL 17 (Permanent Free Tier).
- **Backend:** Node.js/Express with **SystemMaintenanceService** for automated backlog resolution.
- **Frontend:** Next.js 16 with optimized scrollable history and glassmorphic UI.
- **Data:** The Odds API with robust key rotation and 3-hour resolution safety nets.

## 📦 Getting Started
1. `npm install` in `/frontend` and `/backend`.
2. Sync `.env` from `.env.example`.
3. `npm run dev` to launch the arena.
4. **Deploy:** Git push to `main` (Auto-builds on Render Free Tier).

---
*Built for the next generation of social competition. Pribadi.*
