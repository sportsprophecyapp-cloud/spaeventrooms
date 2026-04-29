import pool from '../shared/database';

const seedAchievements = async () => {
    const client = await pool.connect();
    try {
        console.log('🌱 Seeding Achievement Cosmetics...');

        const achievements = [
            // Referral Rewards
            {
                id: 'referral_1',
                name: 'Arena Recruiter',
                type: 'avatar',
                cost: 0,
                asset_url: '/assets/cosmetics/recruit_handshake.png',
                description: 'Your first step into the Social Arena.',
                requirement: 'Refer 1 friend to the Arena',
                is_achievement_reward: true
            },
            {
                id: 'referral_10',
                name: 'Social Guardian',
                type: 'frame',
                cost: 0,
                asset_url: '/assets/cosmetics/social_guardian_frame.png',
                description: 'A frame for those who protect the community.',
                requirement: 'Refer 10 friends to the Arena',
                is_achievement_reward: true
            },
            {
                id: 'referral_25',
                name: 'Arena Influencer',
                type: 'avatar',
                cost: 0,
                asset_url: '/assets/cosmetics/arena_influencer_avatar.png',
                description: 'Your voice echoes through the Arena.',
                requirement: 'Refer 25 friends to the Arena',
                is_achievement_reward: true
            },
            {
                id: 'referral_50',
                name: 'Network Master',
                type: 'avatar',
                cost: 0,
                asset_url: '/assets/cosmetics/referrer_master.png',
                description: 'Master of the Social Arena.',
                requirement: 'Refer 50 friends to the Arena',
                is_achievement_reward: true
            },

            // Prediction Rewards
            {
                id: 'correct_1',
                name: 'First Blood',
                type: 'avatar',
                cost: 0,
                asset_url: '/assets/cosmetics/first_blood_target.png',
                description: 'First correct prediction.',
                requirement: '1 correct prediction',
                is_achievement_reward: true
            },
            {
                id: 'correct_5',
                name: 'On a Roll',
                type: 'avatar',
                cost: 0,
                asset_url: '/assets/cosmetics/streak_fire.png',
                description: '5 correct predictions.',
                requirement: '5 correct predictions',
                is_achievement_reward: true
            },
            {
                id: 'correct_25',
                name: 'Prophet',
                type: 'avatar',
                cost: 0,
                asset_url: '/assets/cosmetics/prophet_eye.png',
                description: '25 correct predictions.',
                requirement: '25 correct predictions',
                is_achievement_reward: true
            },
            {
                id: 'correct_50',
                name: 'Oracle',
                type: 'avatar',
                cost: 0,
                asset_url: '/assets/cosmetics/oracle_avatar.png',
                description: 'The ultimate predictor.',
                requirement: '50 correct predictions',
                is_achievement_reward: true
            },

            // Streak Rewards
            {
                id: 'streak_3',
                name: 'Regular',
                type: 'avatar',
                cost: 0,
                asset_url: '/assets/cosmetics/bronze_flame_avatar.png',
                description: '3-day login streak.',
                requirement: '3-day login streak',
                is_achievement_reward: true
            },
            {
                id: 'streak_7',
                name: 'Dedicated',
                type: 'avatar',
                cost: 0,
                asset_url: '/assets/cosmetics/silver_star_avatar.png',
                description: '7-day login streak.',
                requirement: '7-day login streak',
                is_achievement_reward: true
            },
            {
                id: 'streak_30',
                name: 'Loyalist',
                type: 'badge',
                cost: 0,
                asset_url: null,
                description: '30-day login streak.',
                requirement: '30-day login streak',
                is_achievement_reward: true
            },
            {
                id: 'streak_90',
                name: 'Veteran',
                type: 'badge',
                cost: 0,
                asset_url: null,
                description: '90-day login streak.',
                requirement: '90-day login streak',
                is_achievement_reward: true
            },
            {
                id: 'streak_365',
                name: 'Legend',
                type: 'frame',
                cost: 0,
                asset_url: '/assets/cosmetics/legend_frame.png',
                description: 'One year of loyalty.',
                requirement: '365-day login streak',
                is_achievement_reward: true
            },

            // Draw Winner Rewards
            {
                id: 'draw_winner_avatar',
                name: 'Grand Champion',
                type: 'avatar',
                cost: 0,
                asset_url: '/assets/cosmetics/champion_avatar.png',
                description: 'The ultimate arena victor.',
                requirement: 'Win a Prize Draw',
                is_achievement_reward: true
            },
            {
                id: 'draw_winner_frame',
                name: "Champion's Crown",
                type: 'frame',
                cost: 0,
                asset_url: null,
                description: 'A crown for the bold.',
                requirement: 'Win a Prize Draw',
                is_achievement_reward: true
            }
        ];

        for (const cos of achievements) {
            await client.query(`
                INSERT INTO cosmetics (id, name, type, cost, asset_url, description, requirement, is_achievement_reward, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
                ON CONFLICT (id) DO UPDATE SET 
                    name = $2, 
                    type = $3, 
                    cost = $4, 
                    asset_url = $5, 
                    description = $6, 
                    requirement = $7, 
                    is_achievement_reward = $8,
                    is_active = true
            `, [cos.id, cos.name, cos.type, cos.cost, cos.asset_url, cos.description, cos.requirement, cos.is_achievement_reward]);
        }

        console.log('✅ Achievement Cosmetics Seeded.');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

seedAchievements();
