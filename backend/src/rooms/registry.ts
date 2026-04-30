import { BaseRoom } from './roomFactory';
import { SoccerRoom } from './soccer/room';
import { GlobalLobbyRoom } from './global/room';
import { Express } from 'express';
import { Server } from 'socket.io';

class RoomRegistry {
    private rooms: Map<string, BaseRoom> = new Map();

    constructor() {
        // Register default rooms
        this.registerRoom(new SoccerRoom());
        this.registerRoom(new GlobalLobbyRoom());
    }

    registerRoom(room: BaseRoom) {
        this.rooms.set(room.roomId, room);
    }

    getRoom(roomId: string) {
        return this.rooms.get(roomId);
    }

    getAllRooms() {
        return Array.from(this.rooms.values());
    }

    initializeRooms(app: Express, io: Server) {
        this.rooms.forEach(room => {
            console.log(`Initializing room: ${room.displayName}`);
            room.initRoutes();
            room.initSocket(io);

            // Mount routes
            // /api/rooms/:roomId
            app.use(`/api/rooms/${room.roomId}`, room.router);
        });
    }
}

export const roomRegistry = new RoomRegistry();
