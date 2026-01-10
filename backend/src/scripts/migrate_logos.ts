import pool from '../shared/database';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { pipeline } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);

const mappings: { [key: string]: string } = {
    'Premier League': 'premier-league',
    'La Liga': 'la-liga',
    'Bundesliga': 'bundesliga',
    'Serie A': 'serie-a',
    'Ligue 1': 'ligue-1',
    'MLS': 'mls'
};

const downloadImage = async (url: string, filepath: string) => {
    console.log(`Writing to: ${filepath}`);
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        https.get(url, options, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(filepath);
            streamPipeline(response, fileStream)
                .then(() => resolve(true))
                .catch(reject);
        }).on('error', reject);
    });
};

const toKebabCase = (str: string) => {
    return str.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

const migrate = async () => {
    const client = await pool.connect();
    const sqlFile = path.join(__dirname, 'update_logos_auto.sql');
    fs.writeFileSync(sqlFile, '-- Auto-generated logo updates\n');

    try {
        console.log('Fetching teams...');
        // Union header to get unique teams
        const res = await client.query(`
            SELECT DISTINCT home_team as name, home_logo as logo, league FROM soccer_matches WHERE home_logo IS NOT NULL
            UNION
            SELECT DISTINCT away_team as name, away_logo as logo, league FROM soccer_matches WHERE away_logo IS NOT NULL
        `);

        console.log(`Found ${res.rows.length} teams.`);

        for (const team of res.rows) {
            const leagueSlug = mappings[team.league];
            if (!leagueSlug) {
                console.warn(`Skipping unknown league: ${team.league} for team ${team.name}`);
                continue;
            }

            const filename = `${toKebabCase(team.name)}.png`;
            const relativePath = `logos/${leagueSlug}/${filename}`;
            const localPath = path.join(__dirname, '../../../frontend/public', relativePath);
            const publicUrl = `https://www.sportsprophecyapp.com/${relativePath}`;

            // Ensure directory exists
            const dir = path.dirname(localPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            try {
                if (team.logo && team.logo.startsWith('http')) {
                    console.log(`Downloading ${team.name}...`);
                    await downloadImage(team.logo, localPath);

                    // Generate SQL
                    const sql = `
UPDATE soccer_matches SET home_logo = '${publicUrl}' WHERE home_team = '${team.name.replace(/'/g, "''")}';
UPDATE soccer_matches SET away_logo = '${publicUrl}' WHERE away_team = '${team.name.replace(/'/g, "''")}';
`;
                    fs.appendFileSync(sqlFile, sql);
                }
            } catch (err) {
                console.error(`Failed to download for ${team.name}:`, err);
            }
        }

        console.log('Migration script complete. SQL saved to update_logos_auto.sql');
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        process.exit(0);
    }
};

migrate();
