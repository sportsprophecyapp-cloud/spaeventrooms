require('dotenv').config();
const axios = require('axios');

const API_KEYS = [
    process.env.THE_ODDS_API_KEY,
    process.env.THE_ODDS_API_KEY_2,
    process.env.THE_ODDS_API_KEY_3
].filter(Boolean);

console.log('API Keys found:', API_KEYS.length);
API_KEYS.forEach((key, index) => console.log(`Key ${index}: ${key.substring(0, 4)}... (Length: ${key.length})`));

const SPORT = 'icehockey_nhl';

async function testKey(apiKey, index) {
    console.log(`\nTesting Key ${index}...`);
    try {
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${SPORT}/odds`, {
            params: {
                apiKey: apiKey,
                regions: 'us',
                markets: 'h2h',
                oddsFormat: 'american'
            },
            timeout: 5000
        });
        console.log(`✅ Key ${index} Success!`);
        console.log(`Remaining requests: ${response.headers['x-requests-remaining']}`);
        console.log(`Used requests: ${response.headers['x-requests-used']}`);
        console.log(`Events found: ${response.data.length}`);
    } catch (error) {
        console.error(`❌ Key ${index} Failed:`, error.message);
        if (error.response) {
            console.error('Code:', error.response.data.error_code);
            console.error('Message:', error.response.data.message);
        }
    }
}

async function run() {
    for (let i = 0; i < API_KEYS.length; i++) {
        await testKey(API_KEYS[i], i);
    }
}

run();
