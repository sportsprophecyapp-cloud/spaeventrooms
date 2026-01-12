-- Create sponsor_analytics table for tracking impressions and clicks
CREATE TABLE IF NOT EXISTS sponsor_analytics (
    id SERIAL PRIMARY KEY,
    sponsor_id INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('impression', 'click')),
    room_id VARCHAR(100),
    match_id VARCHAR(100),
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sponsor_analytics_sponsor_id ON sponsor_analytics(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_analytics_event_type ON sponsor_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_sponsor_analytics_created_at ON sponsor_analytics(created_at);
