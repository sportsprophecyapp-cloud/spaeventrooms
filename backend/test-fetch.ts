import { fetchLiveNhlMatches } from './src/shared/services/nhlApi';
import { fetchLiveMatches } from './src/shared/services/footballApi';
import { query } from './src/shared/database';

const run = async () => {
    console.log('Fetching NHL...');
    await fetchLiveNhlMatches();
    console.log('Fetching Soccer...');
    await fetchLiveMatches();

    const nhlRes = await query(`SELECT match_id, home_team, away_team, status FROM nhl_matches LIMIT 5`);
    console.log('NHL Matches in DB:', nhlRes.rows);

    const soccerRes = await query(`SELECT match_id, home_team, away_team, status FROM soccer_matches LIMIT 5`);
    console.log('Soccer Matches in DB:', soccerRes.rows);
};

run().then(() => process.exit(0)).catch(console.error);
