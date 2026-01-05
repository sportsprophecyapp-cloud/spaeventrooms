import { Router } from 'express';
import { authenticate } from '../auth/middleware';
import {
    submitApplication,
    getApplications,
    approveApplication,
    getAllSponsors,
    generateInvoice,
    markPaymentPaid,
    getActiveSponsors
} from './controller';

const router = Router();

// Public routes
router.post('/apply', submitApplication);
router.get('/active', getActiveSponsors);

// Admin routes (require authentication)
router.get('/applications', authenticate, getApplications);
router.post('/applications/:applicationId/approve', authenticate, approveApplication);
router.get('/sponsors', authenticate, getAllSponsors);
router.post('/sponsors/:sponsorId/invoice', authenticate, generateInvoice);
router.post('/payments/:paymentId/mark-paid', authenticate, markPaymentPaid);

export default router;
