import pool from '../shared/database';
import fs from 'fs';
import path from 'path';

const leagueMappings: { [key: string]: string } = {
    'Premier League': 'premier-league',
    'La Liga': 'la-liga',
    'Bundesliga': 'bundesliga',
    'Serie A': 'serie-a',
    'Ligue 1': 'ligue-1',
    'MLS': 'mls'
};

const manualMappings: { [key: string]: string } = {
    // Premier League
    'Manchester United': 'man-united',
    'Manchester City': 'man-city',
    'Aston Villa': 'aston-villa',
    'Wolverhampton Wanderers': 'wolves',
    'West Ham United': 'west-ham',
    'Newcastle United': 'newcastle',
    'Tottenham Hotspur': 'tottenham',
    'Brighton': 'brighton',
    'Brighton and Hove Albion': 'brighton',
    'Leicester City': 'leicester-city',
    'Ipswich Town': 'ipswich-town',
    'Nottingham Forest': 'nottingham-forest',
    'Sheffield Utd': 'sheffield-united',
    'Luton Town': 'luton-town',

    // La Liga
    'CA Osasuna': 'osasuna',
    'RC Celta de Vigo': 'celta-vigo',
    'Athletic Club': 'athletic-bilbao',
    'Alavés': 'alaves',
    'Leganés': 'leganes',
    'Cádiz': 'cadiz',
    'Atlético Madrid': 'atletico-madrid',

    // Bundesliga
    'TSG Hoffenheim': 'hoffenheim',
    'Eintracht Frankfurt': 'frankfurt',
    'Borussia Monchengladbach': 'monchengladbach',
    'Borussia M\'gladbach': 'monchengladbach',
    '1. FC Köln': 'koln',
    'SV Werder Bremen': 'werder-bremen',
    'Bayer 04 Leverkusen': 'bayer-leverkusen',
    'FC Bayern München': 'bayern-munich',
    'RB Leipzig': 'rb-leipzig',
    '1. FC Heidenheim 1846': 'heidenheim',
    'Heidenheim': 'heidenheim',
    'SC Freiburg': 'freiburg',
    'VfB Stuttgart': 'stuttgart',
    'VfL Bochum 1848': 'bochum',
    'VfL Bochum': 'bochum',
    'FC St. Pauli': 'st-pauli',

    // Ligue 1
    'AS Monaco': 'monaco',
    'RC Lens': 'lens',
    'Lille OSC': 'lille',
    'OGC Nice': 'nice',
    'Montpellier HSC': 'montpellier',
    'Paris Saint-Germain': 'psg',
    'Paris Saint Germain': 'psg',
    'Stade Brestois 29': 'brest',
    'Stade Rennais': 'rennes',
    'Angers SCO': 'angers',
    'Le Havre AC': 'le-havre',
    'Le Havre': 'le-havre',
    'Stade de Reims': 'reims',

    // Serie A
    'Inter Milan': 'inter-milan',
    'AC Milan': 'ac-milan',
    'AS Roma': 'as-roma',
    'Hellas Verona': 'hellas-verona',
    'Udinese Calcio': 'udinese',
    'Venezia FC': 'venezia',
    'Torino FC': 'torino',
    'Genoa': 'genoa'
};

const toKebabCase = (str: string) => {
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

export const updateDatabaseLogos = async () => {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting Database Logo Path Update...');

        // Fetch all unique teams and their current leagues
        const res = await client.query(`
            SELECT DISTINCT home_team as name, league FROM soccer_matches
            UNION
            SELECT DISTINCT away_team as name, league FROM soccer_matches
        `);

        console.log(`Found ${res.rows.length} teams in database.`);

        let updateCount = 0;
        let missingCount = 0;

        for (const team of res.rows) {
            const leagueSlug = leagueMappings[team.league];
            if (!leagueSlug) continue;

            const manualBase = manualMappings[team.name];
            const baseKebab = manualBase || toKebabCase(team.name);
            const possibleNames = [
                `${baseKebab}.png`,
                `${baseKebab}.svg`
            ];

            let foundFilename = null;
            const leagueDir = path.join(__dirname, `../../../frontend/public/logos/${leagueSlug}`);

            if (fs.existsSync(leagueDir)) {
                const files = fs.readdirSync(leagueDir);
                for (const possible of possibleNames) {
                    if (files.includes(possible)) {
                        foundFilename = possible;
                        break;
                    }
                }

                // Fallback: search for a file that starts with the kebab name
                if (!foundFilename) {
                    const match = files.find(f => f.startsWith(baseKebab));
                    if (match) foundFilename = match;
                }
            }

            if (foundFilename) {
                const publicUrl = `/logos/${leagueSlug}/${foundFilename}`;

                await client.query(`
                    UPDATE soccer_matches 
                    SET home_logo = $1 
                    WHERE home_team = $2
                `, [publicUrl, team.name]);

                await client.query(`
                    UPDATE soccer_matches 
                    SET away_logo = $1 
                    WHERE away_team = $2
                `, [publicUrl, team.name]);

                updateCount++;
            } else {
                console.warn(`⚠️ Could not find logo for team: ${team.name} in leagues/${leagueSlug} (tried ${baseKebab})`);
                missingCount++;
            }
        }

        console.log(`✅ Update complete!`);
        console.log(`📊 Updated: ${updateCount} teams`);
        console.log(`❌ Missing: ${missingCount} teams`);

    } catch (err) {
        console.error('❌ Update failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

// If running directly
if (require.main === module) {
    updateDatabaseLogos();
}
