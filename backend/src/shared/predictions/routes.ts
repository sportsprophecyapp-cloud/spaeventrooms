import { Router } from 'express';
import * as controllers from './controller';
import { authenticate } from '../auth/middleware';
import commentRoutes from '../comments/routes';

const router = Router({ mergeParams: true });

// Match-specific sentiment and user-check (Public or Auth)
router.get('/match', authenticate, controllers.getUserMatchPrediction);
router.get('/match/:matchId/sentiment', controllers.getMatchSentiment);
router.post('/match', authenticate, controllers.submitMatchPrediction);

// Custom prediction routes
router.get('/', controllers.getPredictions);
router.post('/', authenticate, controllers.createPrediction);
router.post('/:id/submit', authenticate, controllers.submitPrediction);
router.post('/:id/reveal', authenticate, controllers.revealAnswer);

// Nested routes
router.use('/:id/comments', commentRoutes);

export default router;
