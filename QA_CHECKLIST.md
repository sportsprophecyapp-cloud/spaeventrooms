# ✅ Core Feature QA Checklist (v3.9.0)

### 🛡 Infrastructure & Stability (v3.9.0 Update)
- `[ ]` **Auto-Heal:** Verify "System Maintenance Complete" appears in Render logs on startup.
- `[ ]` **History Scroll:** Verify profile "History" tab fix is active (Load More inside scroll box).
- `[ ]` **DB Sync:** Verify `DATABASE_URL` is manually set in Render `spa-backend` settings.
- `[ ]` **Blueprint Status:** Verify "Synced" green status on Render Blueprint dashboard.

### 🏁 Prize Draw Logic (v3.9.0 Update)
- `[ ]` **Multi-Entry:** Enter a draw multiple times and verify ticket deduction for each entry.
- `[ ]` **Weighted Winning:** Verify "Your entries: X" displays correctly in the Draw Room.
- `[ ]` **Badge Delivery:** Confirm "Grand Champion" avatar is awarded to winners.

### Honors & Hall of Fame
- `[ ]` **Elite Awarding:** Winning a draw automatically grants the "Grand Champion" avatar and frame.
- `[ ]` **Hall of Fame Display:** Profile page shows high-fidelity previews of unlocked honors.
- `[ ]` **Earn-Not-Buy Gating:** Achievement-locked items are disabled in the Token Shop with a "LOCKED" label.

### Referral Roadmap
- `[ ]` **Visual Tracking:** Profile page roadmap correctly shows filled-in nodes for unlocked milestones.
- `[ ]` **Sharing Hub:** Copying referral code/link from the roadmap works across mobile/desktop.
- `[ ]` **Milestone Awarding:** Reaching milestones (1, 10, 25, 50) triggers associated rewards.

Pribadi.
