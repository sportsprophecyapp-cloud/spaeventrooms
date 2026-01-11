-- Global Room Chat Messages
CREATE TABLE IF NOT EXISTS room_messages (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL REFERENCES rooms(room_id),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50), -- Denormalized for speed
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast retrieval of latest messages in a room
CREATE INDEX IF NOT EXISTS idx_room_messages_room_id ON room_messages(room_id);
