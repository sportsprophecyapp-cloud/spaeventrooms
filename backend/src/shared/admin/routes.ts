import { Router } from 'express';
import { 
    getAllSupporters,
    searchSupporters, 
    updateUserPermissions, // NEW
    getRooms,
    // ... other imports
} from './controller';
import { authenticate, hasPermission } from '../auth/middleware';

const router = Router();

router.use(authenticate);

// USER MANAGEMENT (Granular)
router.get('/users', hasPermission('can_manage_users'), getAllSupporters);
router.get('/users/search', hasPermission('can_manage_users'), searchSupporters);
router.put('/users/:userId/permissions', hasPermission('can_manage_users'), updateUserPermissions); // NEW

// ... (rest of routes will be updated to use hasPermission later)

export default router;
