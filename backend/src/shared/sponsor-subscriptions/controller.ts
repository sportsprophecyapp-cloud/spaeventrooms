import { Response, Request } from 'express';
import { AuthRequest } from '../auth/middleware';
import { stripe, SPONSOR_TIERS } from '../stripe/client';
import { query } from '../database';

// Configuration for Admin Alerts
const ADMIN_EMAIL = 'sportsprophecyapp@gmail.com';

/**
 * Helper to send internal alerts (Simulated or via Mailer)
 */
async function sendAdminAlert(subject: string, body: string) {
    console.log(`📩 ALERT to ${ADMIN_EMAIL}: [${subject}] - ${body}`);
    // In production, you would integrate Nodemailer or SendGrid here
}

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
    const { tier, sponsorId } = req.body;

    if (!tier || !SPONSOR_TIERS[tier as keyof typeof SPONSOR_TIERS]) {
        return res.status(400).json({ message: 'Invalid tier' });
    }

    const tierConfig = SPONSOR_TIERS[tier as keyof typeof SPONSOR_TIERS];

    try {
        const sponsorResult = await query('SELECT * FROM room_sponsors WHERE id = $1', [sponsorId]);
        if (sponsorResult.rows.length === 0) return res.status(404).json({ message: 'Sponsor not found' });

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: tierConfig.priceId, quantity: 1 }],
            success_url: `${process.env.FRONTEND_URL}/admin/sponsors/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/admin/sponsors`,
            metadata: { sponsorId: sponsorId.toString(), tier },
        });

        // Notify Admin that someone is checking out
        sendAdminAlert('Sponsor Checkout Started', `Sponsor ID ${sponsorId} has started checkout for ${tier} tier.`);

        res.json({ url: session.url });
    } catch (err) {
        console.error('Error creating checkout session:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const handleWebhook = async (req: any, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const { sponsorId, tier } = session.metadata;
        
        // AUTO-ACTIVATE SPONSOR ON PAYMENT
        await query(
            `UPDATE room_sponsors SET is_active = true WHERE id = $1`,
            [sponsorId]
        );

        await query(
            `INSERT INTO sponsor_subscriptions (sponsor_id, tier, stripe_subscription_id, status, expires_at)
             VALUES ($1, $2, $3, 'active', NOW() + INTERVAL '1 month')`,
            [sponsorId, tier, session.subscription]
        );

        sendAdminAlert('✅ PAYMENT CONFIRMED', `Sponsor ${sponsorId} has paid for ${tier} tier. Ad is now LIVE.`);
    }

    res.json({ received: true });
};

export const getActivePlacements = async (req: AuthRequest, res: Response) => {
    const { page } = req.params;
    try {
        const result = await query(`
            SELECT rs.* FROM room_sponsors rs
            JOIN sponsor_subscriptions ss ON rs.id = ss.sponsor_id
            WHERE (rs.room_id = $1 OR rs.room_id = 'global') 
            AND rs.is_active = true AND ss.status = 'active'
            AND ss.expires_at > NOW()
        `, [page]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ... existing admin methods kept intact ...
export const getAllSponsorSubscriptions = async (req: Request, res: Response) => { /* ... */ };
export const getSponsorSubscription = async (req: Request, res: Response) => { /* ... */ };
export const toggleSponsorActive = async (req: Request, res: Response) => { /* ... */ };
export const getSponsorsByStatus = async (req: Request, res: Response) => { /* ... */ };
