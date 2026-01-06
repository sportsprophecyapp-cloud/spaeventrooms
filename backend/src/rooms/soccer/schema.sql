CREATE TABLE IF NOT EXISTS soccer_matches (
    match_id VARCHAR(100) PRIMARY KEY,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50), -- scheduled, live, finished
    league VARCHAR(100),
    league_logo VARCHAR(255),
    score_home INT,
    score_away INT,
    data JSONB -- full match data from API
);

CREATE TABLE IF NOT EXISTS soccer_predictions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    match_id VARCHAR(100) REFERENCES soccer_matches(match_id),
    prediction_data JSONB NOT NULL,
    points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, match_id)
);

CREATE TABLE IF NOT EXISTS soccer_leaderboards (
    user_id INT REFERENCES users(id),
    period VARCHAR(20) DEFAULT 'season', -- weekly, season
    points INT DEFAULT 0,
    rank INT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, period)
);

CREATE TABLE IF NOT EXISTS soccer_sponsors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    branding_assets JSONB,
    active BOOLEAN DEFAULT TRUE
);
