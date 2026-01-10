-- SQL Script to reset the dates of all active draws to 7 days from now.
-- This ensures they are not "expired" and users can enter them for testing.

UPDATE prize_draws 
SET draw_date = NOW() + INTERVAL '7 days'
WHERE status = 'active';

-- Optional: If you want to reactivate completed draws for testing
-- UPDATE prize_draws SET status = 'active', draw_date = NOW() + INTERVAL '7 days' WHERE status = 'completed';
