import { Router } from 'express';
import { login, register, getProfile, updateUsername } from './controller';
import { authenticate } from './middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile/:userId', authenticate, getProfile);
router.put('/username', authenticate, updateUsername); // New Identity Route

export default router;
