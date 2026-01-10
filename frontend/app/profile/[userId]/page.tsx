'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';
import RewardCenter from '@/app/components/RewardCenter/RewardCenter';

// RESTORED: This interface is critical for the page to function.
interface UserProfile {
    id: string;
    username: string;
    email: string;
    referral_code?: string;
    tokens: number;
    points: number;
    level: number;
    total_predictions: number;
    correct_predictions: number;
    streak: number;
    draw_entries?: number;
}

interface Badge {
    id: number;
    name: string;
    description: string;
    requirement?: string;
    asset_url?: string;
}

const ProfilePage = () => {
    const { userId } = useParams();
    const router = useRouter();
    const { user, isAuthenticated, token, login } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [copyMessage, setCopyMessage] = useState('');

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const fetchProfileData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/auth/profile/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    const ticketRes = await fetch(`${apiUrl}/api/gamification/tickets`, { headers: { 'Authorization': `Bearer ${token}` } });
                    const ticketData = await ticketRes.json();
                    setProfile({ ...data.user, draw_entries: ticketData.count || 0 });
                }
            } catch (err) { console.error('Error fetching profile data:', err); }
        };

        const fetchBadges = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                // 1. Fetch all possible badges
                const allRes = await fetch(`${apiUrl}/api/gamification/badges/all`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (allRes.ok) {
                    const data = await allRes.json();
                    setAllBadges(data.badges);
                }

                // 2. Fetch user's unlocked badges
                const myRes = await fetch(`${apiUrl}/api/badges/my-badges`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (myRes.ok) {
                    const unlocked = await myRes.json();
                    setUnlockedBadgeIds(new Set(unlocked.map((b: any) => b.id)));
                }
            } catch (err) { console.error('Error fetching badges:', err); }
        };

        setIsLoading(true);
        Promise.all([fetchProfileData(), fetchBadges()]).finally(() => setIsLoading(false));

    }, [userId, isAuthenticated, token]);

    const handleCopyReferral = () => {
        if (!profile || !profile.referral_code) return;
        const refUrl = `${window.location.origin}/auth/register?ref=${profile.referral_code}`;
        navigator.clipboard.writeText(refUrl);
        setCopyMessage('LINK COPIED! (+50 TOKENS)');
        setTimeout(() => setCopyMessage(''), 3000);
    };

    if (isLoading) return <div className={styles.loading}>Accessing Records...</div>;
    if (!profile) return <div className={styles.error}>User not found.</div>;

    const isOwnProfile = user?.id.toString() === userId;

    return (
        <div className={styles.container}>
            <div className={styles.navBar}>
                <button onClick={() => router.back()} className={styles.backBtn}>← RETURN TO ARENA</button>
            </div>

            <header className={styles.header}>
                <div className={styles.avatarLarge}>
                    {profile.username[0].toUpperCase()}
                </div>
                <div className={styles.profileInfo}>
                    <h1>{profile.username}</h1>
                    <p className={styles.levelBadge}>LVL {profile.level} EXPERT</p>
                </div>
            </header>

            <div className={styles.content}>
                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statVal}>{profile.tokens}</span>
                        <span className={styles.statLabel}>TOKENS</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statVal}>{profile.draw_entries || 0}</span>
                        <span className={styles.statLabel}>TICKETS</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statVal}>{profile.points}</span>
                        <span className={styles.statLabel}>XP</span>
                    </div>
                </section>

                {isOwnProfile && (
                    <>
                        <section className={`${styles.referralCard} glass`}>
                            <div className={styles.refHeader}>
                                <div className={styles.refInfo}>
                                    <h3>RECRUIT NEW PLAYERS</h3>
                                    <p>Earn 50 tokens for every signup. Current: <strong>0 / 50</strong> recruits</p>
                                </div>
                                <button onClick={handleCopyReferral} className={styles.copyBtn}>
                                    {copyMessage || 'COPY LINK'}
                                </button>
                            </div>
                            <div className={styles.milestoneBar}>
                                <div className={styles.milestoneProgress} style={{ width: '0%' }}></div>
                                <div className={styles.milestonePoints}>
                                    <span>1</span>
                                    <span>5</span>
                                    <span>25</span>
                                    <span className={styles.finalGoal}>50 (AVATAR)</span>
                                </div>
                            </div>
                        </section>

                        <RewardCenter />

                        <section className={`${styles.badgeLocker} glass`}>
                            <h3 className={styles.sectionTitle}>🏆 MY BADGES & ACHIEVEMENTS</h3>
                            <div className={styles.badgesGrid}>
                                {allBadges.map(badge => {
                                    const isUnlocked = unlockedBadgeIds.has(badge.id.toString());
                                    return (
                                        <div key={badge.id} className={`${styles.badgeCard} ${!isUnlocked ? styles.locked : ''}`}>
                                            <div className={styles.badgeIcon}>
                                                {isUnlocked ? '🏅' : '🔒'}
                                            </div>
                                            <h4>{badge.name}</h4>
                                            <p className={styles.badgeDesc}>{badge.description}</p>
                                            {!isUnlocked && (
                                                <div className={styles.requirement}>
                                                    {badge.requirement || 'Keep playing to unlock!'}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
