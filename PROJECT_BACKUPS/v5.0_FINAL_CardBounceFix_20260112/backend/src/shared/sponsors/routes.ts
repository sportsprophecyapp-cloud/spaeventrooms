import { Router } from 'express';
import { getSponsors, createSponsor, deleteSponsor } from './controller';
import { authenticate, isAdmin } from '../auth/middleware';

const router = Router({ mergeParams: true });

// Room specific sponsors
router.get('/', getSponsors);
router.post('/', authenticate, isAdmin, createSponsor);
router.delete('/:id', authenticate, isAdmin, deleteSponsor);

export default router;
