import { Router } from 'express';
import {
    handleDailyLogin,
    getShop,
    purchaseCosmetic,
    equipCosmetic,
    shareRoom,
} from './controller';
import { authenticate } from '../auth/middleware'; // Using correct export 'authenticate'

const router = Router();

// ============================================
// GAMIFICATION ENDPOINTS (all require auth)
// ============================================

/**
 * POST /api/gamification/daily-login
 * Awards daily login tokens and tracks streaks
 * Response: { streak, tokenBalance, reward }
 */
router.post('/daily-login', authenticate, handleDailyLogin);

/**
 * GET /api/gamification/shop
 * Returns all cosmetics with ownership status
 * Response: { cosmetics: [...], balance }
 */
router.get('/shop', authenticate, getShop);

/**
 * POST /api/gamification/purchase
 * Purchase a cosmetic with tokens
 * Body: { cosmeticId }
 * Response: { success, item, newBalance }
 */
router.post('/purchase', authenticate, purchaseCosmetic);

/**
 * POST /api/gamification/equip
 * Equip a cosmetic to a slot
 * Body: { cosmeticId, slotType: 'avatar' | 'frame' | 'background' }
 * Response: { success, equipped }
 */
router.post('/equip', authenticate, equipCosmetic);

/**
 * POST /api/gamification/share
 * Share a room and earn tokens (1x per 24 hours)
 * Body: { roomId }
 * Response: { success, tokensAwarded, newBalance }
 */
router.post('/share', authenticate, shareRoom);

export default router;
