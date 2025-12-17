# Sports Prophecy App (v2.9.1)

> **The Ultimate Free Sports Prediction Platform**

Sports Prophecy is a **100% free** React Native application that allows users to predict the outcomes of games across major sports leagues (NBA, NFL, NHL, MLB, EPL, MLS). Users compete for **tokens** and **crowns**, climb the leaderboard, and enter weekly prize draws sponsored by real brands.

**App Store Description Disclaimer:**
Sports Prophecy is a skill-based sports prediction platform for entertainment purposes. No gambling, wagering, or cash payouts are offered.

---

## 📱 Features

### 🎮 Core Gameplay
- **Predict & Earn**: Predict match winners to earn Tokens and Crowns.
- **Score Bonus**: Predict exact scores to earn Crowns.
- **Leagues**: comprehensive coverage of NBA, NFL, NHL, MLB, EPL, and MLS.
- **Leaderboard**: Ranked by correct predictions to highlight true sports knowledge.

### 🏆 Rewards & Prizes
- **Weekly Prize Draws**: Use Crowns to enter draws for physical prizes.
- **Sponsorships**: Real brands sponsor specific draws and rooms.
- **Referral System**: Invite friends to earn bonus currency.

### 💬 Community
- **Chat Rooms**: Public lobby, league-specific channels, and **Private Rooms** with password protection.
- **Live Updates**: Real-time game data powered by The Odds API.

---

## � Compatibility & Testing

This application has been rigorously tested and verified on the following platforms:

| Platform | Device/Browser | Status |
|----------|---------------|--------|
| **Android** | Physical Devices & Emulators | ✅ Verified |
| **iOS** | iPhone & iPad | ✅ Verified |
| **Web** | Chrome (Desktop/Mobile) | ✅ Verified |
| **Web** | Safari (Mac/iOS) | ✅ Verified |

## �🛠 Tech Stack

- **Frontend**: React Native (Expo SDK 50+), React Navigation
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: Custom JWT Auth + Biometric Login (FaceID/TouchID)
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
    npm install
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

For a detailed list of changes, please refer to [CHANGELOG.md](./CHANGELOG.md).

**Current Version: v2.9.1**
- **Hotfix**: Resolved Login Failure (API URL config).
- **Security**: Enforced Private Room password protection.
- **Feature**: Restricted Guest Chat access.
- **Enhancement**: Improved Referral Notifications.
- **Assets**: Updated App Icon (512px).

---

## 📞 Support

For support inquiries, bug reports, or sponsorship opportunities:
- **Email**: Contact@sportsprophecyapp.com
- **In-App**: Navigate to *More > Help & Support*

---
*© 2025 Sports Prophecy. All Rights Reserved.*
