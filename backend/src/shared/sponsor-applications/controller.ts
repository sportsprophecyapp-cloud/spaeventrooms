import { Request, Response } from 'express';
import { query as dbQuery } from '../database';
import { AuthRequest } from '../auth/middleware';

// 1. PUBLIC: SUBMIT APPLICATION
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
            logo_url,
            prize_image_url,
            creative_config,
            agreed
        } = req.body;

        if (!brand_name || !contact_email || !prize_description) {
            console.error('[VALIDATION FAILED] Missing fields:', { brand_name: !!brand_name, contact_email: !!contact_email, prize_description: !!prize_description });
            return res.status(400).json({ success: false, error: 'Incomplete campaign details.', missing: { brand_name: !brand_name, contact_email: !contact_email, prize_description: !prize_description } });
        }

        const result = await dbQuery(
            `INSERT INTO sponsor_applications 
            (brand_name, contact_email, website_url, arena_target, frequency, prize_quantity, prize_description, logo_url, prize_image_url, creative_config, agreed_to_terms, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
            RETURNING id`,
            [
                brand_name,
                contact_email,
                website_url || null,
                arena_target || 'soccer',
                frequency || 'monthly',
                prize_quantity || 1,
                prize_description,
                logo_url || null,
                prize_image_url || null,
                JSON.stringify(creative_config || {}),
                agreed || false
            ]
        );

        res.json({ success: true, message: 'Campaign proposal received.', application_id: result.rows[0].id });
    } catch (error: any) {
        console.error('[SPONSOR SUBMIT ERROR]:', {
            message: error.message,
            detail: error.detail,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ success: false, error: 'Transmission failed.', detail: error.message });
    }
};

// 2. ADMIN: DEPLOY TO LIVE ARENA
export const approveApplication = async (req: AuthRequest, res: Response) => {
    try {
        const { appId } = req.params;
        const reviewerId = req.user?.id;

        // Fetch application details
        const appRes = await dbQuery('SELECT * FROM sponsor_applications WHERE id = $1', [appId]);
        if (appRes.rows.length === 0) return res.status(404).json({ error: 'Application not found' });

        const app = appRes.rows[0];

        // START_TRANSACTION
        await dbQuery('BEGIN');

        try {
            // 1. Create Room Sponsor placement
            const sponsorRes = await dbQuery(`
                INSERT INTO room_sponsors 
                (room_id, sponsor_name, logo_url, website_url, prize_description, application_id, is_active, prize_escrow_received)
                VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE)
                RETURNING id
            `, [app.arena_target, app.brand_name, app.logo_url, app.website_url, app.prize_description, appId]);

            const sponsorId = sponsorRes.rows[0].id;

            // 2. Create Prize Draw (Link to Sponsor + Image)
            await dbQuery(
                `INSERT INTO prize_draws (title, prize, description, room_id, status, sponsor_id, prize_image)
                 VALUES ($1, $2, $3, $4, 'active', $5, $6)`,
                [
                    `${app.brand_name} Giveaway`,
                    app.prize_description,
                    `Sponsored by ${app.brand_name}`,
                    app.arena_target,
                    sponsorId,
                    app.prize_image_url
                ]
            );

            // 3. Update Application Status
            await dbQuery(
                "UPDATE sponsor_applications SET status = 'approved', reviewed_at = NOW(), reviewed_by = $1 WHERE id = $2",
                [reviewerId, appId]
            );

            await dbQuery('COMMIT');
            res.json({ success: true, message: 'Partner is now LIVE!' });

        } catch (innerError) {
            await dbQuery('ROLLBACK');
            throw innerError;
        }

    } catch (error: any) {
        console.error('Approval/Deployment failed:', error);
        res.status(500).json({
            error: 'Deployment failed',
            details: error.message
        });
    }
};

// 3. ADMIN: GET PENDING APPLICATIONS
export const getApplications = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery("SELECT * FROM sponsor_applications WHERE status = 'pending' ORDER BY created_at DESC");
        res.json({ success: true, applications: result.rows });
    } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
};

export const getActiveSponsors = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery('SELECT * FROM room_sponsors WHERE is_active = TRUE');
        res.json({ success: true, sponsors: result.rows });
    } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
};

export const getAllSponsors = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery('SELECT * FROM room_sponsors ORDER BY created_at DESC');
        res.json({ success: true, sponsors: result.rows });
    } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
};

export const updateApplication = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const keys = Object.keys(updates);
        if (keys.length === 0) return res.status(400).json({ error: 'No updates provided' });

        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        await dbQuery(`UPDATE sponsor_applications SET ${setClause} WHERE id = $${keys.length + 1}`, [...Object.values(updates), id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Update failed' }); }
};

export const updateSponsor = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const keys = Object.keys(updates);
        if (keys.length === 0) return res.status(400).json({ error: 'No updates provided' });

        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        await dbQuery(`UPDATE room_sponsors SET ${setClause} WHERE id = $${keys.length + 1}`, [...Object.values(updates), id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Update failed' }); }
};

export const deleteApplication = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await dbQuery('DELETE FROM sponsor_applications WHERE id = $1', [id]);
        res.json({ success: true, message: 'Application removed.' });
    } catch (err) {
        console.error('Delete application failed:', err);
        res.status(500).json({ error: 'Delete failed' });
    }
};

export const deleteSponsor = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await dbQuery('DELETE FROM room_sponsors WHERE id = $1', [id]);
        res.json({ success: true, message: 'Placement removed.' });
    } catch (err) {
        console.error('Delete placement failed:', err);
        res.status(500).json({ error: 'Delete failed' });
    }
};

export const generateInvoice = async (req: Request, res: Response) => res.json({ success: true });
export const markPaymentPaid = async (req: Request, res: Response) => res.json({ success: true });
