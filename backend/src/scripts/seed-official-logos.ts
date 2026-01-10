import axios from 'axios';
import pool from '../shared/database';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = 'https://v3.football.api-sports.io';

// Major League IDs from API-Sports
const LEAGUES = [
    { id: 39, name: 'Premier League' },
    { id: 140, name: 'La Liga' },
    { id: 78, name: 'Bundesliga' },
    { id: 135, name: 'Serie A' },
    { id: 61, name: 'Ligue 1' },
    { id: 253, name: 'MLS' }
];

const seedOfficialLogos = async () => {
    if (!API_KEY) {
        console.error('❌ API_FOOTBALL_KEY not found in environment.');
        process.exit(1);
    }

    const client = await pool.connect();
    try {
        console.log('🚀 Starting Official Logo Seed (Phase 20)...');

        // Test with Leagues first to verify key
        try {
            console.log('📡 Testing API access with /leagues...');
            const testRes = await axios.get(`${API_HOST}/leagues`, {
                headers: { 'x-apisports-key': API_KEY }
            });
            console.log('📊 API Leagues Check:', testRes.data.response ? `Found ${testRes.data.response.length} leagues` : 'No response data');
            if (testRes.data.errors && Object.keys(testRes.data.errors).length > 0) {
                console.error('❌ API Errors:', JSON.stringify(testRes.data.errors));
            }
        } catch (e: any) {
            console.error('❌ API Test Failed:', e.message);
        }

        for (const league of LEAGUES) {
            console.log(`📡 Fetching teams for ${league.name} (ID: ${league.id})...`);

            const response = await axios.get(`${API_HOST}/teams`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { league: league.id, season: 2024 }
            });

            const teams = response.data.response;
            if (!teams || !Array.isArray(teams) || teams.length === 0) {
                console.warn(`⚠️ No teams found for league ${league.name}. Response:`, JSON.stringify(response.data.errors || 'No Errors', null, 2));
                continue;
            }

            console.log(`✅ Found ${teams.length} teams. Upserting to database...`);

            for (const item of teams) {
                const team = item.team;
                await client.query(`
                    INSERT INTO team_logos (team_name, logo_url, is_verified)
                    VALUES ($1, $2, true)
                    ON CONFLICT (team_name) DO UPDATE SET 
                        logo_url = EXCLUDED.logo_url, 
                        is_verified = true
                `, [team.name, team.logo]);
            }
        }

        console.log('✨ Official Logo Seeding Complete!');
    } catch (err: any) {
        console.error('❌ Seeding failed:', err.response?.data || err.message);
    } finally {
        client.release();
        process.exit(0);
    }
};

seedOfficialLogos();
