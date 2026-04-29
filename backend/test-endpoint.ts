import app from './src/app';
import request from 'supertest';

// We need a dummy token or we bypass auth for testing?
// Let's just see if it returns 401 or something else.
const run = async () => {
    console.log('Testing NHL endpoint...');
    const resNhl = await request(app).get('/api/rooms/nhl/matches?league=nhl');
    console.log('NHL Response Status:', resNhl.status);
    console.log('NHL Response Body:', resNhl.body);

    console.log('Testing Soccer endpoint...');
    const resSoccer = await request(app).get('/api/rooms/soccer/matches?league=soccer_epl');
    console.log('Soccer Response Status:', resSoccer.status);
    console.log('Soccer Response Body:', resSoccer.body);
};

run().then(() => process.exit(0)).catch(console.error);
