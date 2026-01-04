import express from 'express';
import cors from 'cors';
import authRoutes from './shared/auth/routes';
import announcementRoutes from './shared/announcements/routes';

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'https://sportsprophecyapp.com',
    'https://www.sportsprophecyapp.com'
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms/:roomId/announcements', announcementRoutes);

export default app;
