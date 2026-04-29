import { query } from './src/shared/database';

const run = async () => {
    const soccerRes = await query(`SELECT league, count(*) FROM soccer_matches WHERE status = 'scheduled' GROUP BY league`);
    console.log('Soccer Scheduled by League:', soccerRes.rows);
};

run().then(() => process.exit(0)).catch(console.error);
