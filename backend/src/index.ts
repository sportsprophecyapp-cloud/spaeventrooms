import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import { socketService } from './shared/socket/SocketService';
import { roomRegistry } from './rooms/registry';
import { connectRedis } from './shared/database/redis';
import { startKeepAlive } from './shared/cron/keepAlive';
import { startSoccerScheduler } from './rooms/soccer/scheduler';

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// Initialize the socket service WITH the http server
socketService.init(server);

const io = socketService.getIO(); // Get the io instance from the service

(async () => {
    if (!io) {
        console.error("[FATAL] Socket.io failed to initialize.");
        process.exit(1);
    }

    await connectRedis();

    startKeepAlive();
    startSoccerScheduler();

    roomRegistry.initializeRooms(app, io);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();
