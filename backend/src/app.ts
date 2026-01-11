import express from 'express';
import cors from 'cors';
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

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/rooms/soccer/matches', matchRoutes);
app.use('/api/rooms/:roomId/announcements', announcementRoutes);
app.use('/api/rooms/:roomId/predictions', predictionRoutes);
app.use('/api/rooms/:roomId/sponsors', sponsorRoutes);
app.use('/api/rooms/:roomId/chat', chatRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/sponsor-subscriptions', sponsorSubscriptionRoutes);
app.use('/api/sponsor-applications', sponsorApplicationRoutes);

export default app;
