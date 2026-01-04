import { BaseRoom } from '../roomFactory';
import { Server } from 'socket.io';
import { query } from '../../shared/database';
import { authenticate, AuthRequest } from '../../shared/auth/middleware';

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

        this.router.post('/predictions', authenticate, async (req: AuthRequest, res) => {
            const { matchId, pick } = req.body;
            const userId = req.user.id;

            if (!matchId || !pick) {
                return res.status(400).json({ message: 'matchId and pick are required' });
            }

            try {
                await query(`
                    INSERT INTO soccer_predictions (user_id, match_id, prediction_data)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id, match_id) 
                    DO UPDATE SET prediction_data = EXCLUDED.prediction_data, created_at = CURRENT_TIMESTAMP
                `, [userId, matchId, JSON.stringify({ pick })]);

                res.json({ success: true, message: 'Prediction saved' });
            } catch (err) {
                console.error('Error saving prediction:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
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
