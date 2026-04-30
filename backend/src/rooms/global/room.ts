import { BaseRoom } from '../roomFactory';
import { Server } from 'socket.io';
import chatRoutes from '../../shared/chat/routes';

export class GlobalLobbyRoom extends BaseRoom {
    constructor() {
        super({
            roomId: 'global_lobby',
            displayName: 'Global Arena Lobby'
        });
    }

    initRoutes(): void {
        // The global lobby mainly uses the shared chat routes
        this.router.use('/chat', chatRoutes);
    }

    initSocket(io: Server): void {
        this.ioNamespace = io.of(`/rooms/${this.roomId}`);
        this.ioNamespace.on('connection', (socket) => {
            console.log(`User joined Global Lobby: ${socket.id}`);
            socket.on('join_room', (room) => socket.join(room));
        });
    }

    onSponsorUpdate(data: any): void {
        if (this.ioNamespace) {
            this.ioNamespace.emit('sponsor_update', data);
        }
    }
}
