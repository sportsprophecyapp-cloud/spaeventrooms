import { getPredictions, createPrediction, submitPrediction, revealAnswer, submitMatchPrediction, getMatchSentiment } from './controller';
import { authenticate } from '../auth/middleware';
import commentRoutes from '../comments/routes';

const router = Router({ mergeParams: true });

router.get('/', getPredictions);
router.get('/match/:matchId/sentiment', getMatchSentiment);
router.post('/', authenticate, createPrediction);
router.post('/match', authenticate, submitMatchPrediction);
router.post('/:id/submit', authenticate, submitPrediction);
router.patch('/:id/answer', authenticate, revealAnswer);
router.use('/:predictionId/comments', commentRoutes);

export default router;
