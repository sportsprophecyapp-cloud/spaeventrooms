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
    handleClaimVoucher,
    handleGetActiveDraws,
    handleGetUserTickets,
    handleDeleteDraw,
    handlePickWinner,
    handleGetWins
} from './controller';
import { authenticate, isAdmin } from '../auth/middleware';

const router = Router();

// ============================================
// GAMIFICATION ENDPOINTS
// ============================================

router.get('/me', authenticate, handleGetMe);
router.get('/wins', authenticate, handleGetWins);
router.get('/leaderboard', handleGetLeaderboard);
router.get('/tickets', authenticate, handleGetTickets); // New Tickets Route
router.get('/vouchers', authenticate, handleGetVouchers);
router.post('/vouchers/claim', authenticate, handleClaimVoucher);
router.get('/draws/active', authenticate, handleGetActiveDraws);
router.post('/draws/:id/pick-winner', authenticate, isAdmin, handlePickWinner);
router.delete('/draws/:id', authenticate, isAdmin, handleDeleteDraw);
router.get('/tickets', authenticate, handleGetUserTickets);

router.post('/daily-login', authenticate, handleDailyLogin);
router.post('/purchase', authenticate, purchaseCosmetic);
router.post('/equip', authenticate, equipCosmetic);
router.post('/share', authenticate, shareRoom);

export default router;
