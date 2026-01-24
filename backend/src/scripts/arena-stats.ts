import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';

/**
 * ARENA BUSINESS INTELLIGENCE (BI) REPORT
 * Purpose: Provides a high-level overview of site health, user growth, and economy stats.
 */
const runReport = async () => {
    console.log('\n=============================================');
    console.log('🏆 EVENTS ARENA: DAILY BUSINESS REPORT');
    console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
    console.log('=============================================\n');

    try {
        // --- 1. USER GROWTH & REACH ---
        const userStats = await query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as new_24h,
                COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_7d
            FROM users
        `);

        // Active Users (assuming total_points change or prediction created_at implies activity)
        const active24h = await query(`
            SELECT COUNT(DISTINCT user_id) 
            FROM soccer_predictions 
            WHERE created_at > NOW() - INTERVAL '24 hours'
        `);

        console.log('👤 USER AUDIENCE');
        console.log(`- Total Registered Users:  ${userStats.rows[0].total_users}`);
        console.log(`- New Users (24h):         ${userStats.rows[0].new_24h}`);
        console.log(`- New Users (7d):          ${userStats.rows[0].new_7d}`);
        console.log(`- Active Players (24h):    ${active24h.rows[0].count}`);
        console.log('---------------------------------------------');

        // --- 2. PREDICTION VOLUME ---
        const predStats = await query(`
            SELECT 
                COUNT(*) as total_preds,
                COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as preds_24h,
                COUNT(*) FILTER (WHERE result = 'correct') as solved_wins,
                COUNT(*) FILTER (WHERE result = 'pending') as currently_pending
            FROM soccer_predictions
        `);

        const topLeagues = await query(`
            SELECT m.league, COUNT(p.id) as count
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            GROUP BY m.league
            ORDER BY count DESC
            LIMIT 3
        `);

        console.log('🎮 PREDICTION ACTIVITY');
        console.log(`- Total Swipes:            ${predStats.rows[0].total_preds}`);
        console.log(`- Swipes (24h):            ${predStats.rows[0].preds_24h}`);
        console.log(`- Success Rate:            ${((parseInt(predStats.rows[0].solved_wins) / (parseInt(predStats.rows[0].total_preds) || 1)) * 100).toFixed(1)}%`);
        console.log(`- Stuck in Pending:        ${predStats.rows[0].currently_pending}`);
        if (topLeagues.rows.length > 0) {
            console.log('🔥 Trending Leagues:');
            topLeagues.rows.forEach(l => console.log(`  └ ${l.league}: ${l.count} predictions`));
        }
        console.log('---------------------------------------------');

        // --- 3. ECONOMY HEALTH (Inflation Check) ---
        const economy = await query(`
            SELECT 
                SUM(total_points) as total_xp,
                SUM(token_balance) as total_tokens,
                SUM(total_tickets) as total_tickets,
                AVG(token_balance)::int as avg_tokens_per_user
            FROM users
        `);

        console.log('💰 ECONOMY & CURRENCY');
        console.log(`- Tokens in Circulation:   ${economy.rows[0].total_tokens}`);
        console.log(`- Tickets in Wallets:      ${economy.rows[0].total_tickets}`);
        console.log(`- Total Arena XP:          ${economy.rows[0].total_xp}`);
        console.log(`- Avg Tokens/User:         ${economy.rows[0].avg_tokens_per_user}`);
        console.log('---------------------------------------------');

        // --- 4. PRIZE DRAW ENGAGEMENT ---
        const draws = await query(`
            SELECT 
                COUNT(*) as total_draws,
                COUNT(*) FILTER (WHERE status = 'upcoming' OR status = 'live') as live_draws,
                (SELECT COUNT(*) FROM prize_draw_entries) as total_entries
            FROM prize_draws
        `);

        console.log('🎁 DRAW ROOM PERFORMANCE');
        console.log(`- Live Prize Rooms:        ${draws.rows[0].live_draws}`);
        console.log(`- Total Entries Processed: ${draws.rows[0].total_entries}`);
        console.log('---------------------------------------------');

        // --- 5. TOP PERFORMERS (Retention) ---
        const mvp = await query(`
            SELECT username, total_points, current_level 
            FROM users 
            ORDER BY total_points DESC 
            LIMIT 3
        `);

        if (mvp.rows.length > 0) {
            console.log('🏆 REAL-TIME LEADERS');
            mvp.rows.forEach((u, i) => {
                const name = (u.username || 'Unknown').toString().padEnd(15);
                console.log(`${i + 1}. ${name} | ${u.total_points} XP | Lvl ${u.current_level}`);
            });
        }

    } catch (err) {
        console.error('❌ BI Report Failed:', err);
    } finally {
        console.log('\n=============================================');
        console.log('🏁 End of Report');
        console.log('=============================================\n');
        process.exit(0);
    }
};

runReport();
