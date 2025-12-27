const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { dedupRequest } = require('../utils/requestDedup');
const { trackAPICall, getUsageStats, checkLimits } = require('../utils/apiMonitor');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Moved inside route
require('dotenv').config(); // Not needed in Vercel production

// Admin Configuration
const ADMIN_EMAIL = 'sportsprophecyapp@gmail.com';

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
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});
app.get('/privacy', (req, res) => {
    res.send(`
        <html>
            <head><title>Privacy Policy - Sports Prophecy</title></head>
            <body style="font-family: sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
                <h1>Privacy Policy</h1>
                <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p>Sports Prophecy ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect and use your data.</p>
                <h2>1. Information We Collect</h2>
                <p>We collect information you provide directly, such as when you create an account, make a prediction, or contact support. This includes:</p>
                <ul>
                    <li>Name/Username</li>
                    <li>Email Address</li>
                    <li>Profile information (e.g., Apple/Google ID for authentication)</li>
                </ul>
                <h2>2. How We Use Information</h2>
                <p>We use your information to fulfill the core purpose of the application: allowing you to participate in sports prediction games, tracking your leaderboard ranking, and managing your digital rewards (Tokens/Crowns).</p>
                <h2>3. Data Deletion</h2>
                <p>You can request account deletion by contacting support or using the delete account feature in the app settings.</p>
                <h2>4. Contact</h2>
                <p>For questions, please contact us at support@sportsprophecyapp.com.</p>
            </body>
        </html>
    `);
});

app.get('/terms', (req, res) => {
    res.send(`
        <html>
            <head><title>Terms of Service - Sports Prophecy</title></head>
            <body style="font-family: sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
                <h1>Terms of Service</h1>
                <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p>By accessng or using the Sports Prophecy app, you agree to be bound by these Terms.</p>
                <h2>1. Use of Service</h2>
                <p>You must be at least 18 years old to use this service.</p>
                <h2>2. User Content</h2>
                <p>You are responsible for the content you post and your interactions with other users.</p>
                <h2>3. Termination</h2>
                <p>We reserve the right to suspend or terminate your account for any violation of these terms.</p>
            </body>
        </html>
    `);
});

