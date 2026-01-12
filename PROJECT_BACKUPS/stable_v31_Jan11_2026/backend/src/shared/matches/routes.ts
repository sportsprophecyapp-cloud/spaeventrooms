import { Router } from 'express';
import { getMatchesByLeague } from './controller';
import { authenticate } from '../auth/middleware';

const router = Router();

// All match routes require a logged-in user
router.use(authenticate);

router.get('/', getMatchesByLeague);

export default router;
