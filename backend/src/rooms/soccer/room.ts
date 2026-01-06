import { BaseRoom } from '../roomFactory';
import { Server } from 'socket.io';
import { query } from '../../shared/database';
import { authenticate, AuthRequest } from '../../shared/auth/middleware';
import { fetchLiveMatches } from '../../shared/services/footballApi';

export class SoccerRoom extends BaseRoom {
    constructor() {
        super({
            roomId: 'soccer',
            displayName: 'Pro Soccer'
        });
    }

    initRoutes(): void {
        // GET /api/rooms/soccer/matches
        this.router.get('/matches', async (req, res) => {
            try {
                // Fetch matches from the last 24 hours to ensure the lobby is populated
                const result = await query('SELECT * FROM soccer_matches WHERE start_time > NOW() - INTERVAL \'24 hours\' ORDER BY start_time ASC');
                res.json(result.rows);
            } catch (err) {
                console.error('Error fetching matches:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // POST /api/rooms/soccer/predictions/match (Aligned with Frontend)
        this.router.post('/predictions/match', authenticate, async (req: AuthRequest, res) => {
            const { matchId, pick } = req.body;
            const userId = req.user?.id;

            if (!matchId || !pick) {
                return res.status(400).json({ message: 'matchId and pick are required' });
            }

            try {
                // Save or update user prediction
                await query(`
                    INSERT INTO soccer_predictions (user_id, match_id, prediction_data)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id, match_id) 
                    DO UPDATE SET prediction_data = EXCLUDED.prediction_data, created_at = CURRENT_TIMESTAMP
                `, [userId, matchId, JSON.stringify({ pick })]);

                res.json({ success: true, message: 'Prediction saved successfully!' });
            } catch (err) {
                console.error('Error saving prediction:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // POST /api/rooms/soccer/refresh (Admin tool)
        this.router.post('/refresh', async (req, res) => {
            try {
                await fetchLiveMatches();
                res.json({ success: true, message: 'Data refresh triggered' });
            } catch (err) {
                res.status(500).json({ error: 'Refresh failed' });
            }
        });
    }

    initSocket(io: Server): void {
        this.ioNamespace = io.of(`/rooms/${this.roomId}`);
        this.ioNamespace.on('connection', (socket) => {
            socket.on('join_room', (room) => socket.join(room));
        });
    }
}
