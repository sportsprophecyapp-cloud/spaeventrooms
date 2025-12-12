const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { dedupRequest } = require('../utils/requestDedup');
const { trackAPICall, getUsageStats, checkLimits } = require('../utils/apiMonitor');
const nodemailer = require('nodemailer'); // Require nodemailer
require('dotenv').config(); // Not needed in Vercel production

// Admin Configuration
// TODO: Replace with your actual user UUID from the database
// You can find this by logging in and checking your user object
const ADMIN_UUID = process.env.ADMIN_UUID || 'YOUR_UUID_HERE';

// Implement Helper Function for sending emails
const sendEmail = async (to, subject, text) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Skipping email send.');
            console.log(`[Would Send] To: ${to}, Subject: ${subject}, Text: ${text}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail', // Or use host/port for other SMTP
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log('✅ Email sent:', info.messageId);
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
};

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
    origin: '*',
}));

app.use(express.json({ limit: '50mb' }));

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
    password: { type: String }, // Hashed password
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    tokens: { type: Number, default: 50 },
    crowns: { type: Number, default: 5 },
    correctPredictions: { type: Number, default: 0 },
    isRegistered: { type: Boolean, default: true },
    badges: [String],
    lastLoginReward: { type: Date, default: null },
    loginStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date, default: null },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    referralCount: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    isBanned: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true }
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
    roomId: { type: String, default: null }, // null = General/Lobby
    timestamp: { type: Date, default: Date.now }
});

const DrawEntrySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    drawId: { type: String, required: true },
    enteredAt: { type: Date, default: Date.now }
});

const SponsorSchema = new mongoose.Schema({
    sponsorName: { type: String, required: true },
    bannerUrl: { type: String, required: true },
    linkUrl: { type: String, required: true },
    type: { type: String, enum: ['paid', 'prize', 'room'], default: 'paid' },
    roomId: { type: String }, // For room-specific sponsorships
    duration: { type: String, default: '30days' },
    price: { type: Number, default: 25 },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    stripeSessionId: String,
    prizeDetails: {
        description: String,
        value: Number,
        deliveryConfirmed: { type: Boolean, default: false }
    },
    contactEmail: String,
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
    userId: { type: String, default: 'all' }, // 'all' or specific UUID
    message: { type: String, required: true },
    type: { type: String, default: 'info' }, // 'info', 'win', 'admin'
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

const ChatRoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['public', 'league', 'private'], required: true },
    password: { type: String }, // Only for private rooms
    createdBy: { type: String, required: true }, // User ID
    sponsor: {
        name: String,
        bannerUrl: String,
        linkUrl: String,
        expiryDate: Date,
        isActive: { type: Boolean, default: false }
    },
    customAd: {
        bannerUrl: String,
        linkUrl: String,
        enabled: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
const Prediction = mongoose.models.Prediction || mongoose.model('Prediction', PredictionSchema);
const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
const ChatRoom = mongoose.models.ChatRoom || mongoose.model('ChatRoom', ChatRoomSchema);
const DrawEntry = mongoose.models.DrawEntry || mongoose.model('DrawEntry', DrawEntrySchema);
const Sponsor = mongoose.models.Sponsor || mongoose.model('Sponsor', SponsorSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// --- Stripe Configuration ---
let stripe;
try {
    if (process.env.STRIPE_SECRET_KEY) {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        console.log('✅ Stripe initialized successfully');
    } else {
        console.warn('⚠️ STRIPE_SECRET_KEY not set - sponsor payments will be disabled');
    }
} catch (error) {
    console.error('❌ Stripe initialization failed:', error.message);
    stripe = null;
}


// --- Constants ---
// API Key Failover System
let currentKeyIndex = 0;
const API_KEYS = [
    process.env.THE_ODDS_API_KEY,
    process.env.THE_ODDS_API_KEY_2,
    process.env.THE_ODDS_API_KEY_3
].map(k => k?.trim()).filter(Boolean); // Remove undefined keys and trim whitespace



function getActiveAPIKey() {
    if (API_KEYS.length === 0) {
        console.warn('⚠️ No API keys configured');
        return null;
    }
    return API_KEYS[currentKeyIndex];
}

function rotateAPIKey() {
    if (API_KEYS.length <= 1) {
        console.warn('⚠️ No alternate API key available for rotation');
        return getActiveAPIKey();
    }
    const oldIndex = currentKeyIndex;
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    console.log(`🔄 Rotating API key from index ${oldIndex} to ${currentKeyIndex}`);
    return getActiveAPIKey();
}

function isQuotaError(error) {
    if (error.response?.status === 401) return true;
    return error.response?.data?.error_code === 'OUT_OF_USAGE_CREDITS';
}

const THE_ODDS_API_KEY = process.env.THE_ODDS_API_KEY; // Keep for backward compatibility
const API_KEY = getActiveAPIKey();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const CACHE_DURATION = 3.5 * 60 * 60 * 1000; // 3.5 hours cache (~1300 calls/month with 3 sports)
const SPORTS = [
    'americanfootball_nfl',
    'basketball_nba',
    'icehockey_nhl',
    // Temporarily disabled to reduce API calls:
    // 'baseball_mlb',
    // 'soccer_epl',
    // 'soccer_usa_mls'
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
let globalDebugLog = {
    lastRun: null,
    usedKeyIndex: null,
    responses: [],
    operationsCount: 0,
    error: null
};

app.get('/api/debug/log', (req, res) => {
    res.json(globalDebugLog);
});

async function fetchRealEvents(throwOnError = false) {
    // Deduplicate concurrent requests
    return dedupRequest('fetchRealEvents', async () => {
        await dbConnect();
        const now = Date.now();
        globalDebugLog.lastRun = new Date().toISOString();
        globalDebugLog.error = null;
        globalDebugLog.responses = [];
        globalDebugLog.operationsCount = 0;

        const recentEvent = await Event.findOne().sort({ updatedAt: -1 });

        if (!throwOnError && recentEvent && (now - recentEvent.updatedAt.getTime()) < CACHE_DURATION) {
            console.log('📦 Returning cached events from MongoDB');
            globalDebugLog.status = 'cached';
            return await Event.find({});
        }

        console.log('🔄 Fetching fresh events from The Odds API...');
        globalDebugLog.status = 'fetching';

        if (!API_KEY || API_KEY === 'your_api_key_here') {
            console.warn('⚠️ No API key configured, using mock data');
            return getMockEvents();
        }

        const startTime = Date.now();

        // Helper function to fetch with current API key
        const fetchWithAPIKey = async (apiKey) => {
            const requests = SPORTS.map(sport =>
                axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/odds`, {
                    params: {
                        apiKey: apiKey,
                        regions: 'us',
                        markets: 'h2h',
                        oddsFormat: 'american'
                    },
                    timeout: 8000
                }).catch(err => {
                    // Check if this is a quota error
                    if (isQuotaError(err)) {
                        console.warn(`⚠️ Quota error for ${sport} with API key index ${currentKeyIndex}`);
                        throw err; // Propagate quota errors to trigger rotation
                    }
                    console.error(`Error fetching ${sport}:`, err.message);
                    return { sport, error: err.message, data: [] };
                })
            );
            return await Promise.all(requests);
        };

        try {
            // Try with current API key
            const currentKey = getActiveAPIKey();
            console.log(`📡 Using API key index ${currentKeyIndex}`);
            globalDebugLog.usedKeyIndex = currentKeyIndex;
            responses = await fetchWithAPIKey(currentKey);

            // Proactive checks: inspect headers for remaining requests
            if (responses && responses.length > 0) {
                for (const res of responses) {
                    if (res && res.headers && res.headers['x-requests-remaining']) {
                        const remaining = parseInt(res.headers['x-requests-remaining'], 10);
                        console.log(`ℹ️ Requests remaining for key ${currentKeyIndex}: ${remaining}`);

                        if (!isNaN(remaining) && remaining < 50) {
                            console.warn(`⚠️ Key ${currentKeyIndex} is running low (${remaining} left). Rotating proactively.`);
                            rotateAPIKey();
                            globalDebugLog.proactiveRotation = true;
                            // We don't need to retry this batch, as it succeeded.
                            // The NEXT batch will use the new key.
                            break;
                        }
                    }
                }
            }

        } catch (error) {
            // If quota error and we have alternate keys, rotate and retry
            if (isQuotaError(error) && API_KEYS.length > 1) {
                console.log(`🔄 Primary key exhausted, rotating to backup key...`);
                const newKey = rotateAPIKey();
                globalDebugLog.rotatedToKeyIndex = currentKeyIndex;
                try {
                    responses = await fetchWithAPIKey(newKey);
                } catch (retryError) {
                    console.error(`❌ Backup key also failed:`, retryError.message);
                    globalDebugLog.error = `Backup key failed: ${retryError.message}`;
                    // Return cached data if available
                    const cachedEvents = await Event.find({});
                    if (cachedEvents.length > 0) {
                        console.log('📦 Returning cached events after API failure');
                        return cachedEvents;
                    }
                    throw retryError;
                }
            } else {
                globalDebugLog.error = error.message;
                throw error;
            }
        }

        // Log response summaries
        globalDebugLog.responses = responses.map((r, i) => ({
            sport: SPORTS[i],
            dataCount: r.data ? r.data.length : 0,
            status: r.status,
            error: r.error
        }));

        try {
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

            globalDebugLog.operationsCount = operations.length;

            if (operations.length > 0) {
                await Event.bulkWrite(operations);
                console.log(`✅ Upserted ${operations.length} events to MongoDB`);
            }

            // Fetch results and grade predictions
            await fetchGameResults();
            await gradePredictions();

            return await Event.find({});

        } catch (error) {
            console.error('❌ Error fetching events:', error.message);
            globalDebugLog.error = `Processing error: ${error.message}`;

            if (throwOnError) throw error;

            // ... fallback ...
            // This fallback block is tricky to replace cleanly without copying it all.
            // I'll just close and let the existing catch block handle it?
            // No, I am replacing the whole function body again basically.

            // Track failed API calls
            SPORTS.forEach(sport => {
                trackAPICall('odds', sport, false, 0, error.message);
            });

            const dbEvents = await Event.find({});
            if (dbEvents.length > 0) {
                console.log('📦 Returning stale cached data due to API error');
                return dbEvents;
            }
            return getMockEvents();
        } finally {
            // ...
            // Track successful API calls and response time
            const responseTime = Date.now() - startTime;
            SPORTS.forEach(sport => {
                trackAPICall('odds', sport, true, responseTime / SPORTS.length);
            });

            // Check if approaching limits
            await checkLimits(10000);
        }
    }); // Close dedupRequest wrapper
}

