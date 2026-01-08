# ✅ Core Feature QA Checklist (v1.0)

This document is a mandatory pre-flight check before any `deploy.sh` command is recommended. It serves as a guard against regressions in the platform's most critical user-facing functions.

## 📋 Pre-Deployment Verification

### Authentication & Access
- `[ ]` **Login:** User can successfully log in with correct credentials.
- `[ ]` **Logout:** User can successfully log out from the `UserTray` dropdown.
- `[ ]` **Admin Access:** An admin user can see the "Command Center" and "Arena Wizard" links in the `UserTray`.
- `[ ]` **Session:** A logged-in user remains logged in after a page refresh.

### Economy & Balances
- `[ ]` **Balance Visibility:** The `UserTray` correctly displays the logged-in user's Token and Ticket balances.
- `[ ]` **Balance Consistency:** The balance in the `UserTray` matches the balance on the `/profile` page.
- `[ ]` **Reward Pipeline:** A correct prediction on a finished match correctly increments a user's `total_tickets` and `total_points` in the database.

### Core Gameplay Loop
- `[ ]` **Prediction:** User can successfully make a prediction on a `scheduled` match.
- `[ ]` **Prediction Lock:** User cannot predict on a match that is `live` or `finished`.
- `[ ]` **Duplicate Lock:** User cannot make a second prediction on a match they have already entered.

### Sponsor & Admin
- `[ ]` **Admin User View:** Admin can view the full list of registered supporters in the Command Center.
- `[ ]` **Admin Role Update:** Admin can successfully promote another user to 'admin' via the Command Center.
- `[ ]` **Sponsor Application:** The `/sponsors/apply` page and its live preview sandbox are functional.
