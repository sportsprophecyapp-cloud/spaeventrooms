import { Server } from 'socket.io';

class SocketService {
    private io: Server | null = null;

    init(io: Server) {
        this.io = io;
    }

    emitToRoom(roomId: string, event: string, data: any) {
        if (!this.io) {
            console.warn('SocketService not initialized');
            return;
        }
        // Emit to the room-specific namespace
        this.io.of(`/rooms/${roomId}`).emit(event, data);
    }

    emitGlobal(event: string, data: any) {
        if (!this.io) {
            console.warn('SocketService not initialized');
            return;
        }
        this.io.emit(event, data);
    }
}

export const socketService = new SocketService();
