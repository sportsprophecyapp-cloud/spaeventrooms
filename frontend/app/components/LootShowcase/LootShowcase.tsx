'use client';

import React, { useMemo } from 'react';
import styles from './LootShowcase.module.css';
import { useAuth } from '@/app/context/AuthContext';

export default function LootShowcase() {
    const { user } = useAuth();

    const nextReward = useMemo(() => {
        if (!user) return null;

        // Rewards logic based on BadgeService.ts milestones
        const rewards = [
            {
                id: 'correct_50',
                name: 'Spectral Oracle',
                type: 'Avatar',
                asset: '/assets/cosmetics/oracle_avatar.png',
                targetType: 'correct_picks',
                current: user.correct_picks || 0,
                target: 50,
                desc: 'Unlocked after 50 correct predictions.'
            },
            {
                id: 'draw_winner_avatar',
                name: 'Grand Champion',
                type: 'Avatar',
                asset: '/assets/cosmetics/champion_avatar.png',
                targetType: 'wins',
                current: 0, // We could fetch actual draw win count if needed, but 0/1 is the hook
                target: 1,
                desc: 'Seal your legacy. Unlock by winning any prize draw.'
            },
            {
                id: 'referral_50',
                name: 'Network Master',
                type: 'Avatar',
                asset: '/assets/cosmetics/referrer_master.png',
                targetType: 'referrals',
                // Assuming we'll add referral_count to AuthContext or pass it
                current: (user as any).referral_count || 0,
                target: 50,
                desc: 'Unlocked after 50 recruits join the arena.'
            },
            {
                id: 'streak_365',
                name: 'Golden Legend',
                type: 'Frame',
                asset: '/assets/cosmetics/legend_frame.png',
                targetType: 'streak',
                current: (user as any).streak || 0,
                target: 365,
                desc: 'The ultimate milestone. 1 year of daily loyalty.'
            }
        ];

        // Find the one with highest progress % that is not 100%
        return rewards
            .map(r => ({ ...r, progress: Math.min((r.current / r.target) * 100, 100) }))
            .filter(r => r.progress < 100)
            .sort((a, b) => b.progress - a.progress)[0] || rewards[0];
    }, [user]);

    if (!user || !nextReward) return null;

    return (
        <section className={`${styles.showcase} glass`}>
            <div className={styles.header}>
                <h2>REWARD PREVIEW</h2>
                <p>Track your path to elite status assets.</p>
            </div>

            <div className={styles.displayArea}>
                <div className={styles.previewCircle}>
                    <div className={styles.avatarWrapper}>
                        {nextReward.type === 'Avatar' ? (
                            <img src={nextReward.asset} alt="Preview" className={styles.avatarImg} />
                        ) : (
                            <img src={user.equipped?.avatar || '/assets/arenas/soccer-arena.jpg'} alt="My Avatar" className={styles.avatarImg} />
                        )}
                    </div>
                    {nextReward.type === 'Frame' && (
                        <div className={styles.frameOverlay}>
                            <img src={nextReward.asset} alt="Frame Preview" />
                        </div>
                    )}
                </div>

                <div className={styles.rewardInfo}>
                    <span className={styles.rewardType}>NEXT MAJOR {nextReward.type}</span>
                    <h3 className={styles.rewardName}>{nextReward.name}</h3>
                    <p>{nextReward.desc}</p>

                    <div className={styles.progressContainer}>
                        <div className={styles.progressLabel}>
                            <span>PROGRESS</span>
                            <span>{Math.floor(nextReward.current)} / {nextReward.target}</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${nextReward.progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.actionArea}>
                <button className={styles.unlockBtn}>VIEW ALL ACHIEVEMENTS</button>
            </div>
        </section>
    );
}
