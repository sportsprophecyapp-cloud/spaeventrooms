import express from 'express';
import cors from 'cors';
import authRoutes from './shared/auth/routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
