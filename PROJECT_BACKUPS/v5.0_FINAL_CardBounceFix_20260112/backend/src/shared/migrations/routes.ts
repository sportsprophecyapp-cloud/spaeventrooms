import { Router } from 'express';
import { runSponsorAnalyticsMigration } from './controller';
import { authenticate, isAdmin } from '../auth/middleware';

const router = Router();

// Admin-only migration endpoint
router.post('/sponsor-analytics', authenticate, isAdmin, runSponsorAnalyticsMigration);

export default router;
