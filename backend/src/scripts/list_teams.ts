import pool from '../shared/database';

const checkLogos = async () => {
    try {
        const client = await pool.connect();
        console.log('--- TEAM LIST START ---');

        // Get all unique home teams
        const homeTeams = await client.query('SELECT DISTINCT home_team, home_logo, league FROM soccer_matches');
        // Get all unique away teams
        const awayTeams = await client.query('SELECT DISTINCT away_team, away_logo, league FROM soccer_matches');

        const teams = new Map();

        homeTeams.rows.forEach(row => {
            if (!teams.has(row.home_team)) {
                teams.set(row.home_team, { name: row.home_team, logo: row.home_logo, league: row.league });
            }
        });

        awayTeams.rows.forEach(row => {
            if (!teams.has(row.away_team)) {
                teams.set(row.away_team, { name: row.away_team, logo: row.away_logo, league: row.league });
            }
        });

        console.log(JSON.stringify(Array.from(teams.values()), null, 2));

        console.log('--- TEAM LIST END ---');
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Error checking logos:', err);
        process.exit(1);
    }
};

checkLogos();
