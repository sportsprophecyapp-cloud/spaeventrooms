import { Router } from 'express';
import { login, register, updateUsername, getProfile, getMe } from './controller';
import { authenticate } from './middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe); // NEW: Fast Log Handshake
router.get('/profile/:userId', getProfile);
router.patch('/update-username', authenticate, updateUsername);

export default router;
