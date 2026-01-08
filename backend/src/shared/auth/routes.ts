import { Router } from 'express';
import { getMe, login, register, updateUsername, getProfile, resetAdminPassword, deleteAccount } from './controller';
import { authenticate } from './middleware';

const router = Router();

router.get('/me', authenticate, getMe);
router.post('/login', login);
router.post('/register', register);
router.put('/username', authenticate, updateUsername);
router.get('/profile/:userId', getProfile);
router.delete('/delete-account', authenticate, deleteAccount);

// Temporary route for resetting admin password
router.post('/reset-admin-password', resetAdminPassword);

export default router;
