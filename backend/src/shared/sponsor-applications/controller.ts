import { Request, Response } from 'express';
import { query as dbQuery, getClient as dbGetClient } from '../database';
import { AuthRequest } from '../auth/middleware';

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any // Force verify version compatibility or upgrade package later
});

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
            agreed,
            package_tier // New Field
        } = req.body;

        if (!brand_name || !contact_email || !prize_description) {
            console.error('[VALIDATION FAILED] Missing fields:', { brand_name: !!brand_name, contact_email: !!contact_email, prize_description: !!prize_description });
            return res.status(400).json({ success: false, error: 'Incomplete campaign details.', missing: { brand_name: !brand_name, contact_email: !contact_email, prize_description: !prize_description } });
        }

        // Tier Pricing Map
        const TIER_PRICES: Record<string, number> = {
            'tier_founding': 0, // Free
            'tier_starter': 9900, // $99.00
            'tier_growth': 29900, // $299.00
            'tier_premium': 59900 // $599.00
        };

        const priceAmount = TIER_PRICES[package_tier] !== undefined ? TIER_PRICES[package_tier] : 9900; // Allow 0, default to 9900 only if undefined

        // Create Stripe Session
        let session = null;
        if (priceAmount > 0 && process.env.STRIPE_SECRET_KEY) {
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Sponsor Package: ${package_tier?.replace('tier_', '').toUpperCase() || 'STANDARD'}`,
                            description: `Campaign for ${brand_name} in ${arena_target || 'Soccer'} Arena`
                        },
                        unit_amount: priceAmount,
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${req.headers.origin}/sponsors/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}/sponsors/apply?tier=${package_tier}`,
            });
        }

        const result = await dbQuery(
            `INSERT INTO sponsor_applications 
            (brand_name, contact_email, website_url, arena_target, frequency, prize_quantity, prize_description, logo_url, prize_image_url, creative_config, agreed_to_terms, status, stripe_session_id, package_tier)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
                agreed || false,
                session ? 'pending_payment' : 'pending',
                session?.id || null,
                package_tier || 'tier_starter'
            ]
        );

        res.json({
            success: true,
            message: session ? 'Redirecting to payment...' : 'Campaign proposal received.',
            application_id: result.rows[0].id,
            checkoutUrl: session?.url // Frontend will redirect here
        });

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
    const { appId } = req.params;
    try {
        const reviewerId = req.user?.id;
        console.log(`[APPROVE] Starting approval for appId: ${appId}, reviewer: ${reviewerId}`);

        // Fetch application details
        const appRes = await dbQuery('SELECT * FROM sponsor_applications WHERE id = $1', [appId]);
        if (appRes.rows.length === 0) {
            console.error(`[APPROVE] Application ${appId} not found.`);
            return res.status(404).json({ error: 'Application not found' });
        }

        const app = appRes.rows[0];
        const tier = app.package_tier || 'tier_starter';
        console.log(`[APPROVE] Found application for brand: ${app.brand_name}, tier: ${tier}`);

        // VALIDATION: Founding package MUST have a prize
        if (tier === 'tier_founding' && !app.prize_description) {
            console.error(`[APPROVE] Founding Partner application ${appId} missing required prize description`);
            return res.status(400).json({
                error: 'Founding Partner package requires a prize draw. Prize description is mandatory.'
            });
        }

        // Use a dedicated client for the transaction
        const client = await dbGetClient();
        try {
            await client.query('BEGIN');

            console.log(`[APPROVE] Step 1: Creating room_sponsors record with tier: ${tier}...`);
            // 1. Create Room Sponsor placement with tier
            const sponsorRes = await client.query(`
                INSERT INTO room_sponsors 
                (room_id, sponsor_name, logo_url, website_url, prize_description, application_id, is_active, prize_escrow_received, package_tier)
                VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE, $7)
                RETURNING id
            `, [
                app.arena_target || 'soccer',
                app.brand_name,
                app.logo_url,
                app.website_url,
                app.prize_description,
                Number(appId),
                tier
            ]);

            const sponsorId = sponsorRes.rows[0].id;
            console.log(`[APPROVE] Created sponsorId: ${sponsorId}`);

            // 2. Create Prize Draw (MANDATORY for founding, optional for others)
            if (tier === 'tier_founding' || app.prize_description) {
                console.log(`[APPROVE] Step 2: Creating prize_draws record (30-day expiry)...`);
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

                await client.query(
                    `INSERT INTO prize_draws (title, prize, description, room_id, status, sponsor_id, prize_image, draw_date)
                     VALUES ($1, $2, $3, $4, 'active', $5, $6, $7)`,
                    [
                        `${app.brand_name} Giveaway`.substring(0, 250),
                        app.prize_description,
                        tier === 'tier_founding'
                            ? `🏆 Founding Partner Prize - Sponsored by ${app.brand_name}`
                            : `Sponsored by ${app.brand_name}`,
                        app.arena_target || 'soccer',
                        sponsorId,
                        app.prize_image_url,
                        thirtyDaysFromNow.toISOString()
                    ]
                );
                console.log(`[APPROVE] Prize draw created for ${tier}`);
            } else {
                console.log(`[APPROVE] Skipping prize draw creation (not required for ${tier})`);
            }

            console.log(`[APPROVE] Step 3: Updating application status...`);
            // 3. Update Application Status
            await client.query(
                "UPDATE sponsor_applications SET status = 'approved', reviewed_at = NOW(), reviewed_by = $1 WHERE id = $2",
                [reviewerId ? Number(reviewerId) : null, Number(appId)]
            );

            await client.query('COMMIT');
            console.log(`[APPROVE] Transaction COMMITTED for appId: ${appId}`);

            const message = tier === 'tier_founding'
                ? '🏆 Founding Partner is now LIVE!'
                : 'Partner is now LIVE!';
            res.json({ success: true, message });

        } catch (innerError: any) {
            console.error(`[APPROVE] Transaction failed:`, innerError.message);
            await client.query('ROLLBACK');
            throw innerError;
        } finally {
            client.release();
        }

    } catch (error: any) {
        console.error('[APPROVE] Approval/Deployment failed:', {
            error: error.message,
            stack: error.stack,
            appId: appId
        });
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
        // Clean up linked live sponsors (banners) first
        await dbQuery('DELETE FROM room_sponsors WHERE application_id = $1', [id]);
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

// 4. PUBLIC/INTERNAL: VERIFY PAYMENT
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { session_id } = req.body;
        if (!session_id) return res.status(400).json({ success: false, error: 'Session ID required' });

        // Retrieve session directly from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            // Update DB
            await dbQuery(
                `UPDATE sponsor_applications 
                 SET status = 'pending_approval'
                 WHERE stripe_session_id = $1`,
                [session_id]
            );
            return res.json({ success: true, message: 'Payment confirmed.' });
        } else {
            return res.json({ success: false, message: 'Payment not completed.' });
        }

    } catch (error: any) {
        console.error('[PAYMENT VERIFY ERROR]:', error);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
};

// 5. ANALYTICS & TRACKING
export const trackEngagement = async (req: Request, res: Response) => {
    try {
        const { sponsor_id, event_type, room_id, match_id, user_id } = req.body;

        if (!sponsor_id || !event_type) {
            return res.status(400).json({ success: false, error: 'Sponsor ID and Event Type required' });
        }

        await dbQuery(
            `INSERT INTO sponsor_analytics (sponsor_id, event_type, room_id, match_id, user_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [sponsor_id, event_type, room_id, match_id, user_id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('[TRACK ERROR]:', err);
        // Fail silently to user but log error
        res.status(500).json({ success: false });
    }
};
