import { Router } from 'express';
import { getPredictions, createPrediction, submitPrediction, revealAnswer } from './controller';
import { authenticate } from '../auth/middleware';

const router = Router({ mergeParams: true });

router.get('/', getPredictions);
router.post('/', authenticate, createPrediction);
router.post('/:id/submit', authenticate, submitPrediction);
router.patch('/:id/answer', authenticate, revealAnswer);

export default router;
