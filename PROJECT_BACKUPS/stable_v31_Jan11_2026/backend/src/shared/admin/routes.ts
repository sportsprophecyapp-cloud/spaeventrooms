import { Router } from 'express';
import { 
    getAllSupporters,
    getSiteStats, 
    getOnlineUsers,
    sendMessageToUser,
    banUser,
    muteUser, 
    updateUserPermissions,
    sendGlobalAnnouncement, // NEW
    // Stubs
    searchSupporters, 
    getRooms,
    getSponsorStats
} from './controller';
import { authenticate, hasPermission } from '../auth/middleware';

const router = Router();

router.use(authenticate);

// DASHBOARD
router.get('/stats', hasPermission('can_view_admin'), getSiteStats);
router.get('/online-users', hasPermission('can_view_admin'), getOnlineUsers);

// USER MANAGEMENT & MODERATION
router.post('/announce', hasPermission('super_admin'), sendGlobalAnnouncement); // NEW
router.get('/users', hasPermission('can_manage_users'), getAllSupporters);
router.put('/users/:userId/permissions', hasPermission('can_manage_users'), updateUserPermissions);
router.post('/users/:userId/message', hasPermission('can_message_users'), sendMessageToUser);
router.put('/users/:userId/ban', hasPermission('can_ban_users'), banUser);
router.put('/users/:userId/mute', hasPermission('can_manage_moderation'), muteUser); 

// Stubs for build to pass
router.get('/users/search', hasPermission('can_manage_users'), searchSupporters);
router.get('/sponsors/stats', hasPermission('can_view_sponsors'), getSponsorStats);
router.get('/rooms', hasPermission('can_manage_rooms'), getRooms);

export default router;
