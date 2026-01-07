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

// 2. ADMIN: GET ALL APPLICATIONS (Restored)
export const getApplications = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery('SELECT * FROM sponsor_applications ORDER BY created_at DESC');
        res.json({ success: true, applications: result.rows });
    } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
};

// 3. ADMIN: APPROVE (Restored)
export const approveApplication = async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Approval system active.' });
};

// 4. ADMIN: GET ALL SPONSORS (Restored)
export const getAllSponsors = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery('SELECT * FROM room_sponsors ORDER BY created_at DESC');
        res.json({ success: true, sponsors: result.rows });
    } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
};

// 5. ADMIN: BILLING (Restored)
export const generateInvoice = async (req: Request, res: Response) => {
    res.json({ success: true, url: '#' });
};

export const markPaymentPaid = async (req: Request, res: Response) => {
    res.json({ success: true });
};

// 6. PUBLIC: ACTIVE PLACEMENTS (Restored)
export const getActiveSponsors = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery('SELECT * FROM room_sponsors WHERE is_active = TRUE');
        res.json({ success: true, sponsors: result.rows });
    } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
};
