import pool from '../shared/database';
import { teamIdMap } from '../shared/utils/teamLogos';

const seedLogos = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Seeding verified team logos...');

        for (const [name, id] of Object.entries(teamIdMap)) {
            const url = `https://media.api-sports.io/football/teams/${id}.png`;
            await client.query(`
                INSERT INTO team_logos (team_name, logo_url, is_verified)
                VALUES ($1, $2, true)
                ON CONFLICT (team_name) DO UPDATE SET logo_url = EXCLUDED.logo_url, is_verified = true
            `, [name, url]);
        }

        console.log(`✅ Seeded ${Object.keys(teamIdMap).length} team logos.`);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

seedLogos();
