import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './shared/auth/routes';
import adminRoutes from './shared/admin/routes';
import badgeRoutes from './shared/badges/routes';
import moderationRoutes from './shared/moderation/routes';
import announcementRoutes from './shared/announcements/routes';
import predictionRoutes from './shared/predictions/routes';
import sponsorRoutes from './shared/sponsors/routes';
import gamificationRoutes from './shared/gamification/routes';
import sponsorSubscriptionRoutes from './shared/sponsor-subscriptions/routes';
import sponsorApplicationRoutes from './shared/sponsor-applications/routes';
import chatRoutes from './shared/chat/routes';
import matchRoutes from './shared/matches/routes';
import migrationRoutes from './shared/migrations/routes';
import pulseRoutes from './shared/pulse/routes';

const app = express();

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. Strict CORS
const allowedOrigins = [
    'http://localhost:3000',
    'https://www.sportsprophecyapp.com',
    'https://sportsprophecyapp.com',
    process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// 3. Rate Limiting (100 req per 15 min)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300, // Adjusted to 300 for active app usage
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// 4. Payload Limits (Tiered)
// Allow larger uploads for sponsors (Base64 images)
app.use('/api/sponsor-applications', express.json({ limit: '50mb' }));
app.use('/api/sponsor-applications', express.urlencoded({ limit: '50mb', extended: true }));

// Default strict limit for everything else
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/rooms/:roomId/matches', matchRoutes);
app.use('/api/rooms/:roomId/announcements', announcementRoutes);
app.use('/api/rooms/:roomId/predictions', predictionRoutes);
app.use('/api/rooms/:roomId/sponsors', sponsorRoutes);
app.use('/api/rooms/:roomId/chat', chatRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/sponsor-subscriptions', sponsorSubscriptionRoutes);
app.use('/api/sponsor-applications', sponsorApplicationRoutes);
app.use('/api/migrations', migrationRoutes);
app.use('/api/pulse', pulseRoutes);

export default app;
