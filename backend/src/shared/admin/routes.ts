import { Router } from 'express';
import { 
    searchSupporters, 
    updateUserRole, 
    getRooms, 
    assignRoomOwner, 
    getDraws, 
    createDraw, 
    resolveDraw,
    createRoom,
    getAllMatches,
    deleteMatch,
    clearDebugTestMatches
} from './controller';
import { authenticate, isAdmin } from '../auth/middleware';

const router = Router();

// Apply strict admin check to all routes
router.use(authenticate);
router.use(isAdmin);

/**
 * USER & ROOM MANAGEMENT
 */
router.get('/users/search', searchSupporters);
router.put('/users/:userId/role', updateUserRole);
router.get('/rooms', getRooms);
router.post('/rooms', createRoom);

/**
 * MATCH & DATA CONTROLS
 */
router.get('/matches', getAllMatches);
router.delete('/matches/:matchId', deleteMatch);
router.post('/matches/clear-debug', clearDebugTestMatches);

/**
 * PRIZE DRAW MANAGEMENT
 */
router.get('/draws', getDraws);
router.post('/draws', createDraw);
router.post('/draws/resolve', resolveDraw);

export default router;
