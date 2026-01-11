import { Router } from 'express';
import { authenticate } from '../auth/middleware';
import { getComments, createComment } from './controller';

const router = Router({ mergeParams: true });

router.get('/', getComments);
router.post('/', authenticate, createComment);

export default router;
