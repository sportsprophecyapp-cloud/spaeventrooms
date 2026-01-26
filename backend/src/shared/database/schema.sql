CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_muted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    room_id VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE
);

-- Soccer Room Tables
CREATE TABLE IF NOT EXISTS soccer_matches (
    match_id VARCHAR(50) PRIMARY KEY,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    score_home INTEGER DEFAULT 0,
    score_away INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS soccer_predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    match_id VARCHAR(50) REFERENCES soccer_matches(match_id),
    prediction_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, match_id)
);

-- Announcement System
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) REFERENCES rooms(room_id),
    type VARCHAR(50), -- 'live', 'scheduled', 'general', 'sponsor'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_draft BOOLEAN DEFAULT true,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Sponsor System
CREATE TABLE IF NOT EXISTS room_sponsors (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) REFERENCES rooms(room_id),
    sponsor_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    prize_description TEXT,
    primary_color VARCHAR(7), -- hex color
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom Polls/Predictions
CREATE TABLE IF NOT EXISTS custom_predictions (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) REFERENCES rooms(room_id),
    question VARCHAR(255) NOT NULL,
    options JSONB NOT NULL, -- ["Option 1", "Option 2"]
    correct_answer VARCHAR(255),
    closes_at TIMESTAMP WITH TIME ZONE,
    revealed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS prediction_submissions (
    id SERIAL PRIMARY KEY,
    prediction_id INTEGER REFERENCES custom_predictions(id),
    user_id INTEGER REFERENCES users(id),
    selected_option VARCHAR(255) NOT NULL,
    is_correct BOOLEAN,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(prediction_id, user_id)
);
