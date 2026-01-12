-- Add Gamification Columns to Users
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_balance INTEGER DEFAULT 150;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;

-- Streaks Table
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    current_streak INTEGER DEFAULT 0,
    last_login_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cosmetics Table
CREATE TABLE IF NOT EXISTS cosmetics (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'avatar', 'frame', 'badge', 'background'
    cost INTEGER NOT NULL,
    asset_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Inventory
CREATE TABLE IF NOT EXISTS user_cosmetics (
    user_id INTEGER REFERENCES users(id),
    cosmetic_id VARCHAR(50) REFERENCES cosmetics(id),
    is_equipped BOOLEAN DEFAULT false,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, cosmetic_id)
);

-- Token Transaction Log
CREATE TABLE IF NOT EXISTS token_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount INTEGER NOT NULL,
    type VARCHAR(50), -- 'daily_login', 'purchase', 'referral', 'prediction'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update soccer_matches to include more metadata
ALTER TABLE soccer_matches ADD COLUMN IF NOT EXISTS league VARCHAR(100);
ALTER TABLE soccer_matches ADD COLUMN IF NOT EXISTS league_logo TEXT;
ALTER TABLE soccer_matches ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
