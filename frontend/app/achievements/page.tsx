'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';

interface Achievement {
    id: string;
    name: string;
    type: string;
    asset: string;
    description: string;
    requirement: string;
    targetType: string;
    target: number;
    current?: number;
    progress?: number;
    unlocked?: boolean;
}

const AchievementsPage = () => {
    const router = useRouter();
    const { user, token } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'avatar' | 'frame'>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                setLoading(true);
                setError(null);

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sportsprophecyapp.com';
                const response = await fetch(`${apiUrl}/api/gamification/achievements`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch achievements');
                }

                const data = await response.json();
                if (data.success && data.achievements) {
                    setAchievements(data.achievements);
                    setFilteredAchievements(data.achievements);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                console.error('Error fetching achievements:', err);
                setError('Failed to load achievements. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchAchievements();
        }
    }, [user]);

    useEffect(() => {
        // Filter achievements based on active tab
        if (activeTab === 'all') {
            setFilteredAchievements(achievements);
        } else {
            setFilteredAchievements(achievements.filter(a => a.type.toLowerCase() === activeTab));
        }
    }, [activeTab, achievements]);

    const isUnlocked = (achievement: Achievement) => {
        return achievement.unlocked || false;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backBtn}>
                        ← BACK
                    </button>
                    <h1 className={styles.title}>🏆 ALL ACHIEVEMENTS</h1>
                    <p className={styles.subtitle}>Loading achievements...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backBtn}>
                        ← BACK
                    </button>
                    <h1 className={styles.title}>🏆 ALL ACHIEVEMENTS</h1>
                    <p className={styles.subtitle} style={{ color: '#ff6b6b' }}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    ← BACK
                </button>
                <h1 className={styles.title}>🏆 ALL ACHIEVEMENTS</h1>
                <p className={styles.subtitle}>Unlock exclusive avatars and frames by completing challenges</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    ALL ({achievements.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'avatar' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('avatar')}
                >
                    AVATARS ({achievements.filter(a => a.type.toLowerCase() === 'avatar').length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'frame' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('frame')}
                >
                    FRAMES ({achievements.filter(a => a.type.toLowerCase() === 'frame').length})
                </button>
            </div>

            <div className={styles.grid}>
                {filteredAchievements.map(achievement => {
                    const unlocked = isUnlocked(achievement);
                    const progress = achievement.progress || 0;
                    const current = achievement.current || 0;

                    return (
                        <div
                            key={achievement.id}
                            className={`${styles.card} ${unlocked ? styles.unlocked : styles.locked}`}
                        >
                            <div className={styles.cardHeader}>
                                <span className={styles.typeBadge}>{achievement.type.toUpperCase()}</span>
                                {unlocked && <span className={styles.unlockedBadge}>✓ UNLOCKED</span>}
                            </div>

                            <div className={styles.assetPreview}>
                                {achievement.type.toLowerCase() === 'avatar' ? (
                                    <div className={styles.avatarPreview}>
                                        <img
                                            src={achievement.asset}
                                            alt={achievement.name}
                                            className={unlocked ? '' : styles.lockedImage}
                                        />
                                        {!unlocked && <div className={styles.lockOverlay}>🔒</div>}
                                    </div>
                                ) : (
                                    <div className={styles.framePreview}>
                                        <div className={styles.frameInner}>
                                            <img
                                                src={user?.equipped?.avatar || '/assets/arenas/soccer-arena.jpg'}
                                                alt="Preview"
                                                className={styles.previewAvatar}
                                            />
                                        </div>
                                        <img
                                            src={achievement.asset}
                                            alt={achievement.name}
                                            className={`${styles.frameOverlay} ${unlocked ? '' : styles.lockedImage}`}
                                        />
                                        {!unlocked && <div className={styles.lockOverlay}>🔒</div>}
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardContent}>
                                <h3 className={styles.achievementName}>{achievement.name}</h3>
                                <p className={styles.description}>{achievement.description}</p>

                                <div className={styles.requirement}>
                                    <span className={styles.requirementIcon}>🎯</span>
                                    <span>{achievement.requirement}</span>
                                </div>

                                {!unlocked && (
                                    <div className={styles.progressSection}>
                                        <div className={styles.progressLabel}>
                                            <span>Progress</span>
                                            <span className={styles.progressNumbers}>
                                                {current} / {achievement.target}
                                            </span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementsPage;
