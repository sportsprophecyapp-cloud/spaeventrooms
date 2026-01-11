import { Router } from 'express';
import { 
    getFilteredWords,
    addFilteredWord,
    deleteFilteredWord
} from './controller';
import { authenticate, hasPermission } from '../auth/middleware';

const router = Router();

router.use(authenticate);
router.use(hasPermission('can_manage_moderation'));

// Chat Filter Management
router.get('/filter', getFilteredWords);
router.post('/filter', addFilteredWord);
router.delete('/filter/:wordId', deleteFilteredWord);

export default router;
