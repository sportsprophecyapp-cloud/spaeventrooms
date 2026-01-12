import { Router } from 'express';
import { getMyBadges, equipBadge } from './controller';
import { authenticate } from '../auth/middleware';

const router = Router();

router.get('/my-badges', authenticate, getMyBadges);
router.post('/equip', authenticate, equipBadge);

export default router;
