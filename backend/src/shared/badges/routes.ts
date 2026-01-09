import { Router } from 'express';
import { getMyBadges, equipBadge } from './controller';
import { authenticate } from '../auth/middleware';

const router = Router();

// All badge routes require a logged-in user
router.use(authenticate);

router.get('/my-badges', getMyBadges);
router.post('/equip', equipBadge);

export default router;
