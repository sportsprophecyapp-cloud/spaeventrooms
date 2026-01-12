import { Router } from 'express';
import { getAnnouncements, createAnnouncement } from './controller';
import { authenticate } from '../auth/middleware';

const router = Router({ mergeParams: true });

router.get('/', getAnnouncements);
router.post('/', authenticate, createAnnouncement);

export default router;
