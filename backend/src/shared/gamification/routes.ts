import { Router } from 'express';
import {
    handleDailyLogin,
    getShop,
    purchaseCosmetic,
    equipCosmetic,
    shareRoom,
    handleGetMe,
    handleGetLeaderboard
} from './controller';
import { authenticate } from '../auth/middleware';

const router = Router();

// ============================================
// GAMIFICATION ENDPOINTS
// ============================================

/**
 * GET /api/gamification/me
 * Returns user stats, level and badges
 */
router.get('/me', authenticate, handleGetMe);

/**
 * GET /api/gamification/leaderboard
 * Returns global prophet rankings
 */
router.get('/leaderboard', handleGetLeaderboard);

/**
 * POST /api/gamification/daily-login
 * Awards daily login tokens and tracks streaks
 */
router.post('/daily-login', authenticate, handleDailyLogin);

/**
 * GET /api/gamification/shop
 * Returns all cosmetics with ownership status
 */
router.get('/shop', authenticate, getShop);

/**
 * POST /api/gamification/purchase
 * Purchase a cosmetic with tokens
 */
router.post('/purchase', authenticate, purchaseCosmetic);

/**
 * POST /api/gamification/equip
 * Equip a cosmetic to a slot
 */
router.post('/equip', authenticate, equipCosmetic);

/**
 * POST /api/gamification/share
 * Share a room and earn tokens (1x per 24 hours)
 */
router.post('/share', authenticate, shareRoom);

export default router;
