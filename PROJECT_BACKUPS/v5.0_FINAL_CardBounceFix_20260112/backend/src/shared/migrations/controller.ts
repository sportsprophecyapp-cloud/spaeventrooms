import { Request, Response } from 'express';
import { query as dbQuery } from '../database';

/**
 * Admin-only endpoint to run database migrations
 * This creates the sponsor_analytics table if it doesn't exist
 */
export const runSponsorAnalyticsMigration = async (req: Request, res: Response) => {
    try {
        console.log('[MIGRATION] Starting sponsor_analytics table migration...');

        // Create the table
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS sponsor_analytics (
                id SERIAL PRIMARY KEY,
                sponsor_id INTEGER NOT NULL,
                event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('impression', 'click')),
                room_id VARCHAR(100),
                match_id VARCHAR(100),
                user_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE CASCADE
            )
        `);

        console.log('[MIGRATION] Table created successfully');

        // Create indexes
        await dbQuery(`CREATE INDEX IF NOT EXISTS idx_sponsor_analytics_sponsor_id ON sponsor_analytics(sponsor_id)`);
        await dbQuery(`CREATE INDEX IF NOT EXISTS idx_sponsor_analytics_event_type ON sponsor_analytics(event_type)`);
        await dbQuery(`CREATE INDEX IF NOT EXISTS idx_sponsor_analytics_created_at ON sponsor_analytics(created_at)`);

        console.log('[MIGRATION] Indexes created successfully');

        res.json({
            success: true,
            message: 'sponsor_analytics table migration completed successfully'
        });
    } catch (err: any) {
        console.error('[MIGRATION ERROR]:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
