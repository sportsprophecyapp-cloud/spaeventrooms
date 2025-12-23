# Changelog

## [v2.12.5] - 2025-12-20
- **Super-Admin Protection**: Implemented permanent admin rights for sportsprophecyapp@gmail.com.
- **Security Enhancement**: Super-admin account cannot be demoted or managed by other administrators.
- **Admin Panel**: Super-admin is now excluded from the moderator management list.

## [v2.12.4] - 2025-12-19
- **Refined Guest CX**: Updated restrictiom alerts with more encouraging "Join the Club!" branding.
- **Extended Guest Restrictions**: Added registration prompts for room sponsorships and profile customizations (ID Name/Avatar changes).

## [v2.12.3] - 2025-12-19
- **Guest Restrictions**: Restricted chat rights and prize draw entries for guest users.
- **Improved CX**: Clear "Account Required" prompts added for restricted features to encourage user registration.

## [v2.12.2] - 2025-12-19
- **Policy Updates**: Updated Terms of Service and Help section with clear rules for public chat rooms.
- **Moderation Clarity**: Added specific clauses regarding Moderator and Administrator authority in community spaces.

## [v2.12.1] - 2025-12-19
- **Moderator Assignment**: Added ability for admins to assign moderators directly via user avatars in chat.
- **Admin Fail-Safe**: Improved admin role persistence during authentication.
- **Backend Stability**: Fixed "non-permission" 500 errors and improved authorization logging.
- **Moderation Flow**: Fixed "Unmute" action responsiveness and added descriptive error feedback.
- **Enhanced Error Feedback**: The frontend now displays specific backend error messages during moderation actions (Mute, Unmute, Ban, etc.) to provide clearer status updates.

### Fixed
- **Unmute Logic**: Fixed an issue where the "Unmute" action was unresponsive; it now correctly restores chat privileges and clears room bans.
- **Generic 500 Errors**: Eliminated "Internal Server Error" crashes during authorization by adding robust data validation and detailed server logging.

## [2.11.0] - 2025-12-19
### Added
- **Premium Badge Aesthetics**: Upgraded all verification badges with a high-quality "Metal & Glass" rendering engine, featuring 4-point chromatic gradients and glossy reflections.
- **Improved More Screen**: Added `@idName` display and integrated full `UserAvatar` system (including badges) into the profile card.

### Fixed
- **iPhone Input Stability**: Fixed horizontal screen widening on iPhone Safari by enforcing 16px font sizes and layout constraints.
- **Badge Icons**: Restored the "star" and "medal" symbols on Rookie and Crown King badges.
- **More Visibility**: Avatar and equipped badges are now visible in more parts of the app.

## [2.10.0] - 2025-12-18
### Added
- **Separate Badges From Avatars**: Users can now independently select their profile picture (avatar) and "equip" a specific badge to display in chat.
- **Account Deletion**: Added robust account deletion feature for policy compliance.
- **Improved Profile UI**: Consolidated profile update endpoint and enhanced avatar selection modal.

### Fixed
- **Version Reconciliation**: Aligned version numbers across frontend and backend.
- **ID Name Token Sync**: Synchronized token cost for ID Name changes to 50 tokens across UI and backend.
- **Chat UI**: Fixed minor duplicate code in badge rendering.

## v2.9.10 (December 18, 2025)
- **FEATURE**: Profile Pictures (Choose from presets or upload from gallery).
- **API**: Consolidated Profile Update endpoint with ID name change support.
- **LEADERBOARD**: Optimized thresholds (Weekly: 5, Monthly: 20, All-Time: 100) and accuracy scoring.
- **REWARDS**: Enhanced Daily Rewards with 7-day streak bonuses.
- **COMPLIANCE**: Added in-app Account Deletion functionality.
- **FIX**: Corrected versioning across app and backend.

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