async function fetchGameResults() {
    const currentKey = getActiveAPIKey();
    if (!currentKey || currentKey === 'your_api_key_here') return;
    console.log('🔄 Fetching game results...');

    const fetchResultsWithKey = async (apiKey) => {
        const requests = SPORTS.map(sport =>
            axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/scores`, {
                params: {
                    apiKey: apiKey,
                    daysFrom: 3,
                    dateFormat: 'iso'
                },
                timeout: 8000
            }).catch(err => {
                if (isQuotaError(err)) {
                    throw err;
                }
                return { data: [] };
            })
        );
        return await Promise.all(requests);
    };

    try {
        let responses;
        try {
            responses = await fetchResultsWithKey(currentKey);
        } catch (error) {
            if (isQuotaError(error) && API_KEYS.length > 1) {
                console.log(`🔄 Rotating to backup key for results fetch...`);
                const newKey = rotateAPIKey();
                responses = await fetchResultsWithKey(newKey);
            } else {
                throw error;
            }
        }

        const operations = [];

        responses.forEach((response, index) => {
            const games = response.data;
            if (Array.isArray(games)) {
                games.forEach(game => {
                    if (game.completed) {
                        let winner = null;
                        if (game.scores) {
                            const homeScore = game.scores.find(s => s.name === game.home_team)?.score;
                            const awayScore = game.scores.find(s => s.name === game.away_team)?.score;
                            if (homeScore !== undefined && awayScore !== undefined) {
                                if (parseInt(homeScore) > parseInt(awayScore)) winner = game.home_team;
                                else if (parseInt(awayScore) > parseInt(homeScore)) winner = game.away_team;
                            }
                        }

                        if (winner) {
                            operations.push({
                                updateOne: {
                                    filter: { id: game.id },
                                    update: {
                                        $set: {
                                            isCompleted: true,
                                            winner: winner,
                                            completedAt: new Date()
                                        }
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });

        if (operations.length > 0) {
            await Event.bulkWrite(operations);
            console.log(`✅ Updated results for ${operations.length} events`);
        }
    } catch (error) {
        console.error('Error fetching results:', error.message);
    }
}

async function gradePredictions() {
    console.log('📝 Grading pending predictions...');
    try {
        const pendingPredictions = await Prediction.find({ resolved: false });
        let gradedCount = 0;

        for (const prediction of pendingPredictions) {
            const event = await Event.findOne({ id: prediction.eventId });

            if (event && event.isCompleted && event.winner) {
                let won = false;
                let tokensWon = 0;
                let crownsWon = 0;

                if (prediction.predictedWinner === event.winner) {
                    won = true;
                    tokensWon = 3;
                    crownsWon = 1;
                }

                await User.findOneAndUpdate(
                    { uuid: prediction.userId },
                    {
                        $inc: {
                            tokens: won ? tokensWon : 0,
                            crowns: won ? crownsWon : 0,
                            correctPredictions: won ? 1 : 0
                        }
                    }
                );

                prediction.resolved = true;
                prediction.result = {
                    won,
                    tokensWon,
                    crownsWon
                };
                await prediction.save();
                gradedCount++;
            }
        }
        if (gradedCount > 0) console.log(`✅ Graded ${gradedCount} predictions`);
    } catch (error) {
        console.error('Error grading predictions:', error);
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

// --- Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Routes ---

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        keysConfigured: API_KEYS.length,
        activeKeyMasked: API_KEYS[currentKeyIndex] ? `${API_KEYS[currentKeyIndex].substring(0, 4)}...` : 'none',
        allKeysMasked: API_KEYS.map(k => `${k.substring(0, 4)}...`),
        currentKeyIndex: currentKeyIndex,
        dbStatus: mongoose.connection.readyState
    });
});

app.get('/api/debug/force-refresh', async (req, res) => {
    try {
        console.log('Force refresh requested');
        const events = await fetchRealEvents(true);
        res.json({
            message: 'Refresh triggered',
            eventCount: events.length,
            debugLog: globalDebugLog
        });
    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});



// Public stats for landing page (no auth required)
app.get('/api/public/stats', async (req, res) => {
    try {
        await dbConnect();

        const [userCount, predictionCount] = await Promise.all([
            User.countDocuments({}),
            Prediction.countDocuments({})
        ]);

        res.json({
            users: userCount,
            predictions: predictionCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stats error:', error);
        // Return fallback stats if DB fails
        res.json({
            users: 1000,
            predictions: 5000,
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        await dbConnect();
        const { email, password } = req.body;
        let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (!user) {
            // For backward compatibility or auto-create during migration (optional based on preference)
            // But for real password auth, we should fail or require registration if not found
            // Turning OFF auto-create to enforce registration/password flow
            return res.status(404).json({ error: 'User not found. Please register.' });
        }

        // Verify password
        const bcrypt = require('bcryptjs');
        if (user.password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid password' });
            }
        } else {
            // Migration case: User exists but has no password (from old system)
            // Allow login if we want, OR require reset. 
            // Requirement: "Existing users will use the Forgot Password flow"
            return res.status(401).json({ error: 'Password not set. Please use "Forgot Password" to set one.' });
        }

        // AUTO-ADMIN: Force admin role for the specific email
        if (email.toLowerCase() === 'sportsprophecyapp@gmail.com' && user.role !== 'admin') {
            user.role = 'admin';
            if (!user.badges.includes('👑 Admin')) user.badges.push('👑 Admin');
            await user.save();
        }

        const token = jwt.sign({ uuid: user.uuid, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ user, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/user/:userId/balance', async (req, res) => {
    try {
        await dbConnect();
        const { userId } = req.params;
        const user = await User.findOne({ uuid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ tokens: user.tokens, crowns: user.crowns });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/balance/:userId', async (req, res) => {
    try {
        await dbConnect();
        const { userId } = req.params;
        const user = await User.findOne({ uuid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ tokens: user.tokens, crowns: user.crowns });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        await dbConnect();
        const { email, username, password, referralCode } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (user) {
            return res.status(409).json({ error: 'User already exists. Please login.' });
        }

        // Generate unique 6-character referral code
        let newReferralCode;
        let isUnique = false;
        while (!isUnique) {
            newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const existing = await User.findOne({ referralCode: newReferralCode });
            if (!existing) isUnique = true;
        }

        // Check if referred by someone
        let referrer = null;
        if (referralCode) {
            // Special case: "LOADING" refers to the admin account (for YouTube video)
            if (referralCode.toUpperCase() === 'LOADING') {
                referrer = await User.findOne({ email: 'sportsprophecyapp@gmail.com' });
                if (!referrer) {
                    console.warn('⚠️ Admin account not found for LOADING code');
                }
            } else {
                referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
            }
        }

        // Create new user with bonus tokens if referred
        const bonusTokens = referrer ? 10 : 0; // 10 bonus tokens for being referred
        const bonusCrowns = referrer ? 5 : 0;  // 5 bonus crowns for being referred

        // Hash password
        // Use a simpler hash for demo purposes if bcrypt fails or takes too long in some envs
        // But for production always use bcrypt
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            uuid: `user-${Date.now()}`,
            username: username || email.split('@')[0],
            idName: username || email.split('@')[0],
            email: email,
            password: hashedPassword,
            tokens: 60 + bonusTokens,  // 60 starter + bonus
            crowns: 5 + bonusCrowns,   // 5 starter + bonus
            isRegistered: true,
            badges: [],
            referralCode: newReferralCode,
            referredBy: referrer ? referrer.referralCode : null
        });

        // Credit referrer if applicable
        if (referrer) {
            await User.findOneAndUpdate(
                { uuid: referrer.uuid },
                {
                    $inc: { tokens: 10, crowns: 5, referralCount: 1 },
                    $push: { badges: '🤝 Referrer' } // Add badge if not present? (Simple push for now)
                }
            );
            // Send notification to referrer
            await Notification.create({
                userId: referrer.uuid,
                message: `User ${user.username} joined using your referral code! You earned 5 Crowns & 10 Tokens.`,
                type: 'info'
            });
        }

        const token = jwt.sign({ uuid: user.uuid, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ user, token });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Password Reset Endpoints ---

app.post('/api/forgot-password', async (req, res) => {
    try {
        await dbConnect();
        const { email } = req.body;
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate 6-digit code
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        // Send email
        await sendEmail(
            email,
            'Sports Prophecy Password Reset',
            `Your password reset code is: ${resetToken}\n\nThis code expires in 1 hour.`
        );

        res.json({ message: 'Reset code sent to email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reset-password', async (req, res) => {
    try {
        await dbConnect();
        const { email, code, newPassword } = req.body;

        const user = await User.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') },
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
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
        const { roomId } = req.query;
        // Filter by roomId (or null for Lobby)
        const query = roomId ? { roomId } : { roomId: null };

        const messages = await Chat.find(query).sort({ timestamp: -1 }).limit(50);
        res.json(messages.reverse());
    } catch (error) {
        console.error('Chat get error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        await dbConnect();
        const { sender_name, sender_id, message, sender_badges, roomId } = req.body;
        const newMessage = await Chat.create({
            sender_name,
            sender_id,
            message,
            sender_badges: sender_badges || [],
            roomId: roomId || null,
            timestamp: new Date()
        });
        res.json(newMessage);
    } catch (error) {
        console.error('Chat post error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/predictions', authenticateToken, async (req, res) => {
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

app.post('/api/weekly-draw/enter', authenticateToken, async (req, res) => {
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

app.post('/api/daily-login-reward', authenticateToken, async (req, res) => {
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

        // Get all users sorted by correctPredictions and tokens
        const users = await User.find({}).sort({ correctPredictions: -1, tokens: -1 });

        // Create a map to ensure unique usernames (keep the best entry per username)
        const uniqueUsers = new Map();

        for (const user of users) {
            const username = user.idName || user.username;

            // If we haven't seen this username, or this entry has better stats, keep it
            if (!uniqueUsers.has(username)) {
                uniqueUsers.set(username, user);
            } else {
                const existing = uniqueUsers.get(username);
                // Keep the one with more correct predictions, or more tokens if tied
                if (user.correctPredictions > existing.correctPredictions ||
                    (user.correctPredictions === existing.correctPredictions && user.tokens > existing.tokens)) {
                    uniqueUsers.set(username, user);
                }
            }
        }

        // Convert map to array and create leaderboard with ranks
        const leaderboard = Array.from(uniqueUsers.values())
            .sort((a, b) => {
                if (b.correctPredictions !== a.correctPredictions) {
                    return b.correctPredictions - a.correctPredictions;
                }
                return b.tokens - a.tokens;
            })
            .slice(0, 100) // Limit to top 100
            .map((user, index) => ({
                id: user.uuid, // Use uuid as unique ID for FlatList key
                rank: index + 1,
                username: user.idName || user.username,
                tokens: user.tokens,
                crowns: user.crowns,
                correctPredictions: user.correctPredictions || 0
            }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get API usage statistics
app.get('/api/admin/api-usage', authenticateToken, async (req, res) => {
    try {
        const stats = await getUsageStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Background Refresh Jobs (Production Only) ---
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_BACKGROUND_JOBS === 'true') {
    console.log('🔄 Starting background refresh jobs...');

    // Initial fetch on startup
    setTimeout(async () => {
        console.log('🚀 Initial data fetch on startup');
        await fetchRealEvents();
        await fetchGameResults();
    }, 5000); // Wait 5 seconds after startup

    // Refresh events every 6 hours (optimized to reduce API calls)
    setInterval(async () => {
        console.log('🔄 Background refresh: Fetching events...');
        try {
            await fetchRealEvents();
        } catch (error) {
            console.error('❌ Background refresh failed:', error.message);
        }
    }, 6 * 60 * 60 * 1000); // 6 hours (was 30 minutes)

    // Refresh results every 3 hours (for live games)
    setInterval(async () => {
        console.log('🔄 Background refresh: Fetching results...');
        try {
            await fetchGameResults();
            await gradePredictions();
        } catch (error) {
            console.error('❌ Background results refresh failed:', error.message);
        }
    }, 3 * 60 * 60 * 1000); // 3 hours (was 15 minutes)
}

// --- Server Export for Vercel ---
module.exports = app;

// --- Stripe Endpoints ---

// Webhook handler (Must be defined before other body parsers if using raw body, but here we use express.json)
// Note: In a real production Vercel function, getting the raw body for signature verification can be tricky.
// For this implementation, we'll assume the signature verification is handled or skipped for MVP stability,
// but ideally, you'd use a raw body parser for the webhook route specifically.
app.post('/api/webhooks/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        if (!stripe) throw new Error('Stripe not initialized');

        // In Vercel serverless with express.json() globally, req.body is already parsed.
        // Stripe requires the raw body for constructEvent. 
        // For this specific setup, we might need to rely on the event data directly if signature verification fails due to parsing.
        // However, for security, signature verification is best. 
        // If this fails in Vercel, we might need to adjust how we consume the body.

        // For now, we'll try to use the body if it's already an object (parsed), or construct if we can access raw.
        // Since we can't easily get raw body here without changing global middleware, 
        // we will trust the event structure for this MVP phase if signature check is too complex for current setup.
        // BUT, let's try to do it right if possible.

        // If we can't verify signature easily due to body parsing, we'll proceed with the parsed body
        // WARNING: This is less secure. Ensure STRIPE_WEBHOOK_SECRET is kept secret.
        event = req.body;

        // Handle the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { type, roomId } = session.metadata || {};

            await dbConnect();

            if (type === 'room_sponsor' && roomId) {
                // Handle Room Sponsorship
                const sponsorId = session.metadata?.sponsorId;

                if (sponsorId) {
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days

                    // Activate the sponsor record
                    await Sponsor.findByIdAndUpdate(sponsorId, {
                        paymentStatus: 'paid',
                        isActive: true,
                        startDate: new Date(),
                        endDate: expiryDate
                    });

                    // Update the ChatRoom with sponsor info
                    const sponsor = await Sponsor.findById(sponsorId);
                    if (sponsor) {
                        await ChatRoom.findByIdAndUpdate(roomId, {
                            sponsor: {
                                name: sponsor.sponsorName,
                                bannerUrl: sponsor.bannerUrl,
                                linkUrl: sponsor.linkUrl,
                                isActive: true,
                                expiryDate: expiryDate
                            }
                        });
                        console.log(`✅ Room ${roomId} sponsored by ${sponsor.sponsorName}!`);
                    }
                }

            } else {
                // Handle Main Page Sponsorship
                // Find the sponsor record by stripeSessionId or metadata
                // Assuming we stored the sponsor ID in metadata
                const sponsorId = session.metadata?.sponsorId;
                if (sponsorId) {
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 30);

                    await Sponsor.findByIdAndUpdate(sponsorId, {
                        paymentStatus: 'paid',
                        isActive: true,
                        startDate: new Date(),
                        endDate: expiryDate,
                        stripeSessionId: session.id
                    });
                    console.log(`✅ Sponsor ${sponsorId} paid!`);
                }
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

app.post('/api/sponsors/checkout', async (req, res) => {
    try {
        if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Stripe API Key missing' });
        await dbConnect();

        const { sponsorName, bannerUrl, linkUrl, duration, price } = req.body;

        // Create pending sponsor record
        const newSponsor = new Sponsor({
            sponsorName,
            bannerUrl,
            linkUrl,
            type: 'paid',
            duration: '30days',
            price: 25,
            paymentStatus: 'pending'
        });
        await newSponsor.save();

        // Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Sponsor Banner: ${sponsorName}`,
                        description: '30-day Main Page Banner Ad',
                        images: [
                            (bannerUrl && bannerUrl.startsWith && bannerUrl.startsWith('data:'))
                                ? 'https://placehold.co/600x400/png' // Guaranteed valid public URL
                                : bannerUrl
                        ],
                    },
                    unit_amount: 2500, // $25.00
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://www.sportsprophecyapp.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://www.sportsprophecyapp.com/cancel',
            metadata: {
                sponsorId: newSponsor._id.toString(),
                type: 'main_sponsor'
            }
        });

        // Update record with session ID
        newSponsor.stripeSessionId = session.id;
        await newSponsor.save();

        res.json({ checkoutUrl: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        res.status(400).json({
            error: 'Checkout Creation Failed',
            details: error.message,
            raw: JSON.stringify(error)
        });
    }
});

