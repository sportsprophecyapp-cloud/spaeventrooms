import { Router } from 'express';
import { getPulsePicks, getLiveTicker, getNhlPlayoffs, getWorldCup } from './controller';

const router = Router();

router.get('/picks', getPulsePicks);
router.get('/ticker', getLiveTicker);
router.get('/nhl-playoffs', getNhlPlayoffs);
router.get('/world-cup', getWorldCup);

export default router;
