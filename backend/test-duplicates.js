require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkDuplicates() {
    try {
        console.log("Checking for duplicates in soccer_matches...");
        const res = await pool.query(`
            SELECT match_id, COUNT(*) 
            FROM soccer_matches 
            GROUP BY match_id 
            HAVING COUNT(*) > 1
        `);
        if (res.rows.length === 0) {
            console.log("No duplicate match_id found in soccer_matches.");
        } else {
            console.log("Duplicate match_ids found in soccer_matches:");
            console.table(res.rows);
        }

        console.log("\nChecking for duplicates in nhl_matches...");
        const resNhl = await pool.query(`
            SELECT match_id, COUNT(*) 
            FROM nhl_matches 
            GROUP BY match_id 
            HAVING COUNT(*) > 1
        `);
        if (resNhl.rows.length === 0) {
            console.log("No duplicate match_id found in nhl_matches.");
        } else {
            console.log("Duplicate match_ids found in nhl_matches:");
            console.table(resNhl.rows);
        }

    } catch (err) {
        console.error("Error checking duplicates:", err);
    } finally {
        await pool.end();
    }
}

checkDuplicates();
