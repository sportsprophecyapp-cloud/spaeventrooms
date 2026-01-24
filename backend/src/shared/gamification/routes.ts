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
    handleEnterDraw,
    handleGetMyEntries,
    handleGetUserTickets,
    handleDeleteDraw,
    handlePickWinner,
    handleGetWins,
    handleGetAllBadges,
    handleGetAchievements,
    handleGetRecentWinners,
    handleUpdateDraw,
    handleGetHistory
} from './controller';
import { submitFeedback, trackShare, getAllFeedback } from './feedback.controller';
import { authenticate, isAdmin } from '../auth/middleware';

const router = Router();

// ============================================
// GAMIFICATION ENDPOINTS
// ============================================

router.get('/me', authenticate, handleGetMe);
router.get('/history/:userId', authenticate, handleGetHistory);
router.get('/wins', authenticate, handleGetWins);
router.get('/badges/all', handleGetAllBadges);
router.get('/achievements', authenticate, handleGetAchievements);
router.get('/leaderboard', handleGetLeaderboard);
router.get('/tickets', authenticate, handleGetTickets); // New Tickets Route
router.get('/vouchers', authenticate, handleGetVouchers);
router.post('/vouchers/claim', authenticate, handleClaimVoucher);
router.get('/draws/active', authenticate, handleGetActiveDraws);
router.get('/draws/my-entries', authenticate, handleGetMyEntries);
router.get('/recent-winners', handleGetRecentWinners);
router.post('/draws/:id/enter', authenticate, handleEnterDraw);
router.post('/draws/:id/pick-winner', authenticate, isAdmin, handlePickWinner);
router.patch('/draws/:id', authenticate, isAdmin, handleUpdateDraw);
router.delete('/draws/:id', authenticate, isAdmin, handleDeleteDraw);
router.post('/daily-login', authenticate, handleDailyLogin);
router.get('/shop', authenticate, getShop);
router.post('/purchase', authenticate, purchaseCosmetic);
router.post('/equip', authenticate, equipCosmetic);
router.post('/share', authenticate, shareRoom);

// FEEDBACK ENDPOINTS
router.post('/feedback', authenticate, submitFeedback);
router.post('/feedback/share', authenticate, trackShare);
router.get('/feedback/all', authenticate, isAdmin, getAllFeedback);

export default router;
