import { Router } from 'express';
import { authenticate } from '../auth/middleware';
import { getMyStats, getGlobalLeaderboard } from './controller';

const router = Router();

router.get('/me', authenticate, getMyStats);
router.get('/leaderboard', getGlobalLeaderboard);

export default router;
