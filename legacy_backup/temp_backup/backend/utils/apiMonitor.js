const mongoose = require('mongoose');

// Schema to track API usage
const APIUsageSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now, index: true },
    endpoint: { type: String, required: true },
    sport: String,
    success: { type: Boolean, default: true },
    responseTime: Number, // milliseconds
    error: String
});

const APIUsage = mongoose.model('APIUsage', APIUsageSchema);

/**
 * Track an API call to The Odds API
 * @param {string} endpoint - API endpoint called (e.g., 'odds', 'scores')
 * @param {string} sport - Sport identifier
 * @param {boolean} success - Whether the call succeeded
 * @param {number} responseTime - Response time in ms
 * @param {string} error - Error message if failed
 */
async function trackAPICall(endpoint, sport, success = true, responseTime = 0, error = null) {
    try {
        await APIUsage.create({
            endpoint,
            sport,
            success,
            responseTime,
            error
        });
    } catch (err) {
        console.error('Failed to track API usage:', err.message);
    }
}

/**
 * Get API usage statistics
 * @returns {Object} Usage stats with daily and monthly counts
 */
async function getUsageStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dailyCount, monthlyCount, failedToday] = await Promise.all([
        APIUsage.countDocuments({ date: { $gte: today } }),
        APIUsage.countDocuments({ date: { $gte: monthStart } }),
        APIUsage.countDocuments({ date: { $gte: today }, success: false })
    ]);

    // Calculate average response time for today
    const todayStats = await APIUsage.aggregate([
        { $match: { date: { $gte: today }, success: true } },
        { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } }
    ]);

    const avgResponseTime = todayStats.length > 0 ? Math.round(todayStats[0].avgResponseTime) : 0;

    return {
        daily: dailyCount,
        monthly: monthlyCount,
        failedToday,
        avgResponseTime,
        timestamp: now
    };
}

/**
 * Check if approaching API limits and log warnings
 * @param {number} monthlyLimit - Monthly API call limit
 */
async function checkLimits(monthlyLimit = 10000) {
    const stats = await getUsageStats();
    const percentUsed = (stats.monthly / monthlyLimit) * 100;

    if (percentUsed >= 90) {
        console.error(`🚨 CRITICAL: API usage at ${percentUsed.toFixed(1)}% of monthly limit!`);
    } else if (percentUsed >= 80) {
        console.warn(`⚠️ WARNING: API usage at ${percentUsed.toFixed(1)}% of monthly limit`);
    } else if (percentUsed >= 50) {
        console.log(`📊 INFO: API usage at ${percentUsed.toFixed(1)}% of monthly limit`);
    }

    return stats;
}

module.exports = { trackAPICall, getUsageStats, checkLimits };
