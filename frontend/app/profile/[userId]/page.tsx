'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';
import RewardCenter from '@/app/components/RewardCenter/RewardCenter';
import TokenShop from '@/app/components/TokenShop';
import LootShowcase from '@/app/components/LootShowcase/LootShowcase';
import ReferralRoadmap from '@/app/components/ReferralRoadmap/ReferralRoadmap';

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

interface HistoryEntry {
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
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'showcase' | 'honors' | 'history' | 'rewards'>('showcase');
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [nameError, setNameError] = useState('');
    const [isUpdatingName, setIsUpdatingName] = useState(false);

    // History State
    const [historyItems, setHistoryItems] = useState<HistoryEntry[]>([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<'all' | 'wins' | 'pending' | 'incorrect'>('all');

    const fetchHistory = async (page: number, filter: string, reset = false) => {
        try {
            setHistoryLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
            const res = await fetch(`${apiUrl}/api/gamification/history/${userId}?page=${page}&limit=10&filter=${filter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (reset) {
                    setHistoryItems(data.history);
                } else {
                    setHistoryItems(prev => [...prev, ...data.history]);
                }
                setHistoryTotal(data.total);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory(1, historyFilter, true);
            setHistoryPage(1);
        }
    }, [activeTab, historyFilter, userId, token]); // Re-fetch on tab/filter change

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const fetchProfileData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
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
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
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

    const handleUpdateName = async () => {
        if (!newName || newName.length < 3) {
            setNameError('Name must be at least 3 characters');
            return;
        }
        if (newName === profile?.username) {
            setIsEditingName(false);
            return;
        }

        setIsUpdatingName(true);
        setNameError('');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/username`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newUsername: newName })
            });

            const data = await res.json();
            if (res.ok) {
                setProfile(prev => prev ? { ...prev, username: data.user.username } : null);
                setIsEditingName(false);
                // Also update local auth user if it matches
                if (user && user.id.toString() === userId) {
                    // This depends on how AuthContext is exposed, but usually we just refetch /me or reload
                    window.location.reload();
                }
            } else {
                setNameError(data.error || 'Failed to update name');
            }
        } catch (err) {
            setNameError('Connection error');
        } finally {
            setIsUpdatingName(false);
        }
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
                <div
                    className={`${styles.avatarWrapper} ${profile.equipped?.frame ? styles.hasFrame : ''} ${isOwnProfile ? styles.editable : ''}`}
                    onClick={() => isOwnProfile && setIsShopOpen(true)}
                >
                    {profile.equipped?.frame && (
                        <div className={styles.frameOverlay}>
                            <img src={profile.equipped.frame} alt="Frame" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                    )}
                    <div className={styles.avatarLarge}>
                        {profile.equipped?.avatar ? (
                            <img src={profile.equipped.avatar} alt={profile.username} className={styles.avatarImg} onError={(e) => e.currentTarget.style.display = 'none'} />
                        ) : (
                            profile.username[0].toUpperCase()
                        )}
                    </div>
                    {isOwnProfile && <div className={styles.editBadge}>⚙️</div>}
                </div>
                <div className={styles.profileInfo}>
                    <div className={styles.nameRow}>
                        {isEditingName ? (
                            <div className={styles.editNameContainer}>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className={styles.editInput}
                                    placeholder="Enter new name..."
                                    autoFocus
                                    maxLength={20}
                                />
                                <div className={styles.editActions}>
                                    <button
                                        onClick={handleUpdateName}
                                        className={styles.saveBtn}
                                        disabled={isUpdatingName}
                                    >
                                        {isUpdatingName ? '...' : 'SAVE'}
                                    </button>
                                    <button
                                        onClick={() => { setIsEditingName(false); setNameError(''); }}
                                        className={styles.cancelBtn}
                                    >
                                        ✕
                                    </button>
                                </div>
                                {nameError && <div className={styles.nameInlineError}>{nameError}</div>}
                            </div>
                        ) : (
                            <>
                                <h1>{profile.username}</h1>
                                {isOwnProfile && (
                                    <button
                                        className={styles.editNameBtn}
                                        onClick={() => { setIsEditingName(true); setNewName(profile.username); }}
                                        title="Change Username"
                                    >
                                        ✏️
                                    </button>
                                )}
                            </>
                        )}
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
                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
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
                <nav className={styles.tabsNav}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'showcase' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('showcase')}
                    >
                        🏆 SHOWCASE
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'honors' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('honors')}
                    >
                        ⚜️ HONORS
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        📅 HISTORY
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'rewards' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('rewards')}
                    >
                        🎁 REWARDS
                    </button>
                </nav>

                <div className={styles.tabContent}>
                    {activeTab === 'showcase' && (
                        <>
                            <section className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.tooltipWrapper}>
                                        <span className={styles.statVal}>{profile.tokens}</span>
                                        <div className={styles.tooltip}>
                                            <strong>TOKENS</strong><br />
                                            Used to buy exclusive Avatars and Frames in the Token Shop.
                                        </div>
                                    </div>
                                    <span className={styles.statLabel}>TOKENS</span>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.tooltipWrapper}>
                                        <span className={styles.statVal}>{profile.draw_entries || 0}</span>
                                        <div className={styles.tooltip}>
                                            <strong>TICKETS</strong><br />
                                            Earned via Correct Calls. Used to enter Grand Prize Draws.
                                        </div>
                                    </div>
                                    <span className={styles.statLabel}>TICKETS</span>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.tooltipWrapper}>
                                        <span className={styles.statVal}>{profile.points}</span>
                                        <div className={styles.tooltip}>
                                            <strong>XP</strong><br />
                                            Total experience points. Determines your Global Rank and Tier.
                                        </div>
                                    </div>
                                    <span className={styles.statLabel}>XP</span>
                                </div>
                            </section>

                            {isOwnProfile && (
                                <ReferralRoadmap
                                    currentCount={profile.referral_count || 0}
                                    unlockedIds={unlockedBadgeIds}
                                    referralCode={profile.referral_code}
                                    onCopy={handleCopyReferral}
                                    copyMessage={copyMessage}
                                />
                            )}
                            <LootShowcase />
                        </>
                    )}

                    {activeTab === 'honors' && (
                        <>
                            {/* HALL OF FAME / TROPHY ROOM */}
                            <section className={styles.hallOfFame}>
                                <h3 className={styles.hallOfFameTitle}>⚜️ HALL OF FAME ⚜️</h3>
                                <div className={styles.trophyGrid}>
                                    {[
                                        { id: 'draw_winner_avatar', name: 'Grand Champion', asset: '/assets/cosmetics/champion_avatar.png' },
                                        { id: 'correct_50', name: 'Spectral Oracle', asset: '/assets/cosmetics/oracle_avatar.png' },
                                        { id: 'referral_50', name: 'Network Master', asset: '/assets/cosmetics/referrer_master.png' }
                                    ].map(special => {
                                        const isUnlocked = unlockedBadgeIds.has(special.id);
                                        return (
                                            <div key={special.id} className={styles.trophyItem}>
                                                <div className={`${styles.trophyVisual} ${!isUnlocked ? styles.trophyLocked : ''}`}>
                                                    <img
                                                        src={special.asset}
                                                        alt={special.name}
                                                        className={`${styles.trophyImg} ${!isUnlocked ? styles.trophyImgLocked : ''}`}
                                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                                    />
                                                    {!isUnlocked && <div className={styles.lockOverlay}>🔒</div>}
                                                </div>
                                                <h4 className={styles.trophyName}>{special.name}</h4>
                                                <span className={`${styles.trophyStatus} ${!isUnlocked ? styles.trophyStatusLocked : ''}`}>
                                                    {isUnlocked ? 'EARNED' : 'LOCKED'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className={`${styles.badgeLocker} glass`}>
                                <h3 className={styles.sectionTitle}>🏆 MY BADGES & ACHIEVEMENTS</h3>
                                <div className={styles.badgesGrid}>
                                    {allBadges.map(badge => {
                                        const isUnlocked = unlockedBadgeIds.has(badge.id.toString());
                                        return (
                                            <div key={badge.id} className={`${styles.badgeCard} ${!isUnlocked ? styles.locked : ''}`}>
                                                <div className={styles.badgeIcon}>
                                                    {isUnlocked ? (
                                                        badge.asset_url ? <img src={badge.asset_url} alt={badge.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : '🏅'
                                                    ) : '🔒'}
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

                    {activeTab === 'history' && (
                        <section className={`${styles.historyCard} glass`}>
                            <div className={styles.historyHeader}>
                                <h3 className={styles.sectionTitle}>📅 PREDICTION HISTORY</h3>
                                <div className={styles.statusGuide}>
                                    <div className={styles.guideItem}>
                                        <span className={styles.statusCorrect}>✅ CORRECT</span>
                                        <span className={styles.guideLabel}>+1 TICKET & XP</span>
                                    </div>
                                    <div className={styles.guideItem}>
                                        <span className={styles.historyLive}>⏳ PENDING</span>
                                        <span className={styles.guideLabel}>WAITING FOR SCORE</span>
                                    </div>
                                    <div className={styles.guideItem}>
                                        <span className={styles.statusIncorrect}>❌ INCORRECT</span>
                                        <span className={styles.guideLabel}>BETTER LUCK NEXT TIME</span>
                                    </div>
                                </div>
                                <div className={styles.filterControls}>
                                    {(['all', 'wins', 'pending', 'incorrect'] as const).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setHistoryFilter(f)}
                                            className={`${styles.filterBtn} ${historyFilter === f ? styles.activeFilter : ''}`}
                                        >
                                            {f.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.historyList}>
                                {historyItems.length > 0 ? (
                                    <>
                                        <div className={styles.historyListContainer}>
                                            {(() => {
                                                // Group by date
                                                const groups: { [key: string]: HistoryEntry[] } = {};
                                                historyItems.forEach(item => {
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
                                            })()}

                                            {historyItems.length < historyTotal && (
                                                <button
                                                    className={styles.loadMoreBtn}
                                                    onClick={() => {
                                                        const nextPage = historyPage + 1;
                                                        setHistoryPage(nextPage);
                                                        fetchHistory(nextPage, historyFilter, false);
                                                    }}
                                                    disabled={historyLoading}
                                                >
                                                    {historyLoading ? 'LOADING...' : 'LOAD MORE PREDICTIONS'}
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.emptyHistory}>
                                        {historyLoading ? 'Loading history...' : 'No predictions found.'}
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'rewards' && (
                        <RewardCenter />
                    )}
                </div>
            </div>

            {isShopOpen && (
                <TokenShop onClose={() => setIsShopOpen(false)} />
            )}
        </div>
    );
};

export default ProfilePage;
