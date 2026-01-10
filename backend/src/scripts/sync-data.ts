import { fetchLiveMatches } from '../shared/services/footballApi';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const sync = async () => {
    try {
        console.log('🚀 Manual Data Sync: Fetching latest matches with logos...');
        await fetchLiveMatches();
        console.log('✅ Data Sync Complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Data Sync Failed:', err);
        process.exit(1);
    }
};

sync();
