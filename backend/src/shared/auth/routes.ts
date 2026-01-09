import { Router } from 'express';
import { getMe, login, register, updateUsername, getProfile, resetAdminPassword, deleteAccount } from './controller';
import { authenticate } from './middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/username', authenticate, updateUsername);
router.delete('/delete-account', authenticate, deleteAccount);

// Profile route
router.get('/profile/:userId', getProfile);

// Temporary Admin route
router.post('/reset-admin-password', resetAdminPassword);

export default router;
