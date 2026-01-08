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
        // CORRECT, SINGLE DEFINITION FOR MATCHES
        this.router.get('/matches', async (req, res) => {
            try {
                const result = await query(`
                    SELECT * FROM soccer_matches 
                    WHERE start_time > NOW() - INTERVAL '6 hours' 
                    AND start_time < NOW() + INTERVAL '36 hours'
                    ORDER BY 
                        CASE WHEN status = 'live' THEN 1 ELSE 2 END,
                        start_time ASC,
                        league ASC
                `);
                res.json(Array.isArray(result.rows) ? result.rows : []);
            } catch (err) {
                res.json([]);
            }
        });

        this.router.get('/my-calls', authenticate, async (req: AuthRequest, res) => {
            try {
                const result = await query(
                    'SELECT match_id, prediction_data FROM soccer_predictions WHERE user_id = $1',
                    [req.user.id]
                );
                res.json(result.rows);
            } catch (err) {
                res.status(500).json({ error: 'Failed to fetch your calls' });
            }
        });

        this.router.post('/predictions/match', authenticate, async (req: AuthRequest, res) => {
            const { matchId, pick } = req.body;
            const userId = req.user?.id;
            if (!matchId || !pick) return res.status(400).json({ message: 'matchId and pick are required' });

            try {
                const matchCheck = await query('SELECT start_time, status FROM soccer_matches WHERE match_id = $1', [matchId]);
                if (matchCheck.rows.length === 0 || matchCheck.rows[0].status !== 'scheduled' || new Date(matchCheck.rows[0].start_time) <= new Date()) {
                    return res.status(400).json({ message: 'This match has already started!' });
                }

                const existing = await query(
                    'SELECT id FROM soccer_predictions WHERE user_id = $1 AND match_id = $2',
                    [userId, matchId]
                );

                if (existing.rows.length > 0) {
                    return res.status(400).json({ message: 'Your call is already locked in for this match!' });
                }

                await query(`
                    INSERT INTO soccer_predictions (user_id, match_id, prediction_data, result)
                    VALUES ($1, $2, $3, 'pending')
                `, [userId, matchId, JSON.stringify({ pick })]);
                
                res.json({ success: true, message: 'Call Transmitted & Locked!' });
            } catch (err) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        this.router.post('/refresh', authenticate, isAdmin, async (req, res) => {
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
