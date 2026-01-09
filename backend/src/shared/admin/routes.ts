import { Router } from 'express';
import { 
    getAllSupporters,
    getSiteStats, 
    getSponsorStats,
    sendMessageToUser,
    banUser,
    muteUser, 
    searchSupporters, 
    updateUserPermissions, 
    getRooms,
    getOnlineUsers // NEW
} from './controller';
import { authenticate, hasPermission } from '../auth/middleware';

const router = Router();

router.use(authenticate);

// DASHBOARD
router.get('/stats', hasPermission('can_view_admin'), getSiteStats);
router.get('/online-users', hasPermission('can_view_admin'), getOnlineUsers); // NEW

// SPONSOR DATA
router.get('/sponsors/stats', hasPermission('can_view_sponsors'), getSponsorStats);

// USER MANAGEMENT
router.get('/users', hasPermission('can_manage_users'), getAllSupporters);
router.get('/users/search', hasPermission('can_manage_users'), searchSupporters);
router.put('/users/:userId/permissions', hasPermission('can_manage_users'), updateUserPermissions);
router.post('/users/:userId/message', hasPermission('can_message_users'), sendMessageToUser);
router.put('/users/:userId/ban', hasPermission('can_ban_users'), banUser);
router.put('/users/:userId/mute', hasPermission('can_manage_moderation'), muteUser); 

export default router;
