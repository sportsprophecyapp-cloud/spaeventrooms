import { BaseRoom } from '../roomFactory';
import { Server } from 'socket.io';
import { query } from '../../shared/database';
import { authenticate, AuthRequest, isAdmin } from '../../shared/auth/middleware';
import { fetchLiveMatches } from '../../shared/services/footballApi';
import { fetchApiFootballMatches } from '../../shared/services/apiFootball';

export class SoccerRoom extends BaseRoom {
    constructor() {
        super({
            roomId: 'soccer',
            displayName: 'Soccer Arena'
        });
    }

    initRoutes(): void {
        this.router.get('/matches', async (req, res) => {
            try {
                const result = await query(`
                    SELECT * FROM soccer_matches 
                    WHERE start_time > NOW() - INTERVAL '24 hours' 
                    AND start_time < NOW() + INTERVAL '48 hours'
                    ORDER BY league ASC, start_time ASC
                `);
                res.json(Array.isArray(result.rows) ? result.rows : []);
            } catch (err) {
                res.json([]);
            }
        });

        // TEST MATCH GENERATOR (Admin Only)
        this.router.post('/test-game', authenticate, isAdmin, async (req, res) => {
            try {
                const matchId = `test-${Date.now()}`;
                const startTime = new Date(Date.now() + 5000); // Starts in 5 seconds
                
                await query(`
                    INSERT INTO soccer_matches (match_id, home_team, away_team, start_time, status, league, score_home, score_away)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [matchId, 'Test Team A', 'Test Team B', startTime, 'live', 'DEBUG LEAGUE', 0, 0]);

                // Auto-finish after 60 seconds
                setTimeout(async () => {
                    await query("UPDATE soccer_matches SET status = 'finished', score_home = 2, score_away = 1 WHERE match_id = $1", [matchId]);
                    console.log(`🏁 Test Match ${matchId} finished. Resolution Engine will pick it up.`);
                }, 60000);

                res.json({ success: true, matchId });
            } catch (err) {
                res.status(500).json({ error: 'Failed to create test match' });
            }
        });

        this.router.post('/predictions/match', authenticate, async (req: AuthRequest, res) => {
            const { matchId, pick } = req.body;
            const userId = req.user?.id;
            if (!matchId || !pick) return res.status(400).json({ message: 'matchId and pick are required' });

            try {
                await query(`
                    INSERT INTO soccer_predictions (user_id, match_id, prediction_data)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id, match_id) 
                    DO UPDATE SET prediction_data = EXCLUDED.prediction_data, created_at = CURRENT_TIMESTAMP
                `, [userId, matchId, JSON.stringify({ pick })]);
                res.json({ success: true, message: 'Call Transmitted!' });
            } catch (err) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        this.router.post('/refresh', async (req, res) => {
            try {
                await Promise.all([fetchLiveMatches(), fetchApiFootballMatches()]);
                res.json({ success: true, message: 'Arena data refreshed' });
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

    onSponsorUpdate(data: any): void {
        if (this.ioNamespace) {
            this.ioNamespace.emit('sponsor_update', data);
        }
    }
}
