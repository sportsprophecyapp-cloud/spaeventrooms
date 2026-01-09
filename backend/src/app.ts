import express from 'express';
import cors from 'cors';
import authRoutes from './shared/auth/routes';
import adminRoutes from './shared/admin/routes';
import badgeRoutes from './shared/badges/routes'; // NEW
import moderationRoutes from './shared/moderation/routes';
// ... other imports

const app = express();

app.use(cors(/* ... */));
app.use(express.json());
app.get('/health', (req, res) => { /* ... */ });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/badges', badgeRoutes); // NEW
app.use('/api/moderation', moderationRoutes);
// ... other routes

export default app;
