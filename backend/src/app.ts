import express from 'express';
import cors from 'cors';
import authRoutes from './shared/auth/routes';

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

app.use('/api/auth', authRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
