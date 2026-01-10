import axios from 'axios';
import pool from '../shared/database';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_KEY = '3'; // Public/Test key for TheSportsDB
const API_BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

const LEAGUES = [
    { name: 'English Premier League' },
    { name: 'Spanish La Liga' },
    { name: 'German Bundesliga' },
    { name: 'Italian Serie A' },
    { name: 'French Ligue 1' },
    { name: 'American Major League Soccer' }
];

const seedTheSportsDBLogos = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting TheSportsDB Logo Seed (Phase 26)...');

        for (const league of LEAGUES) {
            console.log(`📡 Fetching teams for ${league.name}...`);

            try {
                const response = await axios.get(`${API_BASE}/search_all_teams.php`, {
                    params: { l: league.name }
                });

                const teams = response.data.teams;
                if (!teams || !Array.isArray(teams)) {
                    console.warn(`⚠️ No teams found for league ${league.name}.`);
                    continue;
                }

                console.log(`✅ Found ${teams.length} teams. Upserting to database...`);

                for (const team of teams) {
                    const teamName = team.strTeam;
                    const logoUrl = team.strBadge;

                    if (!logoUrl) continue;

                    await client.query(`
                        INSERT INTO team_logos (team_name, logo_url, is_verified)
                        VALUES ($1, $2, true)
                        ON CONFLICT (team_name) DO UPDATE SET 
                            logo_url = EXCLUDED.logo_url, 
                            is_verified = true
                    `, [teamName, logoUrl]);
                }
            } catch (err: any) {
                console.error(`❌ Error fetching ${league.name}:`, err.message);
            }
        }

        console.log('✨ TheSportsDB Logo Seeding Complete!');
    } catch (err: any) {
        console.error('❌ Seeding process failed:', err.message);
    } finally {
        client.release();
        process.exit(0);
    }
};

seedTheSportsDBLogos();
