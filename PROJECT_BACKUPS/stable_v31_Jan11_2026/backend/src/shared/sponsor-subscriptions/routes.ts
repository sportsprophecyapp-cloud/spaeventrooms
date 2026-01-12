import { Router } from 'express';
import express from 'express';
import { authenticate, isAdmin } from '../auth/middleware';
import {
    createCheckoutSession,
    getActivePlacements,
    handleWebhook,
    getAllSponsorSubscriptions,
    getSponsorSubscription,
    getSponsorsByStatus,
    toggleSponsorActive
} from './controller';

const router = Router();

// Public / User Routes
router.post('/checkout', authenticate, createCheckoutSession);
router.get('/placements/:page', getActivePlacements);

// Webhook route needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook as any);

// ============================================
// ADMIN ENDPOINTS (require authentication + admin)
// ============================================

// GET all sponsors for admin dashboard
router.get('/admin/sponsors', authenticate, isAdmin, getAllSponsorSubscriptions);

// GET single sponsor details
router.get('/admin/sponsors/:sponsorId', authenticate, isAdmin, getSponsorSubscription);

// GET sponsors filtered by status
router.get('/admin/sponsors/filter', authenticate, isAdmin, getSponsorsByStatus);

// PATCH toggle sponsor active/inactive
router.patch('/admin/sponsors/:sponsorId/toggle', authenticate, isAdmin, toggleSponsorActive);

export default router;
