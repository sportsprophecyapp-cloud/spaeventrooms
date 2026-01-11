import { Router } from 'express';
import { getPredictions, createPrediction, submitPrediction, revealAnswer, submitMatchPrediction } from './controller';
import { authenticate } from '../auth/middleware';
import commentRoutes from '../comments/routes';

const router = Router({ mergeParams: true });

router.get('/', getPredictions);
router.post('/', authenticate, createPrediction);
router.post('/match', authenticate, submitMatchPrediction);
router.post('/:id/submit', authenticate, submitPrediction);
router.patch('/:id/answer', authenticate, revealAnswer);
router.use('/:predictionId/comments', commentRoutes);

export default router;
