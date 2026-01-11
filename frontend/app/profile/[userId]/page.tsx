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
    referral_count?: number;
    global_rank?: number;
    canUploadCustom?: boolean;
    equipped?: {
        avatar?: string;
        frame?: string;
    };
    history?: Array<{
        id: string;
        pick: string;
        created_at: string;
        home_team: string;
        away_team: string;
        home_logo?: string;
        away_logo?: string;
        status: string;
        score_home?: number;
        score_away?: number;
        start_time: string;
    }>;
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
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

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
                    // data.user now contains referral_count and history from my backend change
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

    const handleShareStats = () => {
        if (!profile) return;
        const text = `🏆 I'm Rank #${profile.global_rank || '??'} in the Events Arena! \n\n🎯 Level ${profile.level} ${profile.points >= 5000 ? 'LEGENDARY' : 'PRO'} Supporter. \n\nThink you can beat me? Join here: \n${window.location.origin}/auth/register?ref=${profile.referral_code}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const getTierClass = (points: number) => {
        if (points >= 5000) return styles.tierLegendary;
        if (points >= 2500) return styles.tierElite;
        if (points >= 1000) return styles.tierVeteran;
        return styles.tierNovice;
    };

    if (isLoading) return <div className={styles.loading}>Accessing Records...</div>;
    if (!profile) return <div className={styles.error}>User not found.</div>;

    const isOwnProfile = user?.id.toString() === userId;

    return (
        <div className={`${styles.container} ${getTierClass(profile.points)}`}>
            <div className={styles.navBar}>
                <button onClick={() => router.back()} className={styles.backBtn}>← RETURN TO ARENA</button>
            </div>

            <header className={styles.header}>
                <div className={`${styles.avatarWrapper} ${profile.equipped?.frame ? styles.hasFrame : ''}`}>
                    {profile.equipped?.frame && (
                        <div className={styles.frameOverlay}>
                            <img src={profile.equipped.frame} alt="Frame" />
                        </div>
                    )}
                    <div className={styles.avatarLarge}>
                        {profile.equipped?.avatar ? (
                            <img src={profile.equipped.avatar} alt={profile.username} className={styles.avatarImg} />
                        ) : (
                            profile.username[0].toUpperCase()
                        )}
                    </div>
                </div>
                <div className={styles.profileInfo}>
                    <div className={styles.nameRow}>
                        <h1>{profile.username}</h1>
                        <div className={styles.rankBadge}>GLOBAL RANK #{profile.global_rank || '??'}</div>
                    </div>
                    <div className={styles.titleRow}>
                        <p className={styles.levelBadge}>
                            {profile.points >= 5000 ? 'LEGENDARY' :
                                profile.points >= 2500 ? 'ELITE' :
                                    profile.points >= 1000 ? 'VETERAN' :
                                        'NOVICE'}
                        </p>
                        {isOwnProfile && profile.canUploadCustom && (
                            <button
                                onClick={() => {
                                    const url = prompt('Enter image URL for your custom avatar:');
                                    if (url) {
                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                                        fetch(`${apiUrl}/api/auth/upload-avatar`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`
                                            },
                                            body: JSON.stringify({ avatarUrl: url })
                                        }).then(res => res.json()).then(data => {
                                            if (data.success) {
                                                setProfile(prev => prev ? { ...prev, equipped: { ...prev.equipped, avatar: url } } : null);
                                                alert('Avatar updated! Refresh to see changes across the site.');
                                                window.location.reload();
                                            } else {
                                                alert(data.error || 'Failed to update avatar');
                                            }
                                        });
                                    }
                                }}
                                className={styles.uploadBtn}
                            >
                                📸 CUSTOM UPLOAD
                            </button>
                        )}
                        {isOwnProfile && (
                            <button onClick={handleShareStats} className={styles.shareStatsBtn}>SHARE MY STATS</button>
                        )}
                    </div>
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
                                    <p>Earn 50 tokens for every signup. Current: <strong>{profile.referral_count || 0} / 50</strong> recruits</p>
                                </div>
                                <button onClick={handleCopyReferral} className={styles.copyBtn}>
                                    {copyMessage || 'COPY LINK'}
                                </button>
                            </div>
                            <div className={styles.milestoneBar}>
                                <div className={styles.milestoneProgress} style={{ width: `${Math.min(((profile.referral_count || 0) / 50) * 100, 100)}%` }}></div>
                                <div className={styles.milestonePoints}>
                                    <span>1</span>
                                    <span>5</span>
                                    <span>25</span>
                                    <span className={styles.finalGoal}>50 (AVATAR)</span>
                                </div>
                            </div>
                        </section>

                        <section className={`${styles.historyCard} glass`}>
                            <div className={styles.historyHeader}>
                                <h3 className={styles.sectionTitle}>📅 RECENT SWIPES</h3>
                                {profile.history && profile.history.length > 5 && (
                                    <button
                                        onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                                        className={styles.expandToggle}
                                    >
                                        {isHistoryExpanded ? 'SHOW LESS' : `VIEW ALL (${profile.history.length})`}
                                    </button>
                                )}
                            </div>

                            <div className={styles.historyList}>
                                {profile.history && profile.history.length > 0 ? (
                                    (() => {
                                        const displayedHistory = isHistoryExpanded ? profile.history : profile.history.slice(0, 5);

                                        // Group by date
                                        const groups: { [key: string]: typeof profile.history } = {};
                                        displayedHistory.forEach(item => {
                                            const date = new Date(item.created_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            });
                                            if (!groups[date]) groups[date] = [];
                                            groups[date].push(item);
                                        });

                                        return Object.entries(groups).map(([date, items]) => (
                                            <div key={date} className={styles.historyGroup}>
                                                <div className={styles.dateDivider}>
                                                    <span>{date}</span>
                                                    <div className={styles.dividerLine}></div>
                                                </div>
                                                {items.map((item) => (
                                                    <div key={item.id} className={styles.historyItem}>
                                                        <div className={styles.historyTeamsWrapper}>
                                                            <div className={styles.miniLogo}>
                                                                <img src={item.home_logo} alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                            </div>
                                                            <span className={styles.historyTeams}>{item.home_team} vs {item.away_team}</span>
                                                            <div className={styles.miniLogo}>
                                                                <img src={item.away_logo} alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                            </div>
                                                        </div>
                                                        <div className={styles.historyMeta}>
                                                            <span className={styles.historyPick}>PICK: <strong>{item.pick.toUpperCase()}</strong></span>
                                                            <div className={styles.historyStatus}>
                                                                {item.status === 'correct' ? (
                                                                    <span className={styles.statusCorrect}>✅ CORRECT</span>
                                                                ) : item.status === 'incorrect' ? (
                                                                    <span className={styles.statusIncorrect}>❌ INCORRECT</span>
                                                                ) : (
                                                                    <span className={styles.historyLive}>PENDING</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ));
                                    })()
                                ) : (
                                    <p className={styles.emptyHistory}>No predictions made yet. Go to the Arena!</p>
                                )}
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
