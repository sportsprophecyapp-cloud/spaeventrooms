import { Router } from 'express';
import { 
    searchProphets, 
    updateUserRole, 
    getRooms, 
    assignRoomOwner, 
    getDraws, 
    createDraw, 
    resolveDraw,
    createRoom
} from './controller';
import { authenticate, isAdmin } from '../auth/middleware';

const router = Router();

// Apply strict admin check to all routes
router.use(authenticate);
router.use(isAdmin);

/**
 * USER & ROOM MANAGEMENT
 */
router.get('/users/search', searchProphets);
router.put('/users/:userId/role', updateUserRole);
router.get('/rooms', getRooms);
router.post('/rooms', createRoom); // New Create Room Route
router.put('/rooms/:roomId/owner', assignRoomOwner);

/**
 * PRIZE DRAW MANAGEMENT
 */
router.get('/draws', getDraws);
router.post('/draws', createDraw);
router.post('/draws/resolve', resolveDraw);

export default router;
