# Sports Prophecy App (v2.17.5)

> **The Ultimate Free Sports Prediction Platform**

Sports Prophecy is a **100% free** React Native application that allows users to predict the outcomes of games across major sports leagues (NBA, NFL, NHL, MLB, EPL, MLS). Users compete for **tokens** and **crowns**, climb the leaderboard, and enter weekly prize draws sponsored by real brands.

**App Store Description Disclaimer:**
Sports Prophecy is a skill-based sports prediction platform for entertainment purposes. No gambling, wagering, or cash payouts are offered.

---

## 📱 Features

### 🎮 Core Gameplay
- **Predict & Earn**: Predict match winners to earn Tokens and Crowns.
- **Score Bonus**: Predict exact scores to earn bonus Crowns.
- **Leagues**: Comprehensive coverage of NBA, NFL, NHL, MLB, EPL, and MLS.
- **Leaderboard**: Ranked by correct predictions to highlight true sports knowledge.

### 🏆 Rewards & Prizes
- **Weekly Prize Draws**: Use Crowns to enter draws for physical prizes.
- **Sponsorships**: Real brands sponsor specific draws and rooms.
- **Referral System**: Invite friends to earn bonus currency.

### 💬 Community & Social
- **Chat Rooms**: Public lobby, league-specific channels, and **Private Rooms** with password protection.
- **Profile Customization**: Users can select custom **Profile Pictures** and equip **Badges** (Premium Metal & Glass aesthetics).
- **Moderation**: Robust tools for Admins/Moderators (Mute, Ban, Kick).
- **Live Updates**: Real-time game data powered by The Odds API.

---

## 💻 Compatibility & Testing

This application has been verified on the following platforms:

| Platform | Device/Browser | Status |
|----------|---------------|--------|
| **Android** | Physical Devices & Emulators | ✅ Verified |
| **iOS** | iPhone & iPad | ✅ Verified |
| **Web** | Chrome (Desktop/Mobile) | ✅ Verified |
| **Web** | Safari (Mac/iOS) | ✅ Verified |

## 🛠 Tech Stack

- **Frontend**: React Native (Expo SDK 54), React 19, React Navigation 7
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: Custom JWT Auth + Biometric Login (FaceID/TouchID) + Google Sign-In
- **Payments**: Stripe Integration (for Sponsor Ads)
- **Platform**: iOS, Android, Web (Responsive)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- The Odds API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-repo/mobile.git
    cd mobile
    ```

2.  **Install Dependencies**
    ```bash
    # Install frontend dependencies
    npm install

    # Install backend dependencies
    cd backend && npm install && cd ..
    ```

3.  **Environment Setup**
    Create a `.env` file in `backend/` with the following:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    THE_ODDS_API_KEY=your_odds_api_key
    STRIPE_SECRET_KEY=your_stripe_secret
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook
    PORT=3001
    ```

4.  **Run Locally**
    - **Backend**: `cd backend && npm run dev`
    - **Frontend**: `npx expo start`

---

## 📦 Deployment

### Production URLs
- **Web App**: [www.sportsprophecyapp.com](https://www.sportsprophecyapp.com)
- **API**: `https://sportsprophecy-backend-8gqhm2rpa.vercel.app`

### Build for Stores
This project is configured for **EAS Build**.

```bash
# iOS Production Build
eas build --platform ios --profile production

# Android Production Build
eas build --platform android --profile production
```

---

## 📜 Version History

See [CHANGELOG.md](./CHANGELOG.md) for the full history of changes.

**Latest Update: v2.17.5 (December 2025)**
- **Hotfix 3 (Absolute Bulletproof)**: Refactored `api.js` to force array returns, hardened `SportScreen` sorting, and finalized Cyan Streak UX.
- **v2.17.4**: Hotfix 2 - Defensive audit and positive streak reinforcement.
- **v2.17.2**: UX/UI Overhaul (v2.0) - Prophet Midnight Palette migration.

**v2.17.0 (December 2025)**
- **Auth Portal Architecture**: Consolidated all entry flows into a single-route, zero-redirect experience.
- **Hero Social Buttons**: Immediate access to Google/Apple sign-in from the main hero section.
- **Flicker-Free Load**: Optimized hydration logic to eliminate flashes and route jumps.
- **Winner Accuracy**: Updated hardcoded social proof references for factual consistency.


---

## 📞 Support

For support inquiries, bug reports, or sponsorship opportunities:
- **Email**: Contact@sportsprophecyapp.com
- **In-App**: Navigate to *More > Help & Support*

---
*© 2025 Sports Prophecy. All Rights Reserved.*
