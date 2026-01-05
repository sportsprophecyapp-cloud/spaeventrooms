import { Response, Request } from 'express';
import { AuthRequest } from '../auth/middleware';
import { stripe, SPONSOR_TIERS } from '../stripe/client';
import { query } from '../database';

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
    const { tier, sponsorId } = req.body;

    if (!tier || !SPONSOR_TIERS[tier as keyof typeof SPONSOR_TIERS]) {
        return res.status(400).json({ message: 'Invalid tier' });
    }

    const tierConfig = SPONSOR_TIERS[tier as keyof typeof SPONSOR_TIERS];

    if (!tierConfig.priceId) {
        return res.status(400).json({ message: 'Tier not available for checkout. Contact us for custom pricing.' });
    }

    try {
        // Get sponsor details
        const sponsorResult = await query('SELECT * FROM room_sponsors WHERE id = $1', [sponsorId]);
        if (sponsorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Sponsor not found' });
        }

        const sponsor = sponsorResult.rows[0];

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: tierConfig.priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL}/admin/sponsors/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/admin/sponsors`,
            metadata: {
                sponsorId: sponsorId.toString(),
                tier,
            },
        });

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
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as any;
            await handleCheckoutComplete(session);
            break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const subscription = event.data.object as any;
            await handleSubscriptionChange(subscription);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

async function handleCheckoutComplete(session: any) {
    const { sponsorId, tier } = session.metadata;
    const subscriptionId = session.subscription;
    const customerId = session.customer;

    try {
        // Create subscription record
        await query(
            `INSERT INTO sponsor_subscriptions (sponsor_id, tier, stripe_subscription_id, stripe_customer_id, status, expires_at)
             VALUES ($1, $2, $3, $4, 'active', NOW() + INTERVAL '1 month')`,
            [sponsorId, tier, subscriptionId, customerId]
        );

        console.log(`✅ Subscription created for sponsor ${sponsorId}, tier: ${tier}`);
    } catch (err) {
        console.error('Error handling checkout complete:', err);
    }
}

async function handleSubscriptionChange(subscription: any) {
    const subscriptionId = subscription.id;
    const status = subscription.status;

    try {
        await query(
            'UPDATE sponsor_subscriptions SET status = $1 WHERE stripe_subscription_id = $2',
            [status, subscriptionId]
        );

        console.log(`✅ Subscription ${subscriptionId} updated to status: ${status}`);
    } catch (err) {
        console.error('Error handling subscription change:', err);
    }
}

export const getActivePlacements = async (req: AuthRequest, res: Response) => {
    const { page } = req.params;

    try {
        const result = await query(`
            SELECT sp.*, rs.name, rs.logo_url, rs.link_url, ss.tier
            FROM sponsor_placements sp
            JOIN room_sponsors rs ON sp.sponsor_id = rs.id
            JOIN sponsor_subscriptions ss ON sp.sponsor_id = ss.sponsor_id
            WHERE sp.page = $1 AND sp.is_active = true AND ss.status = 'active'
            ORDER BY sp.position ASC
        `, [page]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching placements:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get all sponsor subscriptions (for /admin/sponsors dashboard)
export const getAllSponsorSubscriptions = async (req: Request, res: Response) => {
    try {
        // Fetch all sponsors with their active subscriptions
        const result = await query(
            `
      SELECT 
        rs.id,
        rs.name,
        rs.logo_url,
        rs.link_url,
        rs.room_id,
        rs.is_active,
        ss.id as subscription_id,
        ss.tier,
        ss.status,
        ss.stripe_subscription_id,
        ss.stripe_customer_id,
        ss.started_at,
        ss.expires_at,
        CASE 
          WHEN ss.expires_at > NOW() THEN 'Active'
          WHEN ss.expires_at IS NULL THEN 'Pending'
          ELSE 'Expired'
        END as subscription_status,
        (ss.expires_at - NOW()) as time_remaining
      FROM room_sponsors rs
      LEFT JOIN sponsor_subscriptions ss ON rs.id = ss.sponsor_id
      ORDER BY ss.started_at DESC NULLS LAST
      `
        );

        const sponsors = result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            logoUrl: row.logo_url,
            linkUrl: row.link_url,
            roomId: row.room_id,
            isActive: row.is_active,
            subscription: row.subscription_id ? {
                id: row.subscription_id,
                tier: row.tier,
                status: row.status,
                subscriptionStatus: row.subscription_status,
                stripeCustomerId: row.stripe_customer_id,
                stripeSubscriptionId: row.stripe_subscription_id,
                startedAt: row.started_at,
                expiresAt: row.expires_at,
                timeRemaining: row.time_remaining,
            } : null,
        }));

        res.json({
            success: true,
            count: sponsors.length,
            data: sponsors,
        });
    } catch (error) {
        console.error('Error fetching sponsor subscriptions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sponsor subscriptions',
        });
    }
};

// Get single sponsor subscription details
export const getSponsorSubscription = async (req: Request, res: Response) => {
    try {
        const { sponsorId } = req.params;

        const result = await query(
            `
      SELECT 
        rs.id,
        rs.name,
        rs.logo_url,
        rs.link_url,
        rs.room_id,
        rs.is_active,
        ss.id as subscription_id,
        ss.tier,
        ss.status,
        ss.stripe_subscription_id,
        ss.stripe_customer_id,
        ss.started_at,
        ss.expires_at,
        CASE 
          WHEN ss.expires_at > NOW() THEN 'Active'
          WHEN ss.expires_at IS NULL THEN 'Pending'
          ELSE 'Expired'
        END as subscription_status
      FROM room_sponsors rs
      LEFT JOIN sponsor_subscriptions ss ON rs.id = ss.sponsor_id
      WHERE rs.id = $1
      `,
            [sponsorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Sponsor not found',
            });
        }

        const row = result.rows[0];
        const sponsor = {
            id: row.id,
            name: row.name,
            logoUrl: row.logo_url,
            linkUrl: row.link_url,
            roomId: row.room_id,
            isActive: row.is_active,
            subscription: row.subscription_id ? {
                id: row.subscription_id,
                tier: row.tier,
                status: row.status,
                subscriptionStatus: row.subscription_status,
                stripeCustomerId: row.stripe_customer_id,
                stripeSubscriptionId: row.stripe_subscription_id,
                startedAt: row.started_at,
                expiresAt: row.expires_at,
            } : null,
        };

        res.json({
            success: true,
            data: sponsor,
        });
    } catch (error) {
        console.error('Error fetching sponsor subscription:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sponsor subscription',
        });
    }
};

// Toggle sponsor active status (admin only)
export const toggleSponsorActive = async (req: Request, res: Response) => {
    try {
        const { sponsorId } = req.params;
        const { isActive } = req.body;

        const result = await query(
            `
      UPDATE room_sponsors
      SET is_active = $1
      WHERE id = $2
      RETURNING *
      `,
            [isActive, sponsorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Sponsor not found',
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error toggling sponsor active status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update sponsor',
        });
    }
};

// Get sponsors by status (for dashboard filtering)
export const getSponsorsByStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.query; // 'active', 'pending', 'expired'

        let whereClause = '';
        if (status === 'active') {
            whereClause = 'WHERE ss.expires_at > NOW() AND ss.status = \'active\'';
        } else if (status === 'pending') {
            whereClause = 'WHERE ss.expires_at IS NULL OR ss.status = \'pending\'';
        } else if (status === 'expired') {
            whereClause = 'WHERE ss.expires_at <= NOW()';
        }

        const result = await query(
            `
      SELECT 
        rs.id,
        rs.name,
        rs.logo_url,
        rs.tier,
        ss.status,
        ss.expires_at,
        CASE 
          WHEN ss.expires_at > NOW() THEN 'Active'
          WHEN ss.expires_at IS NULL THEN 'Pending'
          ELSE 'Expired'
        END as subscription_status
      FROM room_sponsors rs
      LEFT JOIN sponsor_subscriptions ss ON rs.id = ss.sponsor_id
      ${whereClause}
      ORDER BY ss.expires_at DESC NULLS LAST
      `
        );

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error('Error fetching sponsors by status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sponsors',
        });
    }
};