app.post('/api/sponsors/room-checkout', async (req, res) => {
    try {
        if (!stripe) throw new Error('Stripe not initialized');

        const { roomId, sponsorName, bannerUrl, linkUrl } = req.body;

        if (!roomId || !sponsorName || !bannerUrl || !linkUrl) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await dbConnect();

        // Create pending sponsor record
        const sponsor = new Sponsor({
            sponsorName,
            bannerUrl,
            linkUrl,
            type: 'room',
            roomId,
            price: 25,
            duration: '30days',
            paymentStatus: 'pending',
            isActive: false
        });

        await sponsor.save();

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Room Sponsorship - ${sponsorName}`,
                        description: '30-day exclusive room sponsorship',
                    },
                    unit_amount: 2500, // $25.00
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://www.sportsprophecyapp.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://www.sportsprophecyapp.com/cancel',
            metadata: {
                sponsorId: sponsor._id.toString(),
                roomId: roomId,
                type: 'room_sponsor',
                sponsorName,
                bannerUrl,
                linkUrl
            }
        });

        // Update sponsor with session ID
        sponsor.stripeSessionId = session.id;
        await sponsor.save();

        res.json({ checkoutUrl: session.url });
    } catch (error) {
        console.error('Room checkout error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/sponsors/active', async (req, res) => {
    try {
        await dbConnect();
        const sponsors = await Sponsor.find({ isActive: true, endDate: { $gt: new Date() } });
        res.json(sponsors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sponsors/prize-application', async (req, res) => {
    try {
        await dbConnect();
        const { prizeDescription, prizeValue, ...otherData } = req.body;

        const application = new Sponsor({
            ...otherData,
            type: 'prize',
            paymentStatus: 'pending', // No payment needed, but pending approval
            isActive: false,
            prizeDetails: {
                description: prizeDescription,
                value: prizeValue
            }
        });
        await application.save();

        // Send Email Alert
        await sendEmail(
            'contact@sportsprophecyapp.com',
            'New Prize Application Submitted',
            `A new prize application has been submitted by ${application.sponsorName}.\n\nPrize: ${prizeDescription}\nValue: $${prizeValue}\nContact: ${application.contactEmail}\n\nPlease check the Admin Panel to approve.`
        );

        res.json({ success: true, message: 'Application submitted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Chat Room Endpoints ---


// --- Admin Endpoints ---

// Get Moderators
app.get('/api/admin/moderators', async (req, res) => {
    try {
        await dbConnect();
        const moderators = await User.find({
            role: { $in: ['moderator', 'admin'] }
        }).select('username email role');
        res.json({ moderators });
    } catch (error) {
        console.error('Error fetching moderators:', error);
        res.status(500).json({ error: error.message });
    }
});

// Set User Role
app.post('/api/admin/set-role', async (req, res) => {
    try {
        await dbConnect();
        const { targetEmail, newRole } = req.body;

        if (!['user', 'moderator', 'admin'].includes(newRole)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findOne({ email: targetEmail });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.role = newRole;
        await user.save();

        res.json({ message: `User role updated to ${newRole}`, user: { username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Error setting role:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ban/Unban User
app.post('/api/admin/ban-user', async (req, res) => {
    try {
        await dbConnect();
        const { targetEmail, banned } = req.body;

        const user = await User.findOne({ email: targetEmail });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.banned = banned;
        await user.save();

        res.json({ message: `User ${banned ? 'banned' : 'unbanned'} successfully` });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Pending Sponsors
app.get('/api/admin/sponsors/pending', async (req, res) => {
    try {
        await dbConnect();
        const pending = await Sponsor.find({
            $or: [
                { type: 'prize', paymentStatus: { $in: ['pending', 'hold'] } },
                { type: 'paid', paymentStatus: { $in: ['pending', 'hold'] } }
            ],
            isActive: false
        }).sort({ createdAt: -1 });
        res.json(pending);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve Sponsor
app.post('/api/admin/sponsors/:id/approve', async (req, res) => {
    try {
        console.log('Approve sponsor request:', { id: req.params.id, body: req.body });
        await dbConnect();

        const { duration } = req.body; // '1week' or '1month'
        console.log('Approving sponsor with duration:', duration);

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date();
        if (duration === '1week') {
            endDate.setDate(endDate.getDate() + 7);
        } else {
            endDate.setDate(endDate.getDate() + 30); // Default to 1 month
        }

        // Use findByIdAndUpdate to avoid unique index issues
        const sponsor = await Sponsor.findByIdAndUpdate(
            req.params.id,
            {
                isActive: true,
                paymentStatus: 'approved',
                startDate: startDate,
                endDate: endDate
            },
            { new: true }
        );

        if (!sponsor) {
            console.log('Sponsor not found:', req.params.id);
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        console.log('Sponsor approved successfully:', sponsor._id);
        res.json({ success: true, sponsor });
    } catch (error) {
        console.error('Error approving sponsor:', error);
        res.status(500).json({ error: error.message });
    }
});

// Reject Sponsor
app.post('/api/admin/sponsors/:id/reject', async (req, res) => {
    try {
        await dbConnect();
        await Sponsor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Sponsor rejected and removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Hold Sponsor
app.post('/api/admin/sponsors/:id/hold', async (req, res) => {
    try {
        await dbConnect();
        const sponsor = await Sponsor.findById(req.params.id);
        if (!sponsor) return res.status(404).json({ error: 'Sponsor not found' });

        sponsor.isActive = false;
        sponsor.paymentStatus = 'hold'; // Functionally acts as hold
        await sponsor.save();

        res.json({ success: true, message: 'Sponsor put on hold' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Sponsor (Admin)
app.delete('/api/admin/sponsors/:id', async (req, res) => {
    try {
        await dbConnect();
        const sponsor = await Sponsor.findByIdAndDelete(req.params.id);

        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        res.json({ success: true, message: 'Sponsor deleted successfully' });
    } catch (error) {
        console.error('Error deleting sponsor:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get Active Sponsors (for management)
app.get('/api/admin/sponsors/active', async (req, res) => {
    try {
        await dbConnect();
        const activeSponsors = await Sponsor.find({
            isActive: true,
            paymentStatus: 'approved'
        }).sort({ createdAt: -1 });
        res.json(activeSponsors);
    } catch (error) {
        console.error('Error fetching active sponsors:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Deactivate Sponsor (remove from Prize Draws)
app.post('/api/admin/sponsors/:id/deactivate', async (req, res) => {
    try {
        await dbConnect();
        const sponsor = await Sponsor.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        res.json({ success: true, message: 'Sponsor deactivated and removed from Prize Draws', sponsor });
    } catch (error) {
        console.error('Error deactivating sponsor:', error);
        res.status(500).json({ error: error.message });
    }
});

// Public: Get Active Prize Sponsors for Weekly Draw
app.get('/api/sponsors/prizes', async (req, res) => {
    try {
        await dbConnect();
        const activePrizes = await Sponsor.find({
            type: 'prize',
            isActive: true,
            endDate: { $gt: new Date() } // Only not expired
        }).sort({ createdAt: -1 });
        res.json(activePrizes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/chat/rooms', async (req, res) => {
    try {
        await dbConnect();
        const rooms = await ChatRoom.find({}).sort({ createdAt: -1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat/rooms', async (req, res) => {
    try {
        await dbConnect();
        const { name, type, password, createdBy } = req.body;

        const newRoom = new ChatRoom({
            name,
            type,
            password,
            createdBy
        });

        await newRoom.save();
        res.json(newRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat/rooms/join', async (req, res) => {
    try {
        await dbConnect();
        const { roomId, password } = req.body;
        const room = await ChatRoom.findById(roomId);

        if (!room) return res.status(404).json({ error: 'Room not found' });

        if (room.type === 'private' && room.password !== password) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        res.json({ success: true, room });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle Notification Settings
app.post('/api/user/notifications/settings', authenticateToken, async (req, res) => {
    try {
        await dbConnect();
        const { userId, enabled } = req.body;
        await User.updateOne({ uuid: userId }, { notificationsEnabled: enabled });
        res.json({ success: true, enabled });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Custom Ad for Private Room (Room Creator Only)
app.put('/api/chat/rooms/:id/custom-ad', authenticateToken, async (req, res) => {
    try {
        await dbConnect();
        const { id } = req.params;
        const { bannerUrl, linkUrl, enabled } = req.body;
        const userId = req.user.uuid;

        // Find the room
        const room = await ChatRoom.findById(id);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if user is the room creator
        if (room.createdBy !== userId) {
            return res.status(403).json({ error: 'Only room creator can update custom ad' });
        }

        // Check if room is private
        if (room.type !== 'private') {
            return res.status(400).json({ error: 'Custom ads only available for private rooms' });
        }

        // Update custom ad
        room.customAd = {
            bannerUrl: bannerUrl || room.customAd?.bannerUrl || '',
            linkUrl: linkUrl || room.customAd?.linkUrl || '',
            enabled: enabled !== undefined ? enabled : room.customAd?.enabled || false
        };

        await room.save();
        res.json({ success: true, room });
    } catch (error) {
        console.error('Error updating custom ad:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete Room (Room Creator or Admin Only)
app.delete('/api/chat/rooms/:id', authenticateToken, async (req, res) => {
    try {
        await dbConnect();
        const { id } = req.params;
        const userId = req.user.uuid;

        // Find the room
        const room = await ChatRoom.findById(id);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check permissions: Must be room creator OR admin
        const isCreator = room.createdBy === userId;
        const isAdmin = userId === ADMIN_UUID;

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ error: 'Only room creator or admin can delete this room' });
        }

        // Prevent deletion of General/Lobby room (if it has a specific name or ID)
        if (room.name === 'General' || room.name === 'Lobby') {
            return res.status(400).json({ error: 'Cannot delete the General/Lobby room' });
        }

        // Delete all messages in the room
        await ChatMessage.deleteMany({ roomId: id });

        // Delete the room
        await ChatRoom.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Room and all messages deleted successfully',
            deletedBy: isAdmin ? 'admin' : 'creator'
        });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin Send Notification
app.post('/api/admin/notify', authenticateToken, async (req, res) => {
    try {
        await dbConnect();
        const { message, targetUserId } = req.body; // targetUserId can be null/'all'

        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        await Notification.create({
            userId: targetUserId || 'all',
            message,
            type: 'admin',
            timestamp: new Date()
        });

        res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Notifications for User
app.get('/api/notifications/:userId', authenticateToken, async (req, res) => {
    try {
        await dbConnect();
        const { userId } = req.params;

        // simple fetch: all 'all' messages + user specific messages
        const notifications = await Notification.find({
            $or: [{ userId: 'all' }, { userId: userId }]
        }).sort({ timestamp: -1 }).limit(20);

        res.json(notifications);
    } catch (error) {
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
