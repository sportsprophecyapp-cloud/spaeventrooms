import { Router } from 'express';
import { getMe, login, register, updateUsername, getProfile, resetAdminPassword, deleteAccount, forgotPassword } from './controller'; // NEW: Added forgotPassword
import { authenticate } from './middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword); // NEW

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/username', authenticate, updateUsername);
router.delete('/delete-account', authenticate, deleteAccount);

// Profile route (can be public or protected depending on desired visibility)
router.get('/profile/:userId', getProfile);

// Temporary Admin route
router.post('/reset-admin-password', resetAdminPassword);

export default router;
