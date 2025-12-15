# Changelog

## v2.9.1 (December 13, 2025)
- **SECURITY**: Fixed critical bug where Private Room passwords could be bypassed.
- **FEATURE**: Restricted Chat access for Guest users (Prompt to Register).
- **ENHANCEMENT**: Added confirmation notification for new users joining via referral code.
- **FIX**: Resolved "Login Failed" issue by correcting Production API URL configuration.
- **ASSETS**: Updated App Icon to 512x512 standard.
- **DOCS**: Professionalized README and documentation.

## v2.9.0 (December 11, 2025)
- **FIX**: Web Session persistence (Optimistic UI + Storage cleanup).
- **UX**: Removed annoying Safari logout confirmation dialog.
- **UI**: Visual polish for Quick Access tabs and Room Creation.
- **PAYMENTS**: Fixed Stripe integration (Invalid API Key error resolved).

## v2.8.0 (December 11, 2025)
- **AUTH**: Added Forgot/Reset Password, Terms, and Privacy Policy screens.
- **ADS**: Enhanced Sponsor Ad placements (Chat Rooms, Prize Draws).
- **LAYOUT**: Fixed horizontal scrolling issues on mobile devices.

## v2.7.0 (December 9, 2025)
- **ADMIN**: Complete Sponsor Management dashboard (Approve/Reject/Delete ads).
- **FEATURE**: Dynamic Prize Draw system with integrated sponsor banners.
- **API**: New admin endpoints for ad moderation.

## v2.6.0 (December 9, 2025)
- **AUTH**: Added Biometric Login (FaceID/TouchID).
- **ADS**: Linked Announcements to Sponsor purchase flow.

## v2.5.0 (December 5, 2025)
- **FIX**: Critical login navigation and "Remember Me" persistence fixes.
- **PERF**: Reduced game load time (1.5s -> 0.5s).

## v2.4.9 (December 5, 2025)
- **GUEST MODE**: Overhauled Guest experience (Prediction locking, auto-load, seamless conversion).

## v2.4.0 (December 3, 2025)
- **FEATURE**: Automated Stripe Sponsorship system.
- **FEATURE**: Chat Rooms (Public/League/Private).
- **METRIC**: Leaderboard now ranks by check `correctPredictions`.

## v1.0.0 - v2.2.0
- Initial release and foundational feature sets (Prophecy engine, Tokens, Crowns, Cron jobs).
