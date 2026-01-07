import { Request, Response } from 'express';
import { query as dbQuery } from '../database';
import { notifyNewSponsorActivity } from '../services/notificationService';

// MODERN SANDBOX APPLICATION (v2.16 Sync)
export const submitApplication = async (req: Request, res: Response) => {
    try {
        const {
            brand_name,
            contact_email,
            website_url,
            arena_target,
            frequency,
            prize_quantity,
            prize_description,
            logo_url, // For base64 or link from sandbox
            prize_image_url,
            agreed
        } = req.body;

        // 1. Validation
        if (!brand_name || !contact_email || !prize_description) {
            return res.status(400).json({ success: false, error: 'Incomplete campaign details.' });
        }

        if (!agreed) {
            return res.status(400).json({ success: false, error: 'Escrow agreement required.' });
        }

        // 2. Insert into NEW sponsor_applications table
        const result = await dbQuery(
            `INSERT INTO sponsor_applications 
            (brand_name, contact_email, website_url, arena_target, frequency, prize_quantity, prize_description, logo_url, prize_image_url, agreed_to_terms, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
            RETURNING id`,
            [
                brand_name,
                contact_email,
                website_url,
                arena_target || 'soccer',
                frequency || 'monthly',
                prize_quantity || 1,
                prize_description,
                logo_url,
                prize_image_url,
                agreed
            ]
        );

        // 3. TRIGGER ADMIN ALERT
        await notifyNewSponsorActivity('APPLICATION', {
            brand_name,
            contact_email,
            arena_target,
            frequency,
            prize_description
        });

        res.json({
            success: true,
            message: 'Campaign strategy received. Our team will verify your digital escrow within 24 hours.',
            application_id: result.rows[0].id
        });

    } catch (error) {
        console.error('❌ Sandbox Submission Error:', error);
        res.status(500).json({ success: false, error: 'Transmission failed.' });
    }
};

// ... keep other admin functions but sync their schema later if needed
export const getApplications = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery('SELECT * FROM sponsor_applications ORDER BY created_at DESC');
        res.json({ success: true, applications: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};
