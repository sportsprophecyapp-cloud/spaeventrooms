import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkQuota = async () => {
    const keys = (process.env.THE_ODDS_API_KEY || '').split(',').map(k => k.trim()).filter(k => k);

    if (keys.length === 0) {
        console.error('❌ No API keys found in .env');
        return;
    }

    console.log(`🔍 Checking Quota for ${keys.length} key(s)...`);

    for (const key of keys) {
        try {
            // Make a lightweight call (just sports list) to check headers
            const response = await axios.get('https://api.the-odds-api.com/v4/sports', {
                params: { apiKey: key }
            });

            const remaining = response.headers['x-requests-remaining'];
            const used = response.headers['x-requests-used'];
            console.log(`✅ Key ending in ...${key.slice(-4)}:`);
            console.log(`   - Requests Remaining: ${remaining}`);
            console.log(`   - Requests Used: ${used}`);
        } catch (error: any) {
            console.error(`❌ Key ...${key.slice(-4)} failed: ${error.message}`);
        }
    }
};

checkQuota();
