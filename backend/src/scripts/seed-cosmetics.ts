import pool from '../shared/database';

const seedCosmetics = async () => {
    const client = await pool.connect();
    try {
        console.log('🎨 Seeding cosmetics data...');

        const cosmetics = [
            // Avatars
            {
                name: 'Basic Avatar',
                description: 'A simple starter avatar for your profile',
                type: 'avatar',
                cost: 200,
                asset_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=basic',
                is_active: true
            },
            {
                name: 'Premium Avatar',
                description: 'Stand out with this exclusive premium avatar',
                type: 'avatar',
                cost: 500,
                asset_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=premium',
                is_active: true
            },
            {
                name: 'Elite Avatar',
                description: 'The ultimate avatar for top predictors',
                type: 'avatar',
                cost: 1000,
                asset_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elite',
                is_active: true
            },

            // Frames
            {
                name: 'Bronze Frame',
                description: 'A stylish bronze border for your profile',
                type: 'frame',
                cost: 300,
                asset_url: '/assets/frames/bronze.png',
                is_active: true
            },
            {
                name: 'Silver Frame',
                description: 'Show your dedication with a silver frame',
                type: 'frame',
                cost: 600,
                asset_url: '/assets/frames/silver.png',
                is_active: true
            },
            {
                name: 'Gold Frame',
                description: 'The prestigious gold frame for champions',
                type: 'frame',
                cost: 1200,
                asset_url: '/assets/frames/gold.png',
                is_active: true
            },

            // Badges
            {
                name: 'Streak Master',
                description: 'Awarded for maintaining a 7-day streak',
                type: 'badge',
                cost: 250,
                asset_url: '/assets/badges/streak.png',
                is_active: true
            },
            {
                name: 'Social Butterfly',
                description: 'Share and earn with your friends',
                type: 'badge',
                cost: 250,
                asset_url: '/assets/badges/social.png',
                is_active: true
            },
            {
                name: 'Leaderboard Legend',
                description: 'Exclusive badge for top 10 predictors',
                type: 'badge',
                cost: 1000,
                asset_url: '/assets/badges/legend.png',
                is_active: true
            },

            // Special Badges (earned, not purchased)
            {
                name: 'Entry Ticket Badge',
                description: '30-day streak reward - Monthly draw entry',
                type: 'badge',
                cost: 0, // Cannot be purchased
                asset_url: '/assets/badges/ticket.png',
                is_active: false // Only awarded via streak
            },
            {
                name: 'Founder Badge',
                description: 'Exclusive badge for early supporters',
                type: 'badge',
                cost: 0,
                asset_url: '/assets/badges/founder.png',
                is_active: false
            },

            // Backgrounds
            {
                name: 'Sunset Gradient',
                description: 'Warm sunset colors for your profile background',
                type: 'background',
                cost: 400,
                asset_url: '/assets/backgrounds/sunset.jpg',
                is_active: true
            },
            {
                name: 'Ocean Wave',
                description: 'Cool ocean vibes for your profile',
                type: 'background',
                cost: 400,
                asset_url: '/assets/backgrounds/ocean.jpg',
                is_active: true
            },
            {
                name: 'Neon City',
                description: 'Futuristic neon cityscape background',
                type: 'background',
                cost: 800,
                asset_url: '/assets/backgrounds/neon.jpg',
                is_active: true
            }
        ];

        for (const cosmetic of cosmetics) {
            // Check if cosmetic already exists
            const existing = await client.query(
                `SELECT id FROM cosmetics WHERE name = $1`,
                [cosmetic.name]
            );

            if (existing.rows.length === 0) {
                await client.query(
                    `INSERT INTO cosmetics (name, description, type, cost, asset_url, is_active, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                    [
                        cosmetic.name,
                        cosmetic.description,
                        cosmetic.type,
                        cosmetic.cost,
                        cosmetic.asset_url,
                        cosmetic.is_active
                    ]
                );
            }
        }

        console.log(`✅ Seeded ${cosmetics.length} cosmetics successfully.`);
        console.log('📊 Breakdown:');
        console.log('   - Avatars: 3');
        console.log('   - Frames: 3');
        console.log('   - Badges: 5');
        console.log('   - Backgrounds: 3');
    } catch (err) {
        console.error('❌ Error seeding cosmetics:', err);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
};

seedCosmetics();
