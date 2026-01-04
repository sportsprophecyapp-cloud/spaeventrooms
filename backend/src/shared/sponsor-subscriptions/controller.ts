import { Response } from 'express';
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
