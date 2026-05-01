# ✅ Core Feature QA Checklist (v3.9.0 — April 2026)

### 🛡 Infrastructure & Stability
- `[x]` **Auto-Heal / Auto-Resolve:** Match resolver confirmed active — 18 correct / 91 incorrect predictions resolved.
- `[x]` **Neon DB:** Neon PostgreSQL 17 (Permanent Free Tier, AWS US East 1) connected and stable.
- `[x]` **Render Deployment:** Frontend & Backend deployed on Render Free Tier — both live.
- `[x]` **Match Feed:** 130+ upcoming matches in DB, scheduler polling every 1.5 hours.
- `[x]` **Image Compression:** Sponsor images compressed client-side before upload (logos ≤300px, prizes ≤600px @70% quality).

### 🏁 Prize Draw Logic
- `[x]` **Active Draw:** 1 prize draw active and running in the Draw Room.
- `[ ]` **Multi-Entry:** Verify ticket deduction for each re-entry in a draw.
- `[ ]` **Weighted Winning:** Verify "Your entries: X" displays correctly in the Draw Room UI.
- `[ ]` **Badge Delivery:** Confirm "Grand Champion" avatar is awarded to draw winners.

### 🏆 Honors & Hall of Fame
- `[ ]` **Elite Awarding:** Draw winner automatically receives "Grand Champion" avatar and frame.
- `[ ]` **Hall of Fame Display:** Profile page shows high-fidelity previews of unlocked honors.
- `[ ]` **Earn-Not-Buy Gating:** Achievement-locked items show "LOCKED" label in Token Shop.

### 🤝 Sponsor System
- `[x]` **Approved Sponsor:** 1 sponsor approved and displaying in the Soccer Arena widget.
- `[x]` **Stripe Checkout:** Sponsor application flow redirects to Stripe for paid packages.
- `[ ]` **Promo Code PH10OFF:** Verify 3-month promo code is active in Stripe dashboard.

### 👤 User & Auth
- `[x]` **Registration & Login:** Auth flow working (Google OAuth + email/password).
- `[x]` **Unique Usernames:** Username uniqueness enforced during registration.
- `[ ]` **Referral Roadmap:** Profile page roadmap shows correct milestone nodes.

### 📱 Platform-Specific QA
- `[ ]` **Mobile Gestures**: Verify Tinder-swipe velocity and snap-back logic in the mobile Arena.
- `[ ]` **Mobile Haptics**: Confirm vibration feedback on swipe-left/right triggers.
- `[ ]` **Mobile Share Card**: Verify `view-shot` generates high-res image with correct referral code.
- `[ ]` **Web OG Tags**: Verify match-specific unfurls work correctly on WhatsApp/iMessage.
- `[ ]` **Web Performance**: Verify mouse drag physics feel natural on Desktop browsers.

Pribadi.
