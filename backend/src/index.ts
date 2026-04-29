import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import { socketService } from './shared/socket/SocketService';
import { roomRegistry } from './rooms/registry';
import { connectRedis } from './shared/database/redis';
import { startKeepAlive } from './shared/cron/keepAlive';
import { startSoccerScheduler } from './rooms/soccer/scheduler';
import { initBackupScheduler } from './shared/services/backupScheduler';

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

    if (!process.env.THE_ODDS_API_KEY) {
        console.error("\n[CRITICAL] THE_ODDS_API_KEY not found in .env. Real-time predictions will be disabled.\n");
    }

    await connectRedis();

    // AUTO-RESOLVE BACKLOG ON STARTUP (v3.7)
    const { SystemMaintenanceService } = require('./shared/database/SystemMaintenanceService');
    SystemMaintenanceService.runMaintenance().catch(console.error);

    startKeepAlive();
    startSoccerScheduler();
    initBackupScheduler();

    roomRegistry.initializeRooms(app, io);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();
