import { Router } from 'express';
import { getPulsePicks, getLiveTicker } from './controller';

const router = Router();

router.get('/picks', getPulsePicks);
router.get('/ticker', getLiveTicker);

export default router;
