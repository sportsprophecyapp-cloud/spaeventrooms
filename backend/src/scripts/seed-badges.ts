import { query } from '../shared/database';

async function seedBadges() {
    console.log('🌱 Seeding Badges & Milestones...');

    const badges = [
        // Prediction milestones
        { id: 'correct_1', name: 'First Blood', type: 'badge', desc: 'First correct prediction', req: '1 correct prediction' },
        { id: 'correct_5', name: 'On a Roll', type: 'badge', desc: '5 correct predictions', req: '5 correct predictions' },
        { id: 'correct_25', name: 'Prophet', type: 'badge', desc: '25 correct predictions', req: '25 correct predictions' },
        { id: 'correct_50', name: 'Oracle', type: 'badge', desc: '50 correct predictions', req: '50 correct predictions' },

        // Streak milestones
        { id: 'streak_3', name: 'Regular', type: 'badge', desc: '3 day login streak', req: '3 consecutive login days' },
        { id: 'streak_7', name: 'Dedicated', type: 'badge', desc: '7 day login streak', req: '7 consecutive login days' },
        { id: 'streak_30', name: 'Loyalist', type: 'badge', desc: '30 day login streak', req: '30 consecutive login days' },
        { id: 'streak_90', name: 'Veteran', type: 'badge', desc: '90 day login streak', req: '90 consecutive login days' },
        { id: 'streak_365', name: 'Legend', type: 'badge', desc: '1 year login streak', req: '365 consecutive login days' },

        // Referral milestones
        { id: 'referral_1', name: 'Recruiter', type: 'badge', desc: 'First referral', req: '1 referred user' },
        { id: 'referral_5', name: 'Influencer', type: 'badge', desc: '5 referrals', req: '5 referred users' },
        { id: 'referral_25', name: 'Ambassador', type: 'badge', desc: '25 referrals', req: '25 referred users' },
        { id: 'referral_50', name: 'Legend Maker', type: 'badge', desc: '50 referrals (Unlocks Avatar)', req: '50 referred users' },
    ];

    for (const b of badges) {
        await query(
            `INSERT INTO cosmetics (id, name, type, description, requirement) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (id) DO UPDATE SET name = $2, description = $4, requirement = $5`,
            [b.id, b.name, b.type, b.desc, b.req]
        );
    }

    console.log('✅ Seeding complete.');
    process.exit(0);
}

seedBadges().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
