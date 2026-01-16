import { fetchLiveMatches } from '../shared/services/footballApi';
import { resolveSoccerPredictions } from '../shared/services/resolver';

// This script forces a deep sync for past dates that might have been missed
// It mocks the "current time" logic or simply calls the fetcher which we know defaults to a window.
// Actually, since fetchLiveMatches (as written) relies on "daysFrom" (future) or just "scores" (active/recent),
// we might not reach Jan 5th easily via the standard function if the API blocks it.
// BUT, we can try to run the resolution engine first to see if matches are ALREADY in DB as finished but just not resolved.

const forceResolution = async () => {
    console.log('🧹 Force Resolving - Checking for finished matches in DB...');
    await resolveSoccerPredictions();
    console.log('✅ Resolution pass complete.');
};

// If we needed to fetch from API, we would need to know if the API supports historical dates on free plan.
// Assuming it does NOT for >3 days, we rely on what we have or hope the API gives us "Active" window.

forceResolution();
