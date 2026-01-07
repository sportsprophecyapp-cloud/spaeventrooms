import { Router } from 'express';
import { searchProphets, updateUserRole, getRooms, assignRoomOwner } from './controller';
import { authenticate, isAdmin } from '../auth/middleware';

const router = Router();

// Apply strict admin check to all routes in this file
router.use(authenticate);
router.use(isAdmin);

/**
 * USER MANAGEMENT
 */
router.get('/users/search', searchProphets);
router.put('/users/:userId/role', updateUserRole);

/**
 * ROOM MANAGEMENT
 */
router.get('/rooms', getRooms);
router.put('/rooms/:roomId/owner', assignRoomOwner);

export default router;
