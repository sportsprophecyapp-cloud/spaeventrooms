import { query } from './src/shared/database';

const run = async () => {
    const nhlRes = await query(`SELECT status, count(*) FROM nhl_matches GROUP BY status`);
    console.log('NHL Status Counts:', nhlRes.rows);

    const soccerRes = await query(`SELECT status, count(*) FROM soccer_matches GROUP BY status`);
    console.log('Soccer Status Counts:', soccerRes.rows);
};

run().then(() => process.exit(0)).catch(console.error);
