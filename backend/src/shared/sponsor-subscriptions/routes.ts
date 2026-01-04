import { Router } from 'express';
import { authenticate } from '../auth/middleware';
import { createCheckoutSession, getActivePlacements, handleWebhook } from './controller';
import express from 'express';

const router = Router();

router.post('/checkout', authenticate, createCheckoutSession);
router.get('/placements/:page', getActivePlacements);

// Webhook route needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook as any);

export default router;
