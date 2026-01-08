import { Router } from 'express';
import { 
    getAllSupporters,
    getSiteStats, 
    getSponsorStats, // NEW
    sendMessageToUser,
    banUser,
    muteUser, 
    searchSupporters, 
    updateUserPermissions, 
    getRooms,
    // ... other imports
} from './controller';
import { authenticate, hasPermission } from '../auth/middleware';

const router = Router();

router.use(authenticate);

// DASHBOARD
router.get('/stats', hasPermission('can_view_admin'), getSiteStats);

// SPONSOR DATA (NEW)
router.get('/sponsors/stats', hasPermission('can_view_sponsors'), getSponsorStats);

// USER MANAGEMENT
router.get('/users', hasPermission('can_manage_users'), getAllSupporters);
router.get('/users/search', hasPermission('can_manage_users'), searchSupporters);
router.put('/users/:userId/permissions', hasPermission('can_manage_users'), updateUserPermissions);
router.post('/users/:userId/message', hasPermission('can_message_users'), sendMessageToUser);
router.put('/users/:userId/ban', hasPermission('can_ban_users'), banUser);
router.put('/users/:userId/mute', hasPermission('can_manage_moderation'), muteUser); 

// ... (rest of routes will be updated to use hasPermission later)

export default router;
