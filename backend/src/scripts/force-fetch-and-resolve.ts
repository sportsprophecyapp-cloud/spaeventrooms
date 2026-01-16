import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { fetchLiveMatches } from '../shared/services/footballApi';
import { resolveSoccerPredictions } from '../shared/services/resolver';

// This script forces an API update for ALL leagues, then runs resolution
const superSync = async () => {
    console.log('🌍 MEGA SYNC: Polling API for all leagues to update match statuses...');

    // 1. Fetch live data (which updates match statuses in DB)
    // We call it without arguments to hit ALL leagues in SPORTS list
    await fetchLiveMatches();

    console.log('✅ API Sync Complete. Now running resolution engine...');

    // 2. Resolve bets based on new match statuses
    await resolveSoccerPredictions();

    console.log('🏁 Mega Sync Finished.');
};

superSync();
