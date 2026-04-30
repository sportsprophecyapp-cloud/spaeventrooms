import { Router } from 'express';
import { getPulsePicks } from './controller';

const router = Router();

router.get('/picks', getPulsePicks);

export default router;
