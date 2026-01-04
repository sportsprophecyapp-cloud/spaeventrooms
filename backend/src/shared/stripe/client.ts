import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey) {
    console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe integration will not work.');
}

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover',
});

// Pricing tier configuration
export const SPONSOR_TIERS = {
    starter: {
        name: 'Starter Display',
        price: 9900, // $99.00 in cents
        priceId: process.env.STRIPE_PRICE_STARTER || '',
        features: ['Homepage logo (rotating)', 'Announcements page', 'Footer placement']
    },
    growth: {
        name: 'Growth Display',
        price: 29900, // $299.00 in cents
        priceId: process.env.STRIPE_PRICE_GROWTH || '',
        features: ['All Starter features', 'Login page logo', 'Room selection page', '2-3 custom announcements/month']
    },
    premium: {
        name: 'Premium Display',
        price: 59900, // $599.00 in cents
        priceId: process.env.STRIPE_PRICE_PREMIUM || '',
        features: ['All Growth features', 'Hero banner on homepage', 'Dedicated sponsor page', 'Unlimited announcements']
    },
    exclusive: {
        name: 'Exclusive Partner',
        price: null, // Custom pricing
        priceId: null,
        features: ['White-label integration', 'Custom landing page', 'Dedicated account manager', 'Full platform co-branding']
    }
};
