import { Router } from 'express';
import { getRoomMessages, createRoomMessage } from './controller';
import { authenticate } from '../auth/middleware';

const router = Router({ mergeParams: true });

/**
 * GET /api/rooms/:roomId/chat
 * Fetch last 50 messages for a room
 */
router.get('/', getRoomMessages);

/**
 * POST /api/rooms/:roomId/chat
 * Send a new chat message to the room
 */
router.post('/', authenticate, createRoomMessage);

export default router;
