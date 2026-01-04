import { Router } from 'express';
import { getSponsors, createSponsor, deleteSponsor } from './controller';
import { authenticate } from '../auth/middleware';

const router = Router({ mergeParams: true });

router.get('/', getSponsors);
router.post('/', authenticate, createSponsor);
router.delete('/:id', authenticate, deleteSponsor);

export default router;
