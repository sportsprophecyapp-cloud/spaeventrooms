import { Router } from 'express';
import { 
    submitApplication, 
    getApplications, 
    approveApplication, 
    getAllSponsors, 
    generateInvoice, 
    markPaymentPaid, 
    getActiveSponsors 
} from './controller';
import { authenticate, isAdmin } from '../auth/middleware';

const router = Router();

// PUBLIC
router.post('/submit', submitApplication);
router.get('/active', getActiveSponsors);

// ADMIN PROTECTED
router.get('/', authenticate, isAdmin, getApplications);
router.post('/:appId/approve', authenticate, isAdmin, approveApplication); // NEW: Instant Deploy
router.get('/all', authenticate, isAdmin, getAllSponsors);
router.post('/:sponsorId/invoice', authenticate, isAdmin, generateInvoice);
router.patch('/payments/:paymentId/paid', authenticate, isAdmin, markPaymentPaid);

export default router;
