import pool from '../shared/database';

const seedData = async () => {
    const client = await pool.connect();
    try {
        console.log('Seeding initial data...');

        // 1. Seed Rooms
        await client.query(`
            INSERT INTO rooms (room_id, display_name)
            VALUES ('soccer', 'Pro Soccer')
            ON CONFLICT (room_id) DO NOTHING;
        `);

        // 2. Seed Soccer Matches
        const matches = [
            { id: 'match_1', home: 'Arsenal', away: 'Chelsea', time: new Date(Date.now() + 3600000).toISOString(), status: 'scheduled' },
            { id: 'match_2', home: 'Man City', away: 'Liverpool', time: new Date(Date.now() + 7200000).toISOString(), status: 'scheduled' },
            { id: 'match_3', home: 'Real Madrid', away: 'Barcelona', time: new Date(Date.now() - 3600000).toISOString(), status: 'live', score_home: 1, score_away: 0 },
        ];

        for (const m of matches) {
            await client.query(`
                INSERT INTO soccer_matches (match_id, home_team, away_team, start_time, status, score_home, score_away)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (match_id) DO UPDATE SET 
                    status = EXCLUDED.status,
                    score_home = EXCLUDED.score_home,
                    score_away = EXCLUDED.score_away;
            `, [m.id, m.home, m.away, m.time, m.status, m.score_home || 0, m.score_away || 0]);
        }

        // 3. Seed Sample Announcement
        await client.query(`
            INSERT INTO announcements (room_id, type, title, description, is_draft, published_at)
            VALUES ('soccer', 'live', 'Welcome to Phase 3!', 'Real-time announcements are now live. Check out the Admin Panel to post your own!', false, CURRENT_TIMESTAMP)
            ON CONFLICT DO NOTHING;
        `);

        console.log('Seeding completed successfully.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        client.release();
        process.exit();
    }
};

seedData();
