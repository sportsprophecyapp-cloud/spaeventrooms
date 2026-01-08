import { Router } from 'express';
import {
    handleDailyLogin,
    getShop,
    purchaseCosmetic,
    equipCosmetic,
    shareRoom,
    handleGetMe,
    handleGetLeaderboard,
    handleGetTickets,
    handleGetVouchers,
    handleClaimVoucher
} from './controller';
import { authenticate } from '../auth/middleware';

const router = Router();

// ============================================
// GAMIFICATION ENDPOINTS
// ============================================

router.get('/me', authenticate, handleGetMe);
router.get('/leaderboard', handleGetLeaderboard);
router.get('/tickets', authenticate, handleGetTickets); // New Tickets Route
router.get('/vouchers', authenticate, handleGetVouchers);
router.post('/vouchers/claim', authenticate, handleClaimVoucher);

router.post('/daily-login', authenticate, handleDailyLogin);
router.post('/purchase', authenticate, purchaseCosmetic);
router.post('/equip', authenticate, equipCosmetic);
router.post('/share', authenticate, shareRoom);

export default router;
