import { Router } from 'express';
import { getMe, login, register, updateUsername, getProfile, resetAdminPassword, deleteAccount, forgotPassword, resetPassword, googleLogin, getPublicProfileByReferralCode, uploadCustomAvatar } from './controller';
import { authenticate } from './middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/google', googleLogin);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/username', authenticate, updateUsername);
router.delete('/delete-account', authenticate, deleteAccount);
router.post('/upload-avatar', authenticate, uploadCustomAvatar);

// Profile route
router.get('/profile/:userId', getProfile);
router.get('/public-profile/:referralCode', getPublicProfileByReferralCode);

// Temporary Admin route
router.post('/reset-admin-password', resetAdminPassword);

export default router;
