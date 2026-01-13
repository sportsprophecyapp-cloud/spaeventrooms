'use client';

import React from 'react';
import styles from './ReferralRoadmap.module.css';

interface Milestone {
    count: number;
    name: string;
    reward: string;
    icon: string;
    id: string;
}

interface ReferralRoadmapProps {
    currentCount: number;
    unlockedIds: Set<string>;
    referralCode?: string;
    onCopy: () => void;
    copyMessage: string;
}

const MILESTONES: Milestone[] = [
    { id: 'referral_1', count: 1, name: 'Arena Recruiter', reward: 'Badge + 100 PTS', icon: '🎖️' },
    { id: 'referral_10', count: 10, name: 'Social Guardian', reward: 'Frame + 500 PTS', icon: '🖼️' },
    { id: 'referral_25', count: 25, name: 'Arena Influencer', reward: 'Avatar + 1k PTS', icon: '👤' },
    { id: 'referral_50', count: 50, name: 'Network Master', reward: 'Elite + 2.5k PTS', icon: '👑' }
];

export default function ReferralRoadmap({ currentCount, unlockedIds, referralCode, onCopy, copyMessage }: ReferralRoadmapProps) {
    const progressPercent = Math.min((currentCount / 50) * 100, 100);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <h3 className={styles.title}>Social Empire Roadmap</h3>
                    <p className={styles.subtitle}>Build your network to unlock legendary status</p>
                </div>
                <div className={styles.stats}>
                    <span className={styles.current}>{currentCount}</span>
                    <span className={styles.total}>/ 50 RECRUITS</span>
                </div>
            </div>

            <div className={styles.roadmap}>
                <div className={styles.track}>
                    <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />

                    {MILESTONES.map((m) => {
                        const isUnlocked = unlockedIds.has(m.id);
                        const isNext = !isUnlocked && (currentCount < m.count);
                        const position = (m.count / 50) * 100;

                        return (
                            <div
                                key={m.id}
                                className={`${styles.milestone} ${isUnlocked ? styles.unlocked : ''} ${isNext ? styles.next : ''}`}
                                style={{ left: `${position}%` }}
                            >
                                <div className={styles.node}>
                                    <span className={styles.nodeIcon}>{isUnlocked ? '✓' : m.icon}</span>
                                    {isUnlocked && <div className={styles.glow} />}
                                </div>
                                <div className={styles.milestoneInfo}>
                                    <span className={styles.mCount}>{m.count}</span>
                                    <span className={styles.mName}>{m.name}</span>
                                    <span className={styles.mReward}>{m.reward}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.shareSection}>
                    <div className={styles.codeBox}>
                        <span className={styles.codeLabel}>YOUR INVITE CODE</span>
                        <span className={styles.codeValue}>{referralCode || '-------'}</span>
                    </div>
                    <button onClick={onCopy} className={styles.copyBtn}>
                        {copyMessage || 'COPY INVITE LINK'}
                    </button>
                </div>
                <p className={styles.hint}>
                    {currentCount < 50
                        ? `Only ${50 - currentCount} more recruits to become a Network Master!`
                        : "You have conquered the Network! Elite perks unlocked."}
                </p>
            </div>
        </div>
    );
}
