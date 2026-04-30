import pool from '../shared/database';

const nhlMappings: { [key: string]: string } = {
    'Anaheim Ducks': 'ANA',
    'Boston Bruins': 'BOS',
    'Buffalo Sabres': 'BUF',
    'Calgary Flames': 'CGY',
    'Carolina Hurricanes': 'CAR',
    'Chicago Blackhawks': 'CHI',
    'Colorado Avalanche': 'COL',
    'Columbus Blue Jackets': 'CBJ',
    'Dallas Stars': 'DAL',
    'Detroit Red Wings': 'DET',
    'Edmonton Oilers': 'EDM',
    'Florida Panthers': 'FLA',
    'Los Angeles Kings': 'LAK',
    'Minnesota Wild': 'MIN',
    'Montreal Canadiens': 'MTL',
    'Montréal Canadiens': 'MTL',
    'Nashville Predators': 'NSH',
    'New Jersey Devils': 'NJD',
    'New York Islanders': 'NYI',
    'New York Rangers': 'NYR',
    'Ottawa Senators': 'OTT',
    'Philadelphia Flyers': 'PHI',
    'Pittsburgh Penguins': 'PIT',
    'San Jose Sharks': 'SJS',
    'Seattle Kraken': 'SEA',
    'St. Louis Blues': 'STL',
    'Tampa Bay Lightning': 'TBL',
    'Toronto Maple Leafs': 'TOR',
    'Utah Mammoth': 'UTA',
    'Vancouver Canucks': 'VAN',
    'Vegas Golden Knights': 'VGK',
    'Washington Capitals': 'WSH',
    'Winnipeg Jets': 'WPG'
};

export const updateNHLLogos = async () => {
    const client = await pool.connect();
    try {
        console.log('🏒 Updating NHL Database Logos to Local Paths...');
        
        for (const [teamName, abbr] of Object.entries(nhlMappings)) {
            const localUrl = `/assets/logos/nhl/${abbr}.svg`;
            
            // Update nhl_matches
            await client.query(`
                UPDATE nhl_matches 
                SET home_logo = $1 
                WHERE home_team = $2 OR home_team LIKE $3
            `, [localUrl, teamName, `%${teamName}%`]);

            await client.query(`
                UPDATE nhl_matches 
                SET away_logo = $1 
                WHERE away_team = $2 OR away_team LIKE $3
            `, [localUrl, teamName, `%${teamName}%`]);
            
            // Also update team_logos table for global reference
            await client.query(`
                INSERT INTO team_logos (team_name, logo_url, is_verified)
                VALUES ($1, $2, true)
                ON CONFLICT (team_name) DO UPDATE SET logo_url = $2, is_verified = true
            `, [teamName, localUrl]);
        }
        
        console.log('✅ NHL Logos localized successfully.');
    } catch (err) {
        console.error('❌ NHL Logo update failed:', err);
    } finally {
        client.release();
    }
};

if (require.main === module) {
    updateNHLLogos().then(() => process.exit(0));
}
