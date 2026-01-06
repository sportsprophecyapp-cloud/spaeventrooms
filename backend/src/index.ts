import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './app';
import { socketService } from './shared/socket/SocketService';
// import { initializeSocket } from './rooms/socket'; // To be implemented

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*', // Allow all for dev, restrict in prod
        methods: ['GET', 'POST']
    }
});

socketService.init(io);

import { roomRegistry } from './rooms/registry';
import { connectRedis } from './shared/database/redis';
import { startKeepAlive } from './shared/cron/keepAlive';
import { startSoccerScheduler } from './rooms/soccer/scheduler';

// ... other imports ...

// initializeSocket(io);

(async () => {
    await connectRedis();

    startKeepAlive();
    startSoccerScheduler();

    roomRegistry.initializeRooms(app, io);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();
