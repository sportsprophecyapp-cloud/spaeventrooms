import { BaseRoom } from '../roomFactory';
import { Server } from 'socket.io';
import { query } from '../../shared/database';

export class SoccerRoom extends BaseRoom {
    constructor() {
        super({
            roomId: 'soccer',
            displayName: 'Pro Soccer'
        });
    }

    initRoutes(): void {
        this.router.get('/matches', async (req, res) => {
            try {
                const result = await query('SELECT * FROM soccer_matches ORDER BY start_time ASC');
                res.json(result.rows);
            } catch (err) {
                console.error('Error fetching matches:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        this.router.post('/predictions', async (req, res) => {
            // TODO: Implement prediction submission with auth
            res.json({ message: 'Submit prediction endpoint (Pending Auth)' });
        });
    }

    initSocket(io: Server): void {
        this.ioNamespace = io.of(`/rooms/${this.roomId}`);

        this.ioNamespace.on('connection', (socket) => {
            console.log(`User connected to ${this.displayName} room`);

            socket.on('join_room', (room) => {
                socket.join(room);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected from soccer room');
            });
        });
    }

    onSponsorUpdate(data: any): void {
        console.log('Sponsor update received', data);
        if (this.ioNamespace) {
            this.ioNamespace.emit('sponsor_update', data);
        }
    }
}
