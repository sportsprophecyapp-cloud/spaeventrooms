/**
 * Team Logo Mapping Utility
 * Maps team names to official logo URLs (ESPN CDN)
 */

const LOGO_BASE_URL = 'https://a.espncdn.com/i/teamlogos';

// Helper to construct ESPN logo URLs
const getEspnLogo = (league, teamAbbr) => `${LOGO_BASE_URL}/${league}/500/${teamAbbr}.png`;

// Mapping of Team Name -> Logo URL
const TEAM_LOGOS = {
    // NFL
    'Arizona Cardinals': getEspnLogo('nfl', 'ari'),
    'Atlanta Falcons': getEspnLogo('nfl', 'atl'),
    'Baltimore Ravens': getEspnLogo('nfl', 'bal'),
    'Buffalo Bills': getEspnLogo('nfl', 'buf'),
    'Carolina Panthers': getEspnLogo('nfl', 'car'),
    'Chicago Bears': getEspnLogo('nfl', 'chi'),
    'Cincinnati Bengals': getEspnLogo('nfl', 'cin'),
    'Cleveland Browns': getEspnLogo('nfl', 'cle'),
    'Dallas Cowboys': getEspnLogo('nfl', 'dal'),
    'Denver Broncos': getEspnLogo('nfl', 'den'),
    'Detroit Lions': getEspnLogo('nfl', 'det'),
    'Green Bay Packers': getEspnLogo('nfl', 'gb'),
    'Houston Texans': getEspnLogo('nfl', 'hou'),
    'Indianapolis Colts': getEspnLogo('nfl', 'ind'),
    'Jacksonville Jaguars': getEspnLogo('nfl', 'jax'),
    'Kansas City Chiefs': getEspnLogo('nfl', 'kc'),
    'Las Vegas Raiders': getEspnLogo('nfl', 'lv'),
    'Los Angeles Chargers': getEspnLogo('nfl', 'lac'),
    'Los Angeles Rams': getEspnLogo('nfl', 'lar'),
    'Miami Dolphins': getEspnLogo('nfl', 'mia'),
    'Minnesota Vikings': getEspnLogo('nfl', 'min'),
    'New England Patriots': getEspnLogo('nfl', 'ne'),
    'New Orleans Saints': getEspnLogo('nfl', 'no'),
    'New York Giants': getEspnLogo('nfl', 'nyg'),
    'New York Jets': getEspnLogo('nfl', 'nyj'),
    'Philadelphia Eagles': getEspnLogo('nfl', 'phi'),
    'Pittsburgh Steelers': getEspnLogo('nfl', 'pit'),
    'San Francisco 49ers': getEspnLogo('nfl', 'sf'),
    'Seattle Seahawks': getEspnLogo('nfl', 'sea'),
    'Tampa Bay Buccaneers': getEspnLogo('nfl', 'tb'),
    'Tennessee Titans': getEspnLogo('nfl', 'ten'),
    'Washington Commanders': getEspnLogo('nfl', 'wsh'),

    // NBA
    'Atlanta Hawks': getEspnLogo('nba', 'atl'),
    'Boston Celtics': getEspnLogo('nba', 'bos'),
    'Brooklyn Nets': getEspnLogo('nba', 'bkn'),
    'Charlotte Hornets': getEspnLogo('nba', 'cha'),
    'Chicago Bulls': getEspnLogo('nba', 'chi'),
    'Cleveland Cavaliers': getEspnLogo('nba', 'cle'),
    'Dallas Mavericks': getEspnLogo('nba', 'dal'),
    'Denver Nuggets': getEspnLogo('nba', 'den'),
    'Detroit Pistons': getEspnLogo('nba', 'det'),
    'Golden State Warriors': getEspnLogo('nba', 'gs'),
    'Houston Rockets': getEspnLogo('nba', 'hou'),
    'Indiana Pacers': getEspnLogo('nba', 'ind'),
    'Los Angeles Clippers': getEspnLogo('nba', 'lac'),
    'Los Angeles Lakers': getEspnLogo('nba', 'lal'),
    'Memphis Grizzlies': getEspnLogo('nba', 'mem'),
    'Miami Heat': getEspnLogo('nba', 'mia'),
    'Milwaukee Bucks': getEspnLogo('nba', 'mil'),
    'Minnesota Timberwolves': getEspnLogo('nba', 'min'),
    'New Orleans Pelicans': getEspnLogo('nba', 'no'),
    'New York Knicks': getEspnLogo('nba', 'ny'),
    'Oklahoma City Thunder': getEspnLogo('nba', 'okc'),
    'Orlando Magic': getEspnLogo('nba', 'orl'),
    'Philadelphia 76ers': getEspnLogo('nba', 'phi'),
    'Phoenix Suns': getEspnLogo('nba', 'phx'),
    'Portland Trail Blazers': getEspnLogo('nba', 'por'),
    'Sacramento Kings': getEspnLogo('nba', 'sac'),
    'San Antonio Spurs': getEspnLogo('nba', 'sa'),
    'Toronto Raptors': getEspnLogo('nba', 'tor'),
    'Utah Jazz': getEspnLogo('nba', 'utah'),
    'Washington Wizards': getEspnLogo('nba', 'wsh'),

    // NHL
    'Anaheim Ducks': getEspnLogo('nhl', 'ana'),
    'Arizona Coyotes': getEspnLogo('nhl', 'ari'),
    'Boston Bruins': getEspnLogo('nhl', 'bos'),
    'Buffalo Sabres': getEspnLogo('nhl', 'buf'),
    'Calgary Flames': getEspnLogo('nhl', 'cgy'),
    'Carolina Hurricanes': getEspnLogo('nhl', 'car'),
    'Chicago Blackhawks': getEspnLogo('nhl', 'chi'),
    'Colorado Avalanche': getEspnLogo('nhl', 'col'),
    'Columbus Blue Jackets': getEspnLogo('nhl', 'cbj'),
    'Dallas Stars': getEspnLogo('nhl', 'dal'),
    'Detroit Red Wings': getEspnLogo('nhl', 'det'),
    'Edmonton Oilers': getEspnLogo('nhl', 'edm'),
    'Florida Panthers': getEspnLogo('nhl', 'fla'),
    'Los Angeles Kings': getEspnLogo('nhl', 'la'),
    'Minnesota Wild': getEspnLogo('nhl', 'min'),
    'Montreal Canadiens': getEspnLogo('nhl', 'mtl'),
    'Nashville Predators': getEspnLogo('nhl', 'nsh'),
    'New Jersey Devils': getEspnLogo('nhl', 'nj'),
    'New York Islanders': getEspnLogo('nhl', 'nyi'),
    'New York Rangers': getEspnLogo('nhl', 'nyr'),
    'Ottawa Senators': getEspnLogo('nhl', 'ott'),
    'Philadelphia Flyers': getEspnLogo('nhl', 'phi'),
    'Pittsburgh Penguins': getEspnLogo('nhl', 'pit'),
    'San Jose Sharks': getEspnLogo('nhl', 'sj'),
    'Seattle Kraken': getEspnLogo('nhl', 'sea'),
    'St. Louis Blues': getEspnLogo('nhl', 'stl'),
    'Tampa Bay Lightning': getEspnLogo('nhl', 'tb'),
    'Toronto Maple Leafs': getEspnLogo('nhl', 'tor'),
    'Vancouver Canucks': getEspnLogo('nhl', 'van'),
    'Vegas Golden Knights': getEspnLogo('nhl', 'vgk'),
    'Washington Capitals': getEspnLogo('nhl', 'wsh'),
    'Winnipeg Jets': getEspnLogo('nhl', 'wpg'),
    'Utah Hockey Club': getEspnLogo('nhl', 'utah'),

    // MLB
    'Arizona Diamondbacks': getEspnLogo('mlb', 'ari'),
    'Atlanta Braves': getEspnLogo('mlb', 'atl'),
    'Baltimore Orioles': getEspnLogo('mlb', 'bal'),
    'Boston Red Sox': getEspnLogo('mlb', 'bos'),
    'Chicago White Sox': getEspnLogo('mlb', 'chw'),
    'Chicago Cubs': getEspnLogo('mlb', 'chc'),
    'Cincinnati Reds': getEspnLogo('mlb', 'cin'),
    'Cleveland Guardians': getEspnLogo('mlb', 'cle'),
    'Colorado Rockies': getEspnLogo('mlb', 'col'),
    'Detroit Tigers': getEspnLogo('mlb', 'det'),
    'Houston Astros': getEspnLogo('mlb', 'hou'),
    'Kansas City Royals': getEspnLogo('mlb', 'kc'),
    'Los Angeles Angels': getEspnLogo('mlb', 'laa'),
    'Los Angeles Dodgers': getEspnLogo('mlb', 'lad'),
    'Miami Marlins': getEspnLogo('mlb', 'mia'),
    'Milwaukee Brewers': getEspnLogo('mlb', 'mil'),
    'Minnesota Twins': getEspnLogo('mlb', 'min'),
    'New York Yankees': getEspnLogo('mlb', 'nyy'),
    'New York Mets': getEspnLogo('mlb', 'nym'),
    'Oakland Athletics': getEspnLogo('mlb', 'oak'),
    'Philadelphia Phillies': getEspnLogo('mlb', 'phi'),
    'Pittsburgh Pirates': getEspnLogo('mlb', 'pit'),
    'San Diego Padres': getEspnLogo('mlb', 'sd'),
    'San Francisco Giants': getEspnLogo('mlb', 'sf'),
    'Seattle Mariners': getEspnLogo('mlb', 'sea'),
    'St. Louis Cardinals': getEspnLogo('mlb', 'stl'),
    'Tampa Bay Rays': getEspnLogo('mlb', 'tb'),
    'Texas Rangers': getEspnLogo('mlb', 'tex'),
    'Toronto Blue Jays': getEspnLogo('mlb', 'tor'),
    'Washington Nationals': getEspnLogo('mlb', 'wsh'),
};

/**
 * Returns the logo URL for a given team name.
 * If no logo is found, returns null.
 * @param {string} teamName 
 * @returns {string|null}
 */
export const getTeamLogo = (teamName) => {
    if (!teamName) return null;
    return TEAM_LOGOS[teamName] || null;
};
