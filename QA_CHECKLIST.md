# ✅ Core Feature QA Checklist (v1.1)

This document is a mandatory pre-flight check before any `deploy.sh` command is recommended. It serves as a guard against regressions in the platform's most critical user-facing functions.

## 📋 Pre-Deployment Verification

### Authentication & Access
- `[ ]` **Login:** User can successfully log in with correct credentials.
- `[ ]` **Logout:** User can successfully log out from the `UserTray` dropdown.
- `[ ]` **Admin Access:** An admin user can see the "Command Center" and "Arena Wizard" links in the `UserTray`.
- `[ ]` **Session:** A logged-in user remains logged in after a page refresh.

### New User Onboarding (v1.1 Update)
- `[ ]` **Chat Access:** A newly registered user can successfully send a message in the chat.
- `[ ]` **Initial Balance:** A newly registered user starts with 150 Tokens and 0 Tickets.
- `[ ]` **Draw Room Access:** User can navigate to `/draw` from the `UserTray` or Prediction Completion screen.

### Economy & Balances
- `[ ]` **Balance Visibility:** The `UserTray` correctly displays the logged-in user's Token and Ticket balances.
- `[ ]` **Balance Consistency:** The balance in the `UserTray` matches the balance on the `/profile` page.
- `[ ]` **Reward Pipeline:** A correct prediction on a finished match correctly increments a user's `total_tickets` and `total_points` in the database.

### Core Gameplay Loop
- `[ ]` **Prediction:** User can successfully make a prediction on a `scheduled` match.
- `[ ]` **Prediction Lock:** User cannot predict on a match that is `live` or `finished`.
- `[ ]` **Duplicate Lock:** User cannot make a second prediction on a match they have already entered.

### Card Interactions (v4.6 Update)
- `[ ]` **Visual Feedback:** Tapping a team region triggers a visible "press" animation.
- `[ ]` **Swipe Stability:** Swiping a card follows the finger smoothly without jitter or flipping.
- `[ ]` **Hybrid Consistency:** Static cards (`MatchCard`) and interactive cards (`GameDeck`) look identical.

### Sponsor & Admin
- `[ ]` **Admin User View:** Admin can view the full list of registered supporters in the Command Center.
- `[ ]` **Admin Prediction Count:** The "Predictions" count in the admin user view is accurate.
- `[ ]` **Admin Role Update:** Admin can successfully promote another user to 'admin' via the Command Center.
### Sponsor & Draw Management (v1.5 Update)
- `[ ]` **Application Submission:** Founding Package forms correctly save to `sponsor_applications`.
- `[ ]` **Admin Hub Approval:** Approving an application instantly creates a Room Sponsor and a Prize Draw.
- `[ ]` **Draw Visibility:** New draws appear in the `/draw` room immediately after approval.
- `[ ]` **Draw Removal:** Admin can successfully delete an active draw from the Sponsor Hub.
- `[ ]` **Navigation Flow:** Completing soccer predictions successfully shows the "Go to Draw Room" button.
- `[ ]` **Multilingual:** Draw room titles and descriptions correctly reflect selected language (EN, ID, TH).

### Balance & Layout (v1.7 Update)
- `[ ]` **Header Balance:** User's tokens and tickets display correctly in UserTray (no zero defaults).
- `[ ]` **Real-time Sync:** Ticket count decreases immediately in header after entering a draw.
- `[ ]` **Header Layout:** Navbar (60px) does not overlap content on Home, Rooms, or Profile pages.
- `[ ]` **Mobile Spacing:** Layout remains consistent and accessible on mobile viewports.
