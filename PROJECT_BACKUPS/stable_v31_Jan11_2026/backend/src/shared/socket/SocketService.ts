import { Server, Socket } from 'socket.io';

class SocketService {
    private io: Server | null = null;
    private onlineUsers: Set<string> = new Set(); // NEW: Track online users

    public init(server: import('http').Server): void {
        this.io = new Server(server, {
            cors: { origin: "*" }
        });

        this.io.on('connection', (socket: Socket) => {
            const userId = socket.handshake.query.userId as string;
            if (userId) {
                socket.join(`user:${userId}`);
                this.onlineUsers.add(userId); // NEW
                console.log(`User ${userId} connected. Online users: ${this.onlineUsers.size}`);
            }

            socket.on('disconnect', () => {
                if (userId) {
                    this.onlineUsers.delete(userId); // NEW
                    console.log(`User ${userId} disconnected. Online users: ${this.onlineUsers.size}`);
                }
            });
        });
    }

    public getIO(): Server | null {
        return this.io;
    }

    public getOnlineUserIds(): string[] { // NEW
        return Array.from(this.onlineUsers);
    }
    
    public emitToRoom(room: string, event: string, data: any): void {
        if (this.io) {
            this.io.to(room).emit(event, data);
        }
    }
}

export const socketService = new SocketService();
