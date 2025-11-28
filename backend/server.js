const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not defined. Data will not persist!');
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ Connected to MongoDB'))
        .catch(err => console.error('❌ MongoDB connection error:', err));
}

// --- Schemas ---
const UserSchema = new mongoose.Schema({
    uuid: { type: String, required: true, unique: true },
    username: String,
    idName: String,
    email: { type: String, required: true, unique: true },
    tokens: { type: Number, default: 100 },
    crowns: { type: Number, default: 0 },
    isRegistered: { type: Boolean, default: true },
    badges: [String]
});

const EventSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    homeTeam: String,
    awayTeam: String,
    league: String,
    startTime: Date,
    sport: String,
    updatedAt: { type: Date, default: Date.now }
});

const PredictionSchema = new mongoose.Schema({
    id: { type: Number, required: true }, // Keeping timestamp ID for compatibility
    userId: String,
    eventId: String,
    predictedWinner: String,
    predictedScores: [Number],
    timestamp: Date,
    resolved: { type: Boolean, default: false },
    result: {
        won: Boolean,
        exactScore: Boolean,
        tokensWon: Number,
        crownsWon: Number
    }
});

const ChatSchema = new mongoose.Schema({
    id: Number,
    sender_name: String,
    sender_id: String,
    message: String,
    sender_badges: [String],
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Event = mongoose.model('Event', EventSchema);
const Prediction = mongoose.model('Prediction', PredictionSchema);
const Chat = mongoose.model('Chat', ChatSchema);

// --- Constants ---
const API_KEY = process.env.THE_ODDS_API_KEY;
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes cache
let lastFetch = 0;

const SPORTS = [
    'americanfootball_nfl',
    'basketball_nba',
    'baseball_mlb',
    'icehockey_nhl',
    'soccer_epl',
    'soccer_usa_mls'
];

const SPORT_LABELS = {
    'americanfootball_nfl': 'NFL',
    'basketball_nba': 'NBA',
    'baseball_mlb': 'MLB',
    'icehockey_nhl': 'NHL',
    'soccer_epl': 'EPL',
    'soccer_usa_mls': 'MLS'
};

// --- Helper Functions ---

async function fetchRealEvents() {
    const now = Date.now();

    // 1. Try to get cached events from DB first
    // We check if we have recent events in DB
    const recentEvent = await Event.findOne().sort({ updatedAt: -1 });

    if (recentEvent && (now - recentEvent.updatedAt.getTime()) < CACHE_DURATION) {
        console.log('📦 Returning cached events from MongoDB');
        return await Event.find({});
    }

    console.log('🔄 Fetching fresh events from The Odds API...');

    if (!API_KEY || API_KEY === 'your_api_key_here') {
        console.warn('⚠️ No API key configured, using mock data');
        return getMockEvents();
    }

    try {
        const requests = SPORTS.map(sport =>
            axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/odds`, {
                params: {
                    apiKey: API_KEY,
                    regions: 'us',
                    markets: 'h2h',
                    oddsFormat: 'american'
                }
            }).catch(err => {
                console.error(`Error fetching ${sport}:`, err.message);
                return { data: [] };
            })
        );

        const responses = await Promise.all(requests);
        const operations = [];

        responses.forEach((response, index) => {
            const sport = SPORTS[index];
            const games = response.data;

            if (Array.isArray(games)) {
                games.forEach(game => {
                    operations.push({
                        updateOne: {
                            filter: { id: game.id },
                            update: {
                                $set: {
                                    homeTeam: game.home_team,
                                    awayTeam: game.away_team,
                                    league: SPORT_LABELS[sport],
                                    startTime: game.commence_time,
                                    sport: sport,
                                    updatedAt: new Date()
                                }
                            },
                            upsert: true
                        }
                    });
                });
            }
        });

        if (operations.length > 0) {
            await Event.bulkWrite(operations);
            console.log(`✅ Upserted ${operations.length} events to MongoDB`);
        }

        return await Event.find({});

    } catch (error) {
        console.error('❌ Error fetching events:', error.message);
        // Fallback to whatever is in DB
        const dbEvents = await Event.find({});
        if (dbEvents.length > 0) return dbEvents;
        return getMockEvents();
    }
}

function getMockEvents() {
    return [
        {
            id: '1',
            homeTeam: 'Lakers',
            awayTeam: 'Warriors',
            league: 'NBA',
            startTime: new Date(Date.now() + 3600000).toISOString(),
            sport: 'basketball'
        },
        {
            id: '2',
            homeTeam: 'Chiefs',
            awayTeam: 'Bills',
            league: 'NFL',
            startTime: new Date(Date.now() + 7200000).toISOString(),
            sport: 'football'
        },
        {
            id: '3',
            homeTeam: 'Man City',
            awayTeam: 'Arsenal',
            league: 'EPL',
            startTime: new Date(Date.now() + 86400000).toISOString(),
            sport: 'soccer'
        }
    ];
}

// --- Endpoints ---

app.post('/api/login', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                uuid: `user-${Date.now()}`,
                username: email.split('@')[0],
                idName: email.split('@')[0],
                email: email,
                tokens: 100,
                crowns: 0,
                isRegistered: true,
                badges: []
            });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { email, username } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.json({ user }); // Already exists
        }

        user = await User.create({
            uuid: `user-${Date.now()}`,
            username: username || email.split('@')[0],
            idName: username || email.split('@')[0],
            email: email,
            tokens: 50,
            crowns: 0,
            isRegistered: true,
            badges: []
        });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const events = await fetchRealEvents();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/chat', async (req, res) => {
    try {
        const messages = await Chat.find().sort({ timestamp: -1 }).limit(50);
        res.json(messages.reverse()); // Return oldest first for UI
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    const { sender_name, sender_id, message, sender_badges } = req.body;
    try {
        const newMessage = await Chat.create({
            id: Date.now(),
            sender_name,
            sender_id,
            message,
            sender_badges: sender_badges || [],
            timestamp: new Date()
        });
        res.json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/predictions', async (req, res) => {
    const { userId, eventId, predictedWinner, predictedScores } = req.body;
    try {
        // Deduct tokens
        const user = await User.findOne({ uuid: userId });
        if (!user || user.tokens < 10) {
            return res.status(400).json({ error: 'Insufficient tokens' });
        }

        await User.updateOne({ uuid: userId }, { $inc: { tokens: -10 } });

        const prediction = await Prediction.create({
            id: Date.now(),
            userId,
            eventId,
            predictedWinner,
            predictedScores,
            timestamp: new Date()
        });

        res.json({ success: true, prediction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/resolve-game', async (req, res) => {
    const { eventId, homeScore, awayScore, winningTeam } = req.body;

    try {
        const predictions = await Prediction.find({ eventId, resolved: false });
        let resolvedCount = 0;
        let winnersCount = 0;
        let exactScoreCount = 0;

        for (const prediction of predictions) {
            let won = false;
            let exactScore = false;
            let tokensWon = 0;
            let crownsWon = 0;

            // 1. Check Winner
            if (prediction.predictedWinner === winningTeam) {
                won = true;
                tokensWon = 20;
                winnersCount++;
            }

            // 2. Check Exact Score
            if (prediction.predictedScores &&
                prediction.predictedScores[0] === parseInt(homeScore) &&
                prediction.predictedScores[1] === parseInt(awayScore)) {
                exactScore = true;
                crownsWon = 1;
                exactScoreCount++;
            }

            // Update Prediction
            prediction.resolved = true;
            prediction.result = { won, exactScore, tokensWon, crownsWon };
            await prediction.save();

            // Update User
            if (tokensWon > 0 || crownsWon > 0) {
                await User.updateOne(
                    { uuid: prediction.userId },
                    { $inc: { tokens: tokensWon, crowns: crownsWon } }
                );
            }
            resolvedCount++;
        }

        res.json({
            success: true,
            message: `Resolved ${resolvedCount} predictions`,
            stats: {
                winners: winnersCount,
                exactScores: exactScoreCount
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Weekly Draw ---
const WeeklyDrawSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const WeeklyDraw = mongoose.model('WeeklyDraw', WeeklyDrawSchema);

app.post('/api/weekly-draw/enter', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findOne({ uuid: userId });
        if (!user || user.crowns < 1) {
            return res.status(400).json({ error: 'Insufficient crowns' });
        }

        // Deduct 1 crown
        await User.updateOne({ uuid: userId }, { $inc: { crowns: -1 } });

        // Create entry
        await WeeklyDraw.create({
            userId,
            timestamp: new Date()
        });

        res.json({ success: true, message: 'Entered weekly draw!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/weekly-draw/stats', async (req, res) => {
    try {
        const count = await WeeklyDraw.countDocuments();
        res.json({ totalEntries: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Mobile backend running on http://localhost:${PORT}`);
});
