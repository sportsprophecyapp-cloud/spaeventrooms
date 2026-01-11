import pool from '../shared/database';
import path from 'path';
import manifest from '../data/logo_manifest.json';

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
    'Man United': 'man-united',
    'Manchester City': 'man-city',
    'Man City': 'man-city',
    'Tottenham': 'tottenham',
    'Tottenham Hotspur': 'tottenham',
    'Brighton': 'brighton',
    'Brighton and Hove Albion': 'brighton',
    'Leicester City': 'leicester-city',
    'Ipswich Town': 'ipswich-town',
    'Nottingham Forest': 'nottingham-forest',
    'Sheffield Utd': 'sheffield-united',
    'Luton Town': 'luton-town',
    'Wolverhampton Wanderers': 'wolves',
    'West Ham United': 'west-ham',
    'Newcastle United': 'newcastle',
    'Fulham': 'fulham',
    'Brentford': 'brentford',
    'Aston Villa': 'aston-villa',
    'Leeds United': 'leeds-united',
    'Sunderland': 'sunderland',

    // La Liga
    'Real Sociedad': 'real-sociedad',
    'Atletico Madrid': 'atletico-madrid',
    'Atlético Madrid': 'atletico-madrid',
    'Oviedo': 'real-oviedo',
    'CA Osasuna': 'osasuna',
    'Osasuna': 'osasuna',
    'RC Celta de Vigo': 'celta-vigo',
    'Celta Vigo': 'celta-vigo',
    'RC Celta': 'celta-vigo',
    'Athletic Club': 'athletic-bilbao',
    'Athletic Bilbao': 'athletic-bilbao',
    'Alavés': 'alaves',
    'Leganés': 'leganes',
    'Espanyol': 'espanyol',
    'RCD Espanyol': 'espanyol',
    'Elche CF': 'elche',
    'Elche': 'elche',

    // Bundesliga
    'TSG Hoffenheim': 'hoffenheim',
    'Eintracht Frankfurt': 'frankfurt',
    'Borussia Monchengladbach': 'monchengladbach',
    'Borussia M\'gladbach': 'monchengladbach',
    'Borussia Mönchengladbach': 'monchengladbach',
    '1. FC Köln': 'koln',
    'SV Werder Bremen': 'werder-bremen',
    'Bayer 04 Leverkusen': 'bayer-leverkusen',
    'FC Bayern München': 'bayern-munich',
    'Bayern Munich': 'bayern-munich',
    'RB Leipzig': 'rb-leipzig',
    '1. FC Heidenheim': 'heidenheim',
    '1. FC Heidenheim 1846': 'heidenheim',
    'Heidenheim': 'heidenheim',
    'SC Freiburg': 'freiburg',
    'VfB Stuttgart': 'stuttgart',
    'VfL Wolfsburg': 'wolfsburg',
    'FSV Mainz 05': 'mainz',
    'VfL Bochum 1848': 'bochum',
    'VfL Bochum': 'bochum',
    'FC St. Pauli': 'st-pauli',

    // Ligue 1
    'AS Monaco': 'monaco',
    'RC Lens': 'lens',
    'Lille OSC': 'lille',
    'Lille': 'lille',
    'OGC Nice': 'nice',
    'Nice': 'nice',
    'Montpellier HSC': 'montpellier',
    'Montpellier': 'montpellier',
    'Paris Saint-Germain': 'psg',
    'Paris Saint Germain': 'psg',
    'PSG': 'psg',
    'Stade Brestois 29': 'brest',
    'Brest': 'brest',
    'Stade Rennais': 'rennes',
    'Rennes': 'rennes',
    'Angers SCO': 'angers',
    'Angers': 'angers',
    'Le Havre AC': 'le-havre',
    'Le Havre': 'le-havre',
    'Stade de Reims': 'reims',
    'Reims': 'reims',
    'Metz': 'metz',
    'FC Metz': 'metz',

    // Serie A
    'Inter Milan': 'inter-milan',
    'Inter': 'inter-milan',
    'AC Milan': 'ac-milan',
    'AS Roma': 'as-roma',
    'Roma': 'as-roma',
    'Hellas Verona': 'hellas-verona',
    'Verona': 'hellas-verona',
    'Udinese Calcio': 'udinese',
    'Udinese': 'udinese',
    'Venezia FC': 'venezia',
    'Venezia': 'venezia',
    'Torino FC': 'torino',
    'Torino': 'torino',
    'Genoa': 'genoa',
    'Atalanta BC': 'atalanta',
    'Sassuolo': 'sassuolo'
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
            const files = (manifest as any)[leagueSlug] || [];

            if (files.length > 0) {
                for (const possible of possibleNames) {
                    if (files.includes(possible)) {
                        foundFilename = possible;
                        break;
                    }
                }

                if (!foundFilename) {
                    const match = files.find((f: string) => f.startsWith(baseKebab));
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
    }
};

// If running directly
if (require.main === module) {
    updateDatabaseLogos().then(() => process.exit(0));
}
