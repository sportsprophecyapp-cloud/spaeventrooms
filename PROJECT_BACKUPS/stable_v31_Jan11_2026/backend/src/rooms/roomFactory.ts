import { Router } from 'express';
import { Namespace, Server } from 'socket.io';

export interface RoomConfig {
    roomId: string;
    displayName: string;
    // Add other generic config
}

export abstract class BaseRoom {
    public roomId: string;
    public displayName: string;
    public router: Router;
    public ioNamespace: Namespace | null = null;

    constructor(config: RoomConfig) {
        this.roomId = config.roomId;
        this.displayName = config.displayName;
        this.router = Router();
    }

    // Initialize routes for this room
    abstract initRoutes(): void;

    // Initialize socket handlers for this room
    abstract initSocket(io: Server): void;

    // Optional: Sponsor hooks
    abstract onSponsorUpdate(data: any): void;
}