app.get('/download', (req, res) => {
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.sportsprophecy.app'; // Placeholder
    const appStoreUrl = 'https://apps.apple.com/app/idYOUR_APPLE_APP_ID'; // Placeholder
    // Self-referencing QR code so desktop users scan it and come back to this page on mobile
    const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.sportsprophecyapp.com/download';

    res.send(`
        <html>
            <head>
                <title>Download Sports Prophecy</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        background-color: #0a1628;
                        color: #ffffff;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        text-align: center;
                        padding: 20px;
                    }
                    .container {
                        max-width: 500px;
                        width: 100%;
                    }
                    h1 { margin-bottom: 10px; font-size: 28px; }
                    p { color: #8fa3bf; margin-bottom: 30px; }
                    .button {
                        display: block;
                        background-color: #00d4ff;
                        color: #0a1628;
                        padding: 15px 30px;
                        border-radius: 12px;
                        text-decoration: none;
                        font-weight: bold;
                        margin: 10px 0;
                        transition: transform 0.2s;
                    }
                    .button:active { transform: scale(0.98); }
                    .qr-container {
                        background: white;
                        padding: 20px;
                        border-radius: 20px;
                        margin-top: 30px;
                        display: inline-block;
                    }
                    .desktop-only { display: none; }
                    
                    @media (min-width: 768px) {
                        .mobile-only { display: none; }
                        .desktop-only { display: block; }
                    }
                </style>
                <script>
                    window.onload = function() {
                        const userAgent = navigator.userAgent.toLowerCase();
                        const isIos = userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod');
                        const isAndroid = userAgent.includes('android');

                        if (isIos) {
                            setTimeout(function() { window.location.href = '${appStoreUrl}'; }, 1000);
                            document.getElementById('status').innerText = 'Redirecting to App Store...';
                        } else if (isAndroid) {
                            setTimeout(function() { window.location.href = '${playStoreUrl}'; }, 1000);
                            document.getElementById('status').innerText = 'Redirecting to Google Play...';
                        }
                    }
                </script>
            </head>
            <body>
                <div class="container">
                    <h1>Sports Prophecy</h1>
                    <p id="status">Choose your platform</p>

                    <div class="mobile-only">
                        <a href="${appStoreUrl}" class="button">Download on App Store</a>
                        <a href="${playStoreUrl}" class="button">Get it on Google Play</a>
                    </div>

                    <div class="desktop-only">
                        <p>Scan to Install on Mobile</p>
                        <div class="qr-container">
                            <img src="${qrCodeUrl}" alt="Scan to Download" width="200" height="200">
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
    origin: '*',
}));

app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        if (req.originalUrl.includes('/api/webhooks/stripe')) {
            req.rawBody = buf;
        }
    }
}));

// Health Check
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', version: '2.17.6' }));

// Debug Route
app.get('/api/debug', (req, res) => {
    res.json({
        url: req.url,
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        headers: req.headers
    });
});

const handleGoogleAuth = async (req, res) => {
    try {
        console.log('🌟 Google Auth Endpoint Hit');
        const { idToken, accessToken, deviceLanguage, deviceRegion } = req.body;

        if (!idToken && !accessToken) {
            console.error('❌ Missing idToken and accessToken in request body');
            return res.status(400).json({ error: 'Missing Auth Token' });
        }

        await dbConnect();

        let googleId, email, name, picture;

        if (idToken) {
            // Priority 1: Verify ID Token
            const { OAuth2Client } = require('google-auth-library');
            const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

            const ticket = await googleClient.verifyIdToken({
                idToken: idToken,
                audience: [
                    '690358031158-n4e5sqsu936iega8rh9ge8f0kjikveht.apps.googleusercontent.com', // Web
                    '690358031158-c8shuqjc5h66ffg811j1re5b7ihgimrh.apps.googleusercontent.com', // iOS
                    '690358031158-ii4ae9s6l59tmhg5gf0sd1a7imk4cjfq.apps.googleusercontent.com'  // Android
                ],
            });
            const payload = ticket.getPayload();
            googleId = payload.sub;
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
        } else if (accessToken) {
            // Priority 2: Verify Access Token via UserInfo Endpoint
            try {
                const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const profile = userInfoResponse.data;
                googleId = profile.id;
                email = profile.email;
                name = profile.name;
                picture = profile.picture;
            } catch (err) {
                console.error('Failed to verify access token:', err.response?.data || err.message);
                return res.status(401).json({ error: 'Invalid Access Token' });
            }
        }

        // Common User Creation/Linking Logic
        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (user) {
            // Link account if not linked
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
            // Update language/region if provided and not already set
            if (deviceLanguage && !user.deviceLanguage) {
                user.deviceLanguage = deviceLanguage;
            }
            if (deviceRegion && !user.deviceRegion) {
                user.deviceRegion = deviceRegion;
            }
            if ((deviceLanguage && !user.deviceLanguage) || (deviceRegion && !user.deviceRegion)) {
                await user.save();
            }
        } else {
            // Create New User
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // Unique Referral Code
            let uniqueCode = false;
            let referralCode = '';
            while (!uniqueCode) {
                referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                const existing = await User.findOne({ referralCode });
                if (!existing) uniqueCode = true;
            }

            user = new User({
                uuid: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                email,
                username: name || email.split('@')[0],
                password: hashedPassword,
                referralCode,
                role: 'user',
                tokens: 10,
                crowns: 5,
                googleId,
                badges: [],
                deviceLanguage: deviceLanguage || null,
                deviceRegion: deviceRegion || null,
                // Auto-accept for OAuth users (assumed 13+ from OAuth provider)
                ageVerified: true,
                tosAccepted: true,
                tosAcceptedDate: new Date(),
                privacyPolicyAccepted: true,
                privacyPolicyAcceptedDate: new Date(),
                createdAt: new Date()
            });
            await user.save();
        }

        // Auto-Admin logic for Google Login
        if (user.email && user.email.toLowerCase() === 'sportsprophecyapp@gmail.com' && user.role !== 'admin') {
            user.role = 'admin';
            if (!user.badges.includes('👑 Admin')) user.badges.push('👑 Admin');
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role, uuid: user.uuid },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ success: true, token, user });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ error: 'Invalid Google Token: ' + error.message });
    }
};

app.post('/api/auth/google', handleGoogleAuth);
app.post('/auth/google', handleGoogleAuth);

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
    notificationsEnabled: { type: Boolean, default: true },
    googleId: { type: String, sparse: true, unique: true },
    appleId: { type: String, sparse: true, unique: true },
    profilePicture: { type: String, default: null },
    selectedBadge: { type: String, default: null }, // Valid badge ID
    isMuted: { type: Boolean, default: false },
    needsWarningAcknowledge: { type: Boolean, default: false },
    pendingWarningMessage: { type: String, default: null },
    roomBans: [{ type: String }], // Array of Room IDs the user is kicked/banned from
    deviceLanguage: { type: String, default: null }, // e.g., "en-US", "es-MX", "fr-CA"
    deviceRegion: { type: String, default: null }, // e.g., "US", "MX", "CA"
    // Age Verification & Legal Consent
    ageVerified: { type: Boolean, default: false },
    birthYear: { type: Number, default: null },
    tosAccepted: { type: Boolean, default: false },
    tosAcceptedDate: { type: Date, default: null },
    privacyPolicyAccepted: { type: Boolean, default: false },
    privacyPolicyAcceptedDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
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
    sender_avatar: String,
    sender_badge_id: { type: String, default: null },
    message: String,
    type: { type: String, enum: ['message', 'system'], default: 'message' },
    targetUserId: { type: String, default: null },
    sender_badges: [String], // Legacy, keep for backward compat if needed or just ignore
    sender_role: { type: String, default: 'user' },
    sender_email: String,
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
    placement: { type: String, enum: ['main', 'prizeDraws', 'both'], default: 'main' }, // Ad placement location
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

const RolePermissionSchema = new mongoose.Schema({
    role: { type: String, required: true, unique: true, enum: ['user', 'moderator', 'admin'] },
    permissions: {
        can_manage_users: { type: Boolean, default: false },
        can_ban_users: { type: Boolean, default: false },
        can_manage_sponsors: { type: Boolean, default: false },
        can_send_notifications: { type: Boolean, default: false },
        can_manage_roles: { type: Boolean, default: false },
        can_delete_rooms: { type: Boolean, default: false },
        can_mute_users: { type: Boolean, default: false },
        can_kick_users: { type: Boolean, default: false },
        can_view_api_stats: { type: Boolean, default: false },
    },
    updatedAt: { type: Date, default: Date.now }
});

const WinnerSchema = new mongoose.Schema({
    userId: String,
    username: String,
    userAvatar: String,
    prizeName: String,
    quote: String,
    drawId: String,
    wonAt: { type: Date, default: Date.now },
    isFeatured: { type: Boolean, default: true }
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
const Winner = mongoose.models.Winner || mongoose.model('Winner', WinnerSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
const RolePermission = mongoose.models.RolePermission || mongoose.model('RolePermission', RolePermissionSchema);

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
                    daysFrom: 10,
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

                    // Send Notification
                    try {
                        await Notification.create({
                            userId: prediction.userId,
                            message: `You made a correct prediction for ${event.homeTeam} vs ${event.awayTeam}!`,
                            reward: `+${tokensWon} Tokens, +${crownsWon} Crowns`,

                            type: 'win',
                            timestamp: new Date()
                        });
                    } catch (err) {
                        console.error('Failed to create win notification', err);
                    }
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

        // Auto-upgrade admin if email matches
        if (user.email && user.email.toLowerCase() === 'sportsprophecyapp@gmail.com') {
            user.role = 'admin';
        }

        req.user = user;
        next();
    });
};

const authenticateTokenOptional = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
};

// Authorization Middleware
const authorize = (permission) => {
    return async (req, res, next) => {
        try {
            await dbConnect();

            if (!req.user || !req.user.role) {
                console.warn(`[AUTH] Missing user or role in request for permission: ${permission}`);
                return res.status(401).json({ error: 'Authentication required' });
            }

            // Admin role or email bypasses all permission checks
            const isAdmin = req.user.role === 'admin' ||
                (req.user.email && req.user.email.toLowerCase() === 'sportsprophecyapp@gmail.com');

            if (isAdmin) {
                return next();
            }

            let rolePerms = await RolePermission.findOne({ role: req.user.role });

            // If permissions don't exist in DB (e.g. fresh production deploy), seed them on the fly
            if (!rolePerms) {
                console.log(`⚠️ Permissions for role "${req.user.role}" not found, initializing defaults...`);
                await initializeDefaultPermissions();
                rolePerms = await RolePermission.findOne({ role: req.user.role });
            }

            // Robust check for the permission
            // Handle both Map (get()) and plain object access patterns
            let hasPermission = false;
            if (rolePerms && rolePerms.permissions) {
                if (typeof rolePerms.permissions.get === 'function') {
                    hasPermission = rolePerms.permissions.get(permission) === true;
                } else {
                    hasPermission = rolePerms.permissions[permission] === true;
                }
            }

            if (!hasPermission) {
                console.warn(`[AUTH] Access Denied: User ${req.user.email} (Role: ${req.user.role}) attempted "${permission}" without permission.`);
                return res.status(403).json({ error: `You do not have permission: ${permission}` });
            }

            next();
        } catch (error) {
            console.error('[AUTH ERROR] Internal failure during authorization:', error);
            res.status(500).json({
                error: 'Internal server error during authorization',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};

const initializeDefaultPermissions = async () => {
    try {
        await dbConnect();

        // Ensure default roles exist without deleting them if possible
        const roles = ['moderator', 'admin'];
        const defaults = {
            admin: {
                can_manage_users: true,
                can_ban_users: true,
                can_manage_sponsors: true,
                can_send_notifications: true,
                can_manage_roles: true,
                can_delete_rooms: true,
                can_mute_users: true,
                can_kick_users: true,
                can_view_api_stats: true,
            },
            moderator: {
                can_manage_users: true,
                can_ban_users: true,
                can_manage_sponsors: true,
                can_send_notifications: true,
                can_delete_rooms: true,
                can_mute_users: true,
                can_kick_users: true,
            }
        };

        for (const role of roles) {
            const existing = await RolePermission.findOne({ role });
            if (!existing) {
                console.log(`🌱 Initializing default permissions for role: ${role}`);
                await RolePermission.create({
                    role,
                    permissions: defaults[role] || {}
                });
            } else {
                // merge missing permissions incrementally rather than a hard reset if desired
                // but for now, we follow the refresh logic:
                console.log(`🔄 Refreshing/Updating permissions for role: ${role}`);
                const currentPerms = existing.permissions || {};
                const updatedPerms = { ...defaults[role] };

                // If it's a Map, we should handle it accordingly, but here we replace the object
                existing.permissions = updatedPerms;
                existing.updatedAt = new Date();
                await existing.save();
            }
        }
    } catch (error) {
        console.error('Error initializing default permissions:', error);
    }
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

        const token = jwt.sign(
            { userId: user._id, uuid: user.uuid, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
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
        const { email, username, password, referralCode, deviceLanguage, deviceRegion, ageVerified, tosAccepted, privacyPolicyAccepted } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        // Validate age verification
        if (ageVerified !== true) {
            return res.status(400).json({ error: 'You must confirm that you are 18 years of age or older.' });
        }

        // Validate TOS and Privacy Policy acceptance
        if (!tosAccepted || !privacyPolicyAccepted) {
            return res.status(400).json({ error: 'You must accept the Terms of Service and Privacy Policy' });
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
            referredBy: referrer ? referrer.referralCode : null,
            deviceLanguage: deviceLanguage || null,
            deviceRegion: deviceRegion || null,
            // Age Verification & Legal Consent
            ageVerified: true,
            birthYear: null, // No longer collecting specific birth year
            tosAccepted: true,
            tosAcceptedDate: new Date(),
            privacyPolicyAccepted: true,
            privacyPolicyAcceptedDate: new Date()
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

            // Send notification to the NEW USER (Confirmation)
            await Notification.create({
                userId: user.uuid,
                message: `Welcome! Referral code verified. You started with +10 Tokens & +5 Crowns bonus!`,
                type: 'win' // Use 'win' type for positive reinforcement
            });
        }

        const token = jwt.sign(
            { userId: user._id, uuid: user.uuid, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
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
        const { sender_name, sender_id, message, sender_badges, roomId, sender_avatar, sender_badge_id, type, targetUserId } = req.body;

        // Moderation Check
        const user = await User.findOne({ uuid: sender_id });
        if (user) {
            if (user.isBanned) return res.status(403).json({ error: 'Your account is banned.' });
            if (user.isMuted) return res.status(403).json({ error: 'You are currently muted.' });
            if (user.needsWarningAcknowledge) return res.status(403).json({ error: 'You must acknowledge your official warning before you can continue chatting.' });
            if (roomId && user.roomBans && user.roomBans.includes(roomId)) {
                return res.status(403).json({ error: 'You have been removed from this room.' });
            }
        }

        // System Message Security: Only Admins/Moderators can send system messages manually
        if (type === 'system' && (!user || (user.role !== 'admin' && user.role !== 'moderator'))) {
            return res.status(403).json({ error: 'Unauthorized to send system messages.' });
        }

        const newMessage = await Chat.create({
            sender_name,
            sender_id,
            message,
            sender_avatar: sender_avatar || null,
            sender_badge_id: sender_badge_id || null,
            sender_badges: sender_badges || [],
            roomId: roomId || null,
            type: type || 'message',
            targetUserId: targetUserId || null,
            sender_role: user?.role || 'user',
            sender_email: user?.email || null,
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
        const { userId, eventId, predictedWinner, predictedScores, confidenceLevel } = req.body;

        const user = await User.findOne({ uuid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Determine token cost based on confidence level
        let tokenCost = 1;
        if (confidenceLevel === 'confident') tokenCost = 2;
        if (confidenceLevel === 'lock') tokenCost = 5;

        if (user.tokens < tokenCost) {
            return res.status(400).json({ error: 'Insufficient tokens' });
        }

        user.tokens -= tokenCost;
        await user.save();

        const prediction = await Prediction.create({
            id: Date.now(),
            userId,
            eventId,
            predictedWinner,
            predictedScores,
            confidenceLevel: confidenceLevel || 'normal',
            timestamp: new Date()
        });

        res.json({
            success: true,
            prediction,
            balance: {
                tokens: user.tokens,
                crowns: user.crowns
            }
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Assuming a Google Auth endpoint exists here, as per the provided snippet structure.
// If not, this block would be placed after the /api/predictions endpoint.
// This is a placeholder for the end of a Google Auth endpoint.
// If you don't have a Google Auth endpoint, you might need to adjust the placement.
// For the purpose of this edit, we are inserting the Apple Auth endpoint after the
// structure implied by the provided 'Code Edit' snippet.
//


// Apple Auth Endpoint (Scaffold)
app.post('/api/auth/apple', async (req, res) => {
    try {
        await dbConnect();
        const { identityToken, user: appleUserString } = req.body;

        // Apple Sign-In Token Verification
        // Currently decoding the identityToken to extract user information.
        // For production at scale, consider verifying the token signature with Apple's public keys.
        // Reference: https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/verifying_a_user
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(identityToken);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid Apple Token' });
        }

        const { email, sub: appleId } = decoded;

        // Note: Apple only sends 'email' and 'name' on the FIRST login.
        // Subsequent logins only have the identityToken.
        // We must rely on 'sub' (User ID) to find the user.

        let user = await User.findOne({ appleId });

        if (!user) {
            // If it's a new user, we try to get name/email from the request body or token
            // The frontend sends the 'user' object (JSON string) only on first login.
            let name = 'Apple User';
            let userEmail = email;

            if (appleUserString) {
                try {
                    const appleUser = JSON.parse(appleUserString);
                    if (appleUser.name) {
                        name = `${appleUser.name.givenName || ''} ${appleUser.name.familyName || ''}`.trim() || name;
                    }
                    if (appleUser.email) userEmail = appleUser.email;
                } catch (e) { console.error('Error parsing apple user:', e); }
            }

            // Check if user exists by email (if we have it) to link accounts
            if (userEmail) {
                user = await User.findOne({ email: userEmail });
            }

            if (user) {
                // Link account
                user.appleId = appleId;
                await user.save();
            } else {
                // Create new user
                const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                let uniqueCode = false;
                let referralCode = '';
                while (!uniqueCode) {
                    referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                    const existing = await User.findOne({ referralCode });
                    if (!existing) uniqueCode = true;
                }

                user = new User({
                    uuid: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    email: userEmail || `apple_${appleId}@privaterelay.appleid.com`, // Fallback
                    username: name,
                    password: hashedPassword,
                    referralCode,
                    role: 'user',
                    tokens: 10,
                    crowns: 5,
                    appleId,
                    // Auto-accept for OAuth users (assumed 13+ from OAuth provider)
                    ageVerified: true,
                    tosAccepted: true,
                    tosAcceptedDate: new Date(),
                    privacyPolicyAccepted: true,
                    privacyPolicyAcceptedDate: new Date(),
                    createdAt: new Date()
                });
                await user.save();
            }
        }

        // Auto-Admin logic for Apple Login
        if (user.email && user.email.toLowerCase() === 'sportsprophecyapp@gmail.com' && user.role !== 'admin') {
            user.role = 'admin';
            if (!user.badges.includes('👑 Admin')) user.badges.push('👑 Admin');
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role, uuid: user.uuid },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ success: true, token, user });

    } catch (error) {
        console.error('Apple Auth Error:', error);
        res.status(401).json({ error: 'Apple Auth Failed' });
    }
});

app.get('/api/predictions/:userId', async (req, res) => {
    try {
        await dbConnect();
        const { userId } = req.params;

        // Lazy Update Logic: check/update results if user has pending predictions
        const hasPending = await Prediction.exists({ userId, resolved: false });

        if (hasPending) {
            const now = Date.now();
            // Check if we haven't updated results recently (throttle to 15 mins)
            // Note: In serverless, global vars reset on cold start, which is actually good here (ensures fresh data)
            if (!global.lastResultFetch || (now - global.lastResultFetch > 15 * 60 * 1000)) {
                console.log(`⏳ Lazy update triggered for user ${userId}...`);
                await fetchGameResults();
                await gradePredictions();
                global.lastResultFetch = Date.now();
            }
        }

        const predictions = await Prediction.find({ userId }).sort({ timestamp: -1 });
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
        const drawId = `weekly-draw-${new Date().getFullYear()}-W${getWeekNumber(new Date())}`;
        const totalEntries = await DrawEntry.countDocuments({ drawId });
        res.json({ totalEntries });
    } catch (error) {
        console.error('Draw stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/weekly-draw/user-entries/:userId', authenticateToken, async (req, res) => {
    try {
        await dbConnect();
        const { userId } = req.params;
        const drawId = `weekly-draw-${new Date().getFullYear()}-W${getWeekNumber(new Date())}`;
        const userEntries = await DrawEntry.countDocuments({ userId, drawId });
        res.json({ count: userEntries });
    } catch (error) {
        console.error('User entries error:', error);
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/winners/featured', async (req, res) => {
    try {
        await dbConnect();
        const winner = await Winner.findOne({ isFeatured: true }).sort({ wonAt: -1 });
        res.json(winner || null);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/weekly-draw/pick-winner', authenticateToken, authorize('can_manage_sponsors'), async (req, res) => {
    try {
        await dbConnect();
        // Allow manual override or random pick
        const { drawId, prizeName, quote, customUserId } = req.body;

        let winnerUser;
        const targetDrawId = drawId || `weekly-draw-${new Date().getFullYear()}-W${getWeekNumber(new Date())}`;

        if (customUserId) {
            winnerUser = await User.findOne({ uuid: customUserId });
        } else {
            // Random Pick from Entrants
            const entries = await DrawEntry.find({ drawId: targetDrawId });

            if (entries.length === 0) {
                return res.status(400).json({ error: `No entries found for draw ${targetDrawId}` });
            }

            // Shuffle entries using Fisher-Yates algorithm for better randomization
            const shuffledEntries = [...entries];
            for (let i = shuffledEntries.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledEntries[i], shuffledEntries[j]] = [shuffledEntries[j], shuffledEntries[i]];
            }

            // Pick the first entry from shuffled array
            const winnerEntry = shuffledEntries[0];
            winnerUser = await User.findOne({ uuid: winnerEntry.userId });
        }

        if (!winnerUser) {
            return res.status(404).json({ error: 'Winner user not found' });
        }

        // Un-feature previous winners
        await Winner.updateMany({}, { isFeatured: false });

        // Create Winner
        const newWinner = await Winner.create({
            userId: winnerUser.uuid,
            username: winnerUser.username,
            // Try to find reasonable avatar source, or let frontend handle default
            userAvatar: winnerUser.profilePicture || winnerUser.avatar || null,
            prizeName: prizeName || 'Weekly Mystery Prize',
            quote: quote || "I never thought I'd actually win! This is amazing!",
            drawId: targetDrawId,
            isFeatured: true,
            wonAt: new Date()
        });

        // Optional: Send notification
        await Notification.create({
            userId: winnerUser.uuid,
            message: `🎉 CONGRATULATIONS! You won the ${newWinner.prizeName}! Check your email for details.`,
            type: 'win'
        });

        res.json({ success: true, winner: newWinner });

    } catch (error) {
        console.error('Pick winner error:', error);
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

        // Helper to check if two dates are the same calendar day (UTC or Server Local time)
        // Using simplified approach: check if Year, Month, Date match
        const isSameDay = (d1, d2) => {
            return d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate();
        };

        const isYesterday = (d1, d2) => {
            const yesterday = new Date(d1);
            yesterday.setDate(yesterday.getDate() - 1);
            return isSameDay(yesterday, d2);
        };

        // If never claimed, or last claim was NOT today
        const canClaim = !lastLogin || !isSameDay(now, lastLogin);

        if (canClaim) {
            // Calculate Streak
            let streak = user.loginStreak || 0;
            if (lastLogin && isYesterday(now, lastLogin)) {
                streak += 1;
            } else {
                streak = 1; // Reset streak if missed a day (or first time)
            }

            // Determine Rewards
            let tokensToAdd = 5; // Base daily tokens
            let crownsToAdd = 1; // Base daily crowns
            let isStreakBonus = false;
            let message = 'Daily Reward Claimed!';

            // Weekly Bonus (Every 7 days)
            if (streak > 0 && streak % 7 === 0) {
                tokensToAdd += 10;
                crownsToAdd += 5;
                isStreakBonus = true;
                message = '🔥 7-Day Streak Bonus Awarded!';
            }

            // Apply Updates
            user.tokens = (user.tokens || 0) + tokensToAdd;
            user.crowns = (user.crowns || 0) + crownsToAdd;
            user.loginStreak = streak;
            user.lastLoginReward = now;

            await user.save();

            res.json({
                canClaim: true,
                claimed: true,
                balance: {
                    tokens: user.tokens,
                    crowns: user.crowns
                },
                reward: {
                    tokens: tokensToAdd,
                    crowns: crownsToAdd,
                    streak: streak,
                    isStreakBonus: isStreakBonus
                },
                message
            });
        } else {
            // Already claimed today
            res.json({
                canClaim: false,
                claimed: false,
                message: 'Already claimed today. Come back tomorrow!',
                balance: {
                    tokens: user.tokens,
                    crowns: user.crowns
                },
                streak: user.loginStreak || 0
            });
        }
    } catch (error) {
        console.error('Daily login error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/leaderboard', authenticateTokenOptional, async (req, res) => {
    try {
        await dbConnect();
        const timeframe = req.query.timeframe || 'all';
        const userId = req.user?.uuid; // From optional auth middleware

        // Configuration
        const CONFIG = {
            weekly: { min: 5, target: 15, days: 7 },
            monthly: { min: 20, target: 60, days: 30 },
            all: { min: 100, target: 300, days: null }
        };

        const config = CONFIG[timeframe] || CONFIG.all;

        // Date Filter
        let matchStage = { resolved: true };
        if (config.days) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - config.days);
            matchStage.timestamp = { $gte: startDate };
        }

        const getConfidence = (total, target) => {
            if (total >= config.target) return 'High';
            if (total >= config.target * 0.5) return 'Medium';
            return 'Low';
        };

        // 1. Calculate Stats for ALL Users
        // Note: In high-scale production, this should be a scheduled job or materialized view.
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: "$userId",
                    totalPredictions: { $sum: 1 },
                    correctPredictions: {
                        $sum: {
                            $cond: [{ $or: [{ $eq: ["$result.won", true] }, { $eq: ["$won", true] }] }, 1, 0]
                        }
                    },
                    exactPredictions: {
                        $sum: {
                            $cond: [{ $eq: ["$result.exactScore", true] }, 1, 0]
                        }
                    },
                    lastActivity: { $max: "$timestamp" }
                }
            },
            // Filter Eligibility
            { $match: { totalPredictions: { $gte: config.min } } },
            // Calculate Score
            {
                $addFields: {
                    score: {
                        $divide: ["$correctPredictions", { $max: ["$totalPredictions", config.target] }]
                    },
                    accuracy: {
                        $divide: ["$correctPredictions", { "$cond": [{ "$eq": ["$totalPredictions", 0] }, 1, "$totalPredictions"] }]
                    }
                }
            },
            // Sort
            { $sort: { score: -1, correctPredictions: -1, exactPredictions: -1, lastActivity: 1 } }
        ];

        const allRankings = await Prediction.aggregate(pipeline);

        // Fetch User Details for Top 100 (Optimized Batch Fetch)
        const top100Data = allRankings.slice(0, 100);
        const userIds = top100Data.map(e => e._id);

        const users = await User.find({ uuid: { $in: userIds } }).select('uuid username idName crowns');
        const userMap = users.reduce((acc, user) => {
            acc[user.uuid] = user;
            return acc;
        }, {});

        const enrichedLeaderboard = top100Data.map((entry, i) => {
            const user = userMap[entry._id];
            // If user not found (deleted?), skip or show 'Unknown'
            // We'll keep them in list to maintain rank integrity but show fallback
            return {
                id: entry._id,
                username: user?.idName || user?.username || 'Unknown Player',
                correctPredictions: entry.correctPredictions,
                totalPredictions: entry.totalPredictions,
                accuracy: entry.accuracy,
                score: entry.score,
                confidenceTier: getConfidence(entry.totalPredictions, config.target),
                crowns: user?.crowns || 0,
                rank: i + 1
            };
        });

        // Get Current User Stats if logged in
        let userRankData = null;
        if (userId) {
            const userIndex = allRankings.findIndex(r => r._id === userId);
            if (userIndex !== -1) {
                const entry = allRankings[userIndex];
                const user = await User.findOne({ uuid: userId }).select('username idName crowns');
                if (user) {
                    userRankData = {
                        id: userId,
                        username: user.idName || user.username,
                        correctPredictions: entry.correctPredictions,
                        totalPredictions: entry.totalPredictions,
                        accuracy: entry.accuracy,
                        score: entry.score,
                        confidenceTier: getConfidence(entry.totalPredictions, config.target),
                        crowns: user.crowns,
                        rank: userIndex + 1
                    };
                }
            } else {
                // User didn't qualify or has no data
                // We need to fetch their raw stats even if not eligible for leaderboard
                // to show them "You need X more predictions"
                // Run a specific query for them
                const userStats = await Prediction.aggregate([
                    { $match: { ...matchStage, userId: userId } },
                    {
                        $group: {
                            _id: "$userId",
                            totalPredictions: { $sum: 1 },
                            correctPredictions: {
                                $sum: {
                                    $cond: [{ $or: [{ $eq: ["$result.won", true] }, { $eq: ["$won", true] }] }, 1, 0]
                                }
                            }
                        }
                    }
                ]);

                const stats = userStats[0] || { totalPredictions: 0, correctPredictions: 0 };
                const currentUser = await User.findOne({ uuid: userId }).select('username idName crowns');

                userRankData = {
                    id: userId,
                    username: currentUser?.idName || currentUser?.username,
                    correctPredictions: stats.correctPredictions,
                    totalPredictions: stats.totalPredictions,
                    accuracy: stats.totalPredictions > 0 ? stats.correctPredictions / stats.totalPredictions : 0,
                    score: 0,
                    crowns: currentUser?.crowns || 0,
                    rank: null,
                    notEligible: true,
                    minNeeded: config.min
                };
            }
        }

        return res.json({
            leaderboard: enrichedLeaderboard,
            userStats: userRankData,
            config: { min: config.min, target: config.target }
        });

    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get API usage statistics
app.get('/api/admin/api-usage', authenticateToken, authorize('can_view_api_stats'), async (req, res) => {
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
        await initializeDefaultPermissions();
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
        if (process.env.STRIPE_WEBHOOK_SECRET && req.rawBody) {
            try {
                event = stripe.webhooks.constructEvent(
                    req.rawBody,
                    sig,
                    process.env.STRIPE_WEBHOOK_SECRET
                );
            } catch (err) {
                console.warn(`⚠️ Webhook signature verification failed: ${err.message}. Falling back to parsed body.`);
                event = req.body;
            }
        } else {
            event = req.body;
        }

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

        const { sponsorName, bannerUrl, linkUrl, duration, amount, placement = 'main' } = req.body;
        const finalPrice = parseFloat(amount) || 25;

        if (finalPrice < 0.50) {
            return res.status(400).json({ error: 'Invalid Amount: Minimum sponsorship amount is $0.50.' });
        }

        // Create pending sponsor record
        const newSponsor = new Sponsor({
            sponsorName,
            bannerUrl,
            linkUrl,
            type: 'paid',
            placement: placement || 'main', // Store placement preference
            duration: duration || '30days',
            price: finalPrice,
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
                    unit_amount: Math.round(finalPrice * 100), // Dynamic amount in cents
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

        const { roomId, sponsorName, bannerUrl, linkUrl, amount } = req.body;
        const finalPrice = parseFloat(amount) || 25;

        if (finalPrice < 0.50) {
            return res.status(400).json({ error: 'Invalid Amount: Minimum sponsorship amount is $0.50.' });
        }

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
            price: finalPrice,
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
                    unit_amount: Math.round(finalPrice * 100), // Dynamic amount in cents
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

// Get sponsors specifically for Prize Draws page
app.get('/api/sponsors/prize-draws', async (req, res) => {
    try {
        await dbConnect();
        const now = new Date();
        const prizeDrawSponsors = await Sponsor.find({
            isActive: true,
            isApproved: true,
            type: 'paid',
            placement: { $in: ['prizeDraws', 'both'] },
            $or: [
                { endDate: { $gt: now } },
                { endDate: null }
            ]
        }).sort({ createdAt: -1 });
        res.json(prizeDrawSponsors);
    } catch (error) {
        console.error('Error fetching prize draw sponsors:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sponsors/prize-application', async (req, res) => {
    try {
        await dbConnect();
        const { prizeDescription, ...otherData } = req.body;

        const application = new Sponsor({
            ...otherData,
            type: 'prize',
            paymentStatus: 'pending', // No payment needed, but pending approval
            isActive: false,
            prizeDetails: {
                description: prizeDescription
            }
        });
        await application.save();

        // Send Email Alert
        await sendEmail(
            'contact@sportsprophecyapp.com',
            'New Prize Application Submitted',
            `A new prize application has been submitted by ${application.sponsorName}.\n\nPrize: ${prizeDescription}\nContact: ${application.contactEmail}\n\nPlease check the Admin Panel to approve.`
        );

        res.json({ success: true, message: 'Application submitted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Chat Room Endpoints ---


// --- Admin Endpoints ---

// Get Moderators
// Admin: Get All Moderators
// --- Analytics Endpoint ---
app.get('/api/admin/analytics', authenticateToken, authorize('can_view_api_stats'), async (req, res) => {
    try {
        await dbConnect();
        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // Helper for date ranges
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // 1. User Growth Stats
        const [totalUsers, newUsers7d, newUsers30d, referralUsers30d] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, referredBy: { $ne: null } })
        ]);

        const organicUsers30d = newUsers30d - referralUsers30d;
        // Avoid division by zero
        const organicRate = newUsers30d > 0 ? ((organicUsers30d / newUsers30d) * 100).toFixed(1) : 0;
        const referralRate = newUsers30d > 0 ? ((referralUsers30d / newUsers30d) * 100).toFixed(1) : 0;

        // 2. Engagement Stats (DAU/MAU)
        // DAU: Users who logged in today
        const dau = await User.countDocuments({ lastLoginDate: { $gte: startOfDay } });
        // MAU: Users who logged in within the last 30 days
        const mau = await User.countDocuments({ lastLoginDate: { $gte: thirtyDaysAgo } });

        // Predictions/User (last 7 days)
        // We only care about active users (DAU/MAU proxy) or just total predictions / total users?
        // Let's do: Total Predictions (7d) / Active Users (7d)
        const activeUsers7d = await User.countDocuments({ lastLoginDate: { $gte: sevenDaysAgo } });
        const predictions7d = await Prediction.countDocuments({ timestamp: { $gte: sevenDaysAgo } });
        const avgPredsPerUser = activeUsers7d > 0 ? (predictions7d / activeUsers7d).toFixed(1) : 0;

        // 3. Retention (Day 3 Proxy)
        // Find users created between 3-4 days ago
        const day3Start = new Date();
        day3Start.setDate(day3Start.getDate() - 3);
        day3Start.setHours(0, 0, 0, 0);
        const day3End = new Date(day3Start);
        day3End.setHours(23, 59, 59, 999);

        const usersCreated3DaysAgo = await User.countDocuments({
            createdAt: { $gte: day3Start, $lte: day3End }
        });

        // Of those users, how many logged in TODAY?
        // Note: This is strict "Day 3 Retention".
        // A wider net might be "logged in recently", but strict is better for the metric.
        // Actually, MongoDB join is hard here without $lookup.
        // Let's do a two-step find for accuracy since cohort size is small.
        const cohortUsers = await User.find({
            createdAt: { $gte: day3Start, $lte: day3End }
        }).select('_id lastLoginDate');

        let retainedCount = 0;
        cohortUsers.forEach(u => {
            if (u.lastLoginDate && u.lastLoginDate >= startOfDay) {
                retainedCount++;
            }
        });

        const day3RetentionRate = usersCreated3DaysAgo > 0
            ? ((retainedCount / usersCreated3DaysAgo) * 100).toFixed(1)
            : 0;

        // 4. Prize & Leaderboard
        const prizeEntries30d = await DrawEntry.countDocuments({ enteredAt: { $gte: thirtyDaysAgo } });
        // Estimate unique users entering draws (approximate if simple count, or use distinct)
        const uniqueDrawUsers = (await DrawEntry.find({ enteredAt: { $gte: thirtyDaysAgo } }).distinct('userId')).length;
        const prizeEntryRate = mau > 0 ? ((uniqueDrawUsers / mau) * 100).toFixed(1) : 0;

        res.json({
            growth: {
                totalUsers,
                newUsers7d,
                newUsers30d,
                referralRate,
                organicRate
            },
            engagement: {
                dau,
                mau,
                avgPredsPerUser,
                predictions7d
            },
            retention: {
                day3RetentionRate,
                cohortSize: usersCreated3DaysAgo,
                uniqueDrawUsers,
                prizeEntryRate
            }
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

// Language Analytics Endpoint
app.get('/api/admin/analytics/languages', authenticateToken, authorize('can_view_api_stats'), async (req, res) => {
    try {
        await dbConnect();

        // Aggregate language statistics
        const languageStats = await User.aggregate([
            {
                $match: {
                    deviceLanguage: { $ne: null, $exists: true }
                }
            },
            {
                $group: {
                    _id: '$deviceLanguage',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Aggregate region statistics
        const regionStats = await User.aggregate([
            {
                $match: {
                    deviceRegion: { $ne: null, $exists: true }
                }
            },
            {
                $group: {
                    _id: '$deviceRegion',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Total users with language data
        const totalWithLanguageData = await User.countDocuments({
            deviceLanguage: { $ne: null, $exists: true }
        });

        // Total users
        const totalUsers = await User.countDocuments({});

        res.json({
            totalUsers,
            totalWithLanguageData,
            languages: languageStats.map(stat => ({
                language: stat._id,
                count: stat.count,
                percentage: ((stat.count / totalWithLanguageData) * 100).toFixed(1)
            })),
            regions: regionStats.map(stat => ({
                region: stat._id,
                count: stat.count,
                percentage: ((stat.count / totalWithLanguageData) * 100).toFixed(1)
            }))
        });

    } catch (error) {
        console.error('Error fetching language analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin User Analytics
app.get('/api/admin/analytics/users', authenticateToken, authorize('can_view_api_stats'), async (req, res) => {
    try {
        await dbConnect();
        const { search, limit = 50 } = req.query;

        const matchStage = {};
        if (search) {
            matchStage.$or = [
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { uuid: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'predictions',
                    localField: 'uuid',
                    foreignField: 'userId',
                    as: 'predictions'
                }
            },
            {
                $lookup: {
                    from: 'drawentries',
                    localField: 'uuid',
                    foreignField: 'userId',
                    as: 'drawEntries'
                }
            },
            {
                $project: {
                    username: 1,
                    email: 1,
                    uuid: 1,
                    createdAt: 1,
                    loginStreak: 1,
                    lastLoginDate: 1,
                    tokens: 1,
                    crowns: 1,
                    predictionCount: { $size: '$predictions' },
                    drawEntryCount: { $size: '$drawEntries' }
                }
            }
        ]);

        res.json(users);
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/moderators', authenticateToken, authorize('can_manage_roles'), async (req, res) => {
    try {
        await dbConnect();
        const moderators = await User.find({
            role: { $in: ['moderator', 'admin'] },
            // Exclude super-admin from the list (permanent admin, cannot be demoted)
            email: { $ne: ADMIN_EMAIL }
        }).select('username email role');
        res.json({ moderators });
    } catch (error) {
        console.error('Error fetching moderators:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get All Users with Search
app.get('/api/admin/users', authenticateToken, authorize('can_manage_users'), async (req, res) => {
    try {
        await dbConnect();
        const { search = '', limit = 50, skip = 0 } = req.query;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { uuid: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query)
            .select('uuid username email tokens crowns createdAt lastLogin role banned')
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort({ createdAt: -1 });

        // Get additional stats for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const predictionsMade = await Prediction.countDocuments({ userId: user.uuid });
            const drawEntries = await DrawEntry.countDocuments({ userId: user.uuid });

            return {
                uuid: user.uuid,
                username: user.username,
                email: user.email,
                tokens: user.tokens,
                crowns: user.crowns,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                predictionsMade,
                drawEntries,
                role: user.role,
                banned: user.banned
            };
        }));

        const total = await User.countDocuments(query);

        res.json({ users: usersWithStats, total });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get All Winners
app.get('/api/admin/winners', authenticateToken, authorize('can_manage_sponsors'), async (req, res) => {
    try {
        await dbConnect();
        const winners = await Winner.find({}).sort({ wonAt: -1 });
        res.json({ winners });
    } catch (error) {
        console.error('Error fetching winners:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update User Balance
app.post('/api/admin/update-user-balance', authenticateToken, authorize('can_manage_users'), async (req, res) => {
    try {
        await dbConnect();
        const { userId, tokens, crowns } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const updateData = {};
        if (tokens !== undefined) updateData.tokens = parseInt(tokens);
        if (crowns !== undefined) updateData.crowns = parseInt(crowns);

        const user = await User.findOneAndUpdate(
            { uuid: userId },
            updateData,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User balance updated successfully',
            user: {
                uuid: user.uuid,
                username: user.username,
                tokens: user.tokens,
                crowns: user.crowns
            }
        });
    } catch (error) {
        console.error('Error updating user balance:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Delete Winner
app.post('/api/admin/delete-winner', authenticateToken, authorize('can_manage_sponsors'), async (req, res) => {
    try {
        await dbConnect();
        const { winnerId } = req.body;

        if (!winnerId) {
            return res.status(400).json({ error: 'Winner ID is required' });
        }

        const winner = await Winner.findByIdAndDelete(winnerId);

        if (!winner) {
            return res.status(404).json({ error: 'Winner not found' });
        }

        res.json({ success: true, message: 'Winner deleted successfully' });
    } catch (error) {
        console.error('Error deleting winner:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Role Permission Management ---

// Get all role permissions
app.get('/api/admin/role-permissions', authenticateToken, async (req, res, next) => {
    // We can't use authorize() yet because it depends on the collection being seeded
    // But we can check if it's admin role for this specific bootstrap endpoint
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
}, async (req, res) => {
    try {
        await dbConnect();
        const perms = await RolePermission.find({});
        res.json(perms);
    } catch (error) {
        console.error('Error fetching role permissions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update role permissions
app.post('/api/admin/role-permissions', authenticateToken, async (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
}, async (req, res) => {
    try {
        await dbConnect();
        const { role, permissions } = req.body;

        if (!['user', 'moderator', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const rolePerms = await RolePermission.findOneAndUpdate(
            { role },
            { permissions, updatedAt: new Date() },
            { new: true, upsert: true }
        );

        res.json({ message: `Permissions for ${role} updated`, rolePerms });
    } catch (error) {
        console.error('Error updating role permissions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Set User Role
app.post('/api/admin/set-role', authenticateToken, authorize('can_manage_roles'), async (req, res) => {
    try {
        await dbConnect();
        const { targetEmail, targetUuid, newRole } = req.body;

        if (!['user', 'moderator', 'admin'].includes(newRole)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Restriction: ONLY Admins can promote someone to Admin
        if (newRole === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only administrators can promote others to admin status.' });
        }

        let user;
        if (targetUuid) {
            user = await User.findOne({ uuid: targetUuid });
        } else if (targetEmail) {
            user = await User.findOne({ email: targetEmail });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // SUPER-ADMIN PROTECTION: Prevent any role changes to the super-admin account
        if (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            return res.status(403).json({
                error: 'Cannot modify super-admin role. This account has permanent administrator privileges.'
            });
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
app.post('/api/admin/ban-user', authenticateToken, authorize('can_ban_users'), async (req, res) => {
    try {
        await dbConnect();
        const { targetEmail, targetUuid, banned } = req.body;

        let user;
        if (targetUuid) {
            user = await User.findOne({ uuid: targetUuid });
        } else if (targetEmail) {
            user = await User.findOne({ email: targetEmail });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isBanned = banned;
        await user.save();

        res.json({ message: `User ${banned ? 'banned' : 'unbanned'} successfully` });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mute/Unmute User
app.post('/api/admin/mute-user', authenticateToken, authorize('can_mute_users'), async (req, res) => {
    try {
        await dbConnect();
        const { targetEmail, targetUuid, muted } = req.body;

        let user;
        if (targetUuid) {
            user = await User.findOne({ uuid: targetUuid });
        } else if (targetEmail) {
            user = await User.findOne({ email: targetEmail });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isMuted = muted;
        console.log(`[MOD] Setting mute status for ${user.email} (uuid: ${user.uuid}) to: ${muted}`);

        if (!muted) {
            user.needsWarningAcknowledge = false;
            user.pendingWarningMessage = null;
            user.roomBans = []; // Clear room bans as part of a full unmute/restore
        }

        await user.save();
        res.json({ success: true, message: `User ${muted ? 'muted' : 'unmuted'} successfully` });
    } catch (error) {
        console.error('Error muting user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Kick/Ban User from Room
app.post('/api/admin/kick-user', authenticateToken, authorize('can_kick_users'), async (req, res) => {
    try {
        await dbConnect();
        const { targetEmail, targetUuid, roomId } = req.body;

        let user;
        if (targetUuid) {
            user = await User.findOne({ uuid: targetUuid });
        } else if (targetEmail) {
            user = await User.findOne({ email: targetEmail });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.roomBans) user.roomBans = [];
        if (!user.roomBans.includes(roomId)) {
            user.roomBans.push(roomId);
            await user.save();
        }

        res.json({ message: `User removed from room successfully` });
    } catch (error) {
        console.error('Error kicking user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Pending Sponsors
app.get('/api/admin/sponsors/pending', authenticateToken, authorize('can_manage_sponsors'), async (req, res) => {
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
app.post('/api/admin/sponsors/:id/approve', authenticateToken, authorize('can_manage_sponsors'), async (req, res) => {
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
app.post('/api/admin/sponsors/:id/reject', authenticateToken, authorize('can_manage_sponsors'), async (req, res) => {
    try {
        await dbConnect();
        await Sponsor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Sponsor rejected and removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Hold Sponsor
app.post('/api/admin/sponsors/:id/hold', authenticateToken, authorize('can_manage_sponsors'), async (req, res) => {
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
app.delete('/api/admin/sponsors/:id', authenticateToken, authorize('can_manage_sponsors'), async (req, res) => {
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
app.get('/api/admin/sponsors/active', authenticateToken, authorize('can_manage_sponsors'), async (req, res) => {
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
app.post('/api/admin/sponsors/:id/deactivate', authenticateToken, authorize('can_manage_sponsors'), async (req, res) => {
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
            return res.status(403).json({ error: 'Incorrect password' });
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
        // Verify user owns this account
        if (req.user.uuid !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await User.findOneAndUpdate({ uuid: userId }, { notificationsEnabled: enabled });
        res.json({ success: true, notificationsEnabled: enabled });
    } catch (error) {
        console.error('Notification settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});
// Update User Profile (Consolidated)
app.patch('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        await dbConnect();
        const { idName, profilePicture, selectedBadge } = req.body;
        const userUuid = req.user.uuid;

        const updateData = {};
        if (idName !== undefined) {
            if (idName.length < 3) return res.status(400).json({ error: 'Name too short' });
            updateData.idName = idName;
        }
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        if (selectedBadge !== undefined) updateData.selectedBadge = selectedBadge;

        const user = await User.findOneAndUpdate(
            { uuid: userUuid },
            { $set: updateData },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ success: true, user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Backward compatibility or dedicated name change if tokens are needed
app.post('/api/user/change-idname', authenticateToken, async (req, res) => {
    try {
        await dbConnect();
        const { userId, newIdName } = req.body; // from api.js call

        // Verify user
        if (req.user.uuid !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const user = await User.findOne({ uuid: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // First change is free if they haven't set an idName yet, or it's still their default username
        const currentIdName = user.idName ? user.idName.trim().toLowerCase() : null;
        const currentUsername = user.username ? user.username.trim().toLowerCase() : null;
        const isFirstTime = !user.idName || currentIdName === currentUsername;
        const cost = isFirstTime ? 0 : 50;

        // Check tokens
        if (user.tokens < cost) {
            return res.status(400).json({ error: 'Insufficient tokens' });
        }

        // Check uniqueness of the new name
        // idName should be case-insensitive for uniqueness check usually, but let's stick to exact match for now to avoid breaking existing users
        const nameTaken = await User.findOne({
            idName: { $regex: new RegExp(`^${newIdName}$`, 'i') },
            uuid: { $ne: userId }
        });

        if (nameTaken) {
            return res.status(400).json({ error: 'This ID Name is already taken' });
        }

        user.idName = newIdName;
        user.tokens -= cost;
        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        console.error('Change idname error:', error);
        res.status(500).json({ error: 'Failed to update ID name' });
    }
});

// Delete Account Endpoint
app.delete('/api/user/delete', authenticateToken, async (req, res) => {
    try {
        await dbConnect();
        const userUuid = req.user.uuid; // From JWT

        // Find user first
        const user = await User.findOne({ uuid: userUuid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = user._id; // Get MongoDB ID for other deletions if needed

        // Delete associated data
        await Promise.all([
            // Delete user record
            User.findByIdAndDelete(userId),
            // Delete chat messages sent by user
            Chat.deleteMany({ sender_id: user.uuid }),
            // Delete predictions
            Prediction.deleteMany({ userId: user.uuid }),
            // Delete draw entries
            DrawEntry.deleteMany({ userId: user.uuid }),
            // Delete notifications
            Notification.deleteMany({ userId: user.uuid })
        ]);

        console.log(`✅ User account deleted: ${user.email} (${user.uuid})`);
        res.json({ success: true, message: 'Account permanently deleted' });

    } catch (error) {
        console.error('❌ Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
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

        // Check permissions: Must be room creator OR have can_delete_rooms permission
        const isCreator = room.createdBy === userId;
        let hasDeletePermission = false;
        try {
            const rolePerms = await RolePermission.findOne({ role: req.user.role });
            if (rolePerms && rolePerms.permissions) {
                // Robust Map vs Object check
                if (typeof rolePerms.permissions.get === 'function') {
                    hasDeletePermission = rolePerms.permissions.get('can_delete_rooms') === true;
                } else {
                    hasDeletePermission = rolePerms.permissions.can_delete_rooms === true;
                }
            }
        } catch (err) {
            console.error('[ROOM DELETE] Permission check failed:', err);
        }
        if (!isCreator && !hasDeletePermission) {
            return res.status(403).json({ error: 'Only room creator or authorized moderators can delete this room' });
        }

        // Prevent deletion of General/Lobby room (if it has a specific name or ID)
        if (room.name === 'General' || room.name === 'Lobby') {
            return res.status(400).json({ error: 'Cannot delete the General/Lobby room' });
        }

        // Delete all messages in the room
        await Chat.deleteMany({ roomId: id });

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
app.post('/api/admin/emergency/fix-referral', async (req, res) => {
    try {
        await dbConnect();
        const { email, newCode, secret } = req.body;

        if (secret !== 'EMERGENCY_FIX_2025_SECURE') {
            return res.status(403).json({ error: 'Invalid secret' });
        }

        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const oldCode = user.referralCode;

        // Force update (bypass schema validation if needed using mongoose update directly)
        await User.updateOne(
            { _id: user._id },
            { $set: { referralCode: newCode, badges: [...user.badges, '🛠️ FixedCode'] } }
        );

        res.json({
            success: true,
            message: 'Referral code updated (Force)',
            email: user.email,
            oldCode: oldCode,
            newCode: newCode
        });

    } catch (error) {
        console.error('Emergency fix error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/notify', authenticateToken, authorize('can_send_notifications'), async (req, res) => {
    try {
        await dbConnect();
        const { message, targetUserId, requireAcknowledge = true } = req.body; // targetUserId can be null/'all'

        await Notification.create({
            userId: targetUserId || 'all',
            message,
            type: 'admin',
            timestamp: new Date()
        });

        // Auto-Mute until Acknowledge for targeted warnings
        // Skip if requireAcknowledge is false (e.g. for unmute restoration messages)
        if (requireAcknowledge && targetUserId && targetUserId !== 'all') {
            await User.updateOne(
                { uuid: targetUserId },
                {
                    needsWarningAcknowledge: true,
                    pendingWarningMessage: message // Store the message directly on user for backup delivery
                }
            );
        }

        res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/notifications/acknowledge', authenticateToken, async (req, res) => {
    try {
        await dbConnect();
        await User.updateOne(
            { uuid: req.user.uuid },
            {
                needsWarningAcknowledge: false,
                pendingWarningMessage: null
            }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Notifications for User
app.get('/api/notifications/:userId', authenticateToken, async (req, res) => {
    try {
        await dbConnect();
        const { userId } = req.params;

        // Fetch user to get their signup date
        const user = await User.findOne({ uuid: userId });
        const signupDate = user ? user.createdAt : new Date(0);

        // Filter: global messages must be:
        // 1. After user signed up
        // 2. Created in the last 7 days (prevents old messages from hanging around)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const notifications = await Notification.find({
            $or: [
                { userId: userId },
                {
                    userId: 'all',
                    timestamp: {
                        $gte: signupDate,
                        $gt: sevenDaysAgo
                    }
                }
            ]
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
