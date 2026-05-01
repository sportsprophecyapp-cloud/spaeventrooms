# 🤖 AI Handoff & Knowledge Base: Events Arena
**Version 1.0.0 (April 30, 2026)**

> [!IMPORTANT]
> **MANDATORY FIRST STEP**: If you are an AI assistant starting a new session in this repository, you MUST read this file and `MASTER_REFERENCE.md` before taking any action. This document contains the current "state of mind" for the project.

## 🌟 Project North Star
Events Arena is a **high-fidelity, second-screen fan engagement platform**. It is NOT a gambling site. It uses a "Predict-to-Win" model with social gamification, premium 3D glassmorphism, and tinder-swipe mechanics to drive user retention.

## 🏗 Current Architecture & Separation
The project maintains a strict **Separation of Concerns** between Web and Mobile:
- **Web (`/frontend`)**: Next.js. Focuses on SEO, OpenGraph viral unfurls, and desktop-first mouse/touch interactions via `react-spring`.
- **Mobile (`/mobile`)**: Expo/React Native. Focuses on native-grade performance, thumb-based gestures (`reanimated`), haptic feedback, and visual share-cards for Instagram/Snapchat.
- **Backend (`/backend`)**: Express/TypeScript. Centralized API serving both platforms. Handles odds polling, prediction resolution, and prize draw logic.

## 🏆 Recent Major Milestones (April 2026)
- **Mobile "Arena" Parity**: Fully implemented Tinder-style swipe decks in the mobile app.
- **Hero Glow Engine**: Visual feedback system (Cyan/Magenta glows) added to both platforms.
- **Viral Sharing 2.0**: 
    - **Web**: OG meta tags and Twitter Cards.
    - **Mobile**: `PredictionShareCard` using `view-shot` for story-ready graphics.
- **NHL Integration**: Added NHL as a first-class sport with dedicated table structures.

## 🛑 Critical Constraints & "Do's/Don'ts"
1.  **NO GAMBLING TALK**: Avoid "bet", "wager", "odds" (in user-facing UI), or "gambling". Use "Predict", "Prophesy", "Tokens", and "Prizes".
2.  **Premium Aesthetics**: All UI must use the defined **HSL color palette**, glassmorphism (blurs), and smooth micro-animations. Default browser styles are UNACCEPTABLE.
3.  **Separate but Equal**: Do not try to share logic between `/frontend` and `/mobile` if it compromises platform performance. Parity is about the *experience*, not necessarily the *code*.
4.  **Unique CSS**: In Web, always use unique filenames for CSS modules to avoid Render build cache issues.

## 🛠 Next Steps & Suggestions (Phase 34+)
- **Multi-Prediction System**: Expand the swipe deck to handle "Both Teams to Score" and "Total Goals" as secondary cards.
- **Live Match Sync**: Real-time ticker updates in the Arena via Socket.io.
- **Haptic Tuning**: Fine-tune mobile haptics for "success" (vibration on pick) vs "error" (vibration on limit).

## 💡 How to Improve AI Continuity (Tips for the USER)
To ensure the best results when starting new AI sessions:
1.  **Reference this file**: Start your first prompt with "Read `AI_HANDOFF.md` and `MASTER_REFERENCE.md` to catch up."
2.  **Update the Handoff**: Ask the AI to "Update `AI_HANDOFF.md` with our progress" before ending a long session.
3.  **Pin Documents**: Keep these reference files open in your editor; most AI agents prioritize "open files" as high-priority context.
4.  **Task Tracking**: Maintain `task.md` as a living TODO list. The AI uses this to understand where we left off.

---
*Created by Antigravity (April 30, 2026)*
