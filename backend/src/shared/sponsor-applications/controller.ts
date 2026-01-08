import { Request, Response } from 'express';
import { query as dbQuery } from '../database';
import { notifyNewSponsorActivity } from '../services/notificationService';

// 1. PUBLIC: SUBMIT APPLICATION (Sandbox)
export const submitApplication = async (req: Request, res: Response) => {
    try {
        const { brand_name, contact_email, website_url, arena_target, frequency, prize_quantity, prize_description, logo_url, prize_image_url, agreed } = req.body;

        if (!brand_name || !contact_email || !prize_description) {
            return res.status(400).json({ success: false, error: 'Incomplete campaign details.' });
        }

        const result = await dbQuery(
            `INSERT INTO sponsor_applications 
            (brand_name, contact_email, website_url, arena_target, frequency, prize_quantity, prize_description, logo_url, prize_image_url, agreed_to_terms, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
            RETURNING id`,
            [brand_name, contact_email, website_url, arena_target || 'soccer', frequency || 'monthly', prize_quantity || 1, prize_description, logo_url, prize_image_url, agreed]
        );

        await notifyNewSponsorActivity('APPLICATION', { brand_name, contact_email, arena_target, frequency, prize_description });

        res.json({ success: true, message: 'Campaign proposal received.', application_id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Transmission failed.' });
    }
};

// 2. ADMIN: DEPLOY TO LIVE ARENA (Instant Verification)
export const approveApplication = async (req: Request, res: Response) => {
    try {
        const { appId } = req.params;

        // Fetch application details
        const appRes = await dbQuery('SELECT * FROM sponsor_applications WHERE id = $1', [appId]);
        if (appRes.rows.length === 0) return res.status(404).json({ error: 'App not found' });
        
        const app = appRes.rows[0];

        // Transfer to live Sponsors table
        await dbQuery(`
            INSERT INTO room_sponsors 
            (room_id, sponsor_name, logo_url, website_url, prize_description, is_active, prize_escrow_received)
            VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
        `, [app.arena_target, app.brand_name, app.logo_url, app.website_url, app.prize_description]);

        // Mark app as approved
        await dbQuery("UPDATE sponsor_applications SET status = 'approved' WHERE id = $1", [appId]);

        res.json({ success: true, message: 'Partner is now LIVE!' });
    } catch (error) {
        res.status(500).json({ error: 'Deployment failed' });
    }
};

// 3. ADMIN: GET ALL APPLICATIONS
export const getApplications = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery("SELECT * FROM sponsor_applications WHERE status = 'pending' ORDER BY created_at DESC");
        res.json({ success: true, applications: result.rows });
    } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
};

// ... keep other admin functions for build stability
export const getAllSponsors = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery('SELECT * FROM room_sponsors ORDER BY created_at DESC');
        res.json({ success: true, sponsors: result.rows });
    } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
};

export const generateInvoice = async (req: Request, res: Response) => { res.json({ success: true }); };
export const markPaymentPaid = async (req: Request, res: Response) => { res.json({ success: true }); };
export const getActiveSponsors = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery('SELECT * FROM room_sponsors WHERE is_active = TRUE');
        res.json({ success: true, sponsors: result.rows });
    } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
};
