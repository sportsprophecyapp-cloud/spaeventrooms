const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
// require('dotenv').config(); // Not needed in Vercel production

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
    origin: '*',
}));

app.use(express.json());

// --- MongoDB Connection ---
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is not defined in environment variables');
        throw new Error('MONGODB_URI is not defined');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB connected successfully');
            return mongoose;
        }).catch(err => {
            console.error('❌ MongoDB connection error:', err);
            throw err;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}

// --- Schemas ---
const UserSchema = new mongoose.Schema({
    uuid: { type: String, required: true, unique: true },
    username: String,
    idName: String,
    email: { type: String, required: true, unique: true },
    tokens: { type: Number, default: 50 },
    crowns: { type: Number, default: 5 },
    isRegistered: { type: Boolean, default: true },
    badges: [String],
    lastLoginReward: { type: Date, default: null },
    loginStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date, default: null },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    referralCount: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    isBanned: { type: Boolean, default: false }
});

const EventSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    homeTeam: String,
    awayTeam: String,
    league: String,
    startTime: Date,
    sport: String,
    updatedAt: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false },
    finalScore: {
        home: { type: Number, default: null },
        away: { type: Number, default: null }
    },
    winner: { type: String, default: null },
    completedAt: { type: Date, default: null }
});

const PredictionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
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
    sender_name: String,
    sender_id: String,
    message: String,
    sender_badges: [String],
    timestamp: { type: Date, default: Date.now }
});

const DrawEntrySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    drawId: { type: String, required: true },
    enteredAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
const Prediction = mongoose.models.Prediction || mongoose.model('Prediction', PredictionSchema);
const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
const DrawEntry = mongoose.models.DrawEntry || mongoose.model('DrawEntry', DrawEntrySchema);

// --- Constants ---
const THE_ODDS_API_KEY = process.env.THE_ODDS_API_KEY;
const API_KEY = THE_ODDS_API_KEY;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours cache

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
    await dbConnect();
    const now = Date.now();

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
                },
                timeout: 8000
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
            sport: 'basketball_nba'
        },
        {
            id: '2',
            homeTeam: 'Chiefs',
            awayTeam: 'Bills',
            league: 'NFL',
            startTime: new Date(Date.now() + 7200000).toISOString(),
            sport: 'americanfootball_nfl'
        },
        {
            id: '3',
            homeTeam: 'Man City',
            awayTeam: 'Arsenal',
            league: 'EPL',
            startTime: new Date(Date.now() + 86400000).toISOString(),
            sport: 'soccer_epl'
        }
    ];
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

// --- Routes ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), nodeVersion: process.version });
});

app.post('/api/login', async (req, res) => {
    try {
        await dbConnect();
        const { email } = req.body;
        let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (!user) {
            user = await User.create({
                uuid: `user-${Date.now()}`,
                username: email.split('@')[0],
                idName: email.split('@')[0],
                email: email,
                tokens: 50,
                crowns: 5,
                isRegistered: true,
                badges: []
            });
        }
        res.json({ user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        await dbConnect();
        const { email, username } = req.body;
        let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (user) {
            return res.json({ user });
        }

        user = await User.create({
            uuid: `user-${Date.now()}`,
            username: username || email.split('@')[0],
            idName: username || email.split('@')[0],
            email: email,
            tokens: 50,
            crowns: 5,
            isRegistered: true,
            badges: []
        });
        res.json({ user });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/user/:userId', async (req, res) => {
    try {
        await dbConnect();
        const { userId } = req.params;
        const user = await User.findOne({ uuid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const events = await fetchRealEvents();
        res.json(events);
    } catch (error) {
        console.error('Events error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/chat', async (req, res) => {
    try {
        await dbConnect();
        const messages = await Chat.find().sort({ timestamp: -1 }).limit(50);
        res.json(messages.reverse());
    } catch (error) {
        console.error('Chat get error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        await dbConnect();
        const { sender_name, sender_id, message, sender_badges } = req.body;
        const newMessage = await Chat.create({
            sender_name,
            sender_id,
            message,
            sender_badges: sender_badges || [],
            timestamp: new Date()
        });
        res.json(newMessage);
    } catch (error) {
        console.error('Chat post error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/predictions', async (req, res) => {
    try {
        await dbConnect();
        const { userId, eventId, predictedWinner, predictedScores } = req.body;
        
        const user = await User.findOne({ uuid: userId });
        if (!user || user.tokens < 1) {
            return res.status(400).json({ error: 'Insufficient tokens' });
        }

        await User.updateOne({ uuid: userId }, { $inc: { tokens: -1 } });

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
        console.error('Prediction error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/predictions/:userId', async (req, res) => {
    try {
        await dbConnect();
        const { userId } = req.params;
        const predictions = await Prediction.find({ userId });
        res.json(predictions);
    } catch (error) {
        console.error('Get predictions error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/weekly-draw/enter', async (req, res) => {
    try {
        await dbConnect();
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await User.findOne({ uuid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.crowns < 1) {
            return res.status(400).json({ error: 'Not enough crowns' });
        }

        user.crowns -= 1;
        await user.save();

        const drawId = `weekly-draw-${new Date().getFullYear()}-W${getWeekNumber(new Date())}`;
        await DrawEntry.create({
            userId,
            drawId
        });

        res.json({
            success: true,
            crowns: user.crowns,
            message: 'Successfully entered draw'
        });

    } catch (error) {
        console.error('Draw entry error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/weekly-draw/stats', async (req, res) => {
    try {
        await dbConnect();
        const totalEntries = await DrawEntry.countDocuments();
        res.json({ totalEntries });
    } catch (error) {
        console.error('Draw stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/daily-login-reward', async (req, res) => {
    try {
        await dbConnect();
        const { userId } = req.body;
        const user = await User.findOne({ uuid: userId });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const now = new Date();
        const lastLogin = user.lastLoginReward ? new Date(user.lastLoginReward) : null;
        const canClaim = !lastLogin || (now - lastLogin) > 24 * 60 * 60 * 1000;

        if (canClaim) {
            user.tokens += 3;
            user.lastLoginReward = now;
            await user.save();
            res.json({ canClaim: true, claimed: true, tokens: user.tokens });
        } else {
            res.json({ canClaim: false, claimed: false });
        }
    } catch (error) {
        console.error('Daily login error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        await dbConnect();
        const users = await User.find({}).sort({ tokens: -1 }).limit(100);
        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.idName || user.username,
            tokens: user.tokens,
            crowns: user.crowns
        }));
        res.json({ leaderboard });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Conditional app.listen for local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Mobile backend running on http://localhost:${PORT}`);
    });
}

module.exports = app;
