import { Router } from 'express';
import {
    handleDailyLogin,
    getShop,
    purchaseCosmetic,
    equipCosmetic,
    shareRoom,
    handleGetMe,
    handleGetLeaderboard,
    handleGetTickets
} from './controller';
import { authenticate } from '../auth/middleware';

const router = Router();

// ============================================
// GAMIFICATION ENDPOINTS
// ============================================

router.get('/me', authenticate, handleGetMe);
router.get('/leaderboard', handleGetLeaderboard);
router.get('/tickets', authenticate, handleGetTickets); // New Tickets Route

router.post('/daily-login', authenticate, handleDailyLogin);
router.get('/shop', authenticate, getShop);
router.post('/purchase', authenticate, purchaseCosmetic);
router.post('/equip', authenticate, equipCosmetic);
router.post('/share', authenticate, shareRoom);

export default router;
