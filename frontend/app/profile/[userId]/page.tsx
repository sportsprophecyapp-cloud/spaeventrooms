'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    tokens: number;
    crowns: number;
    level: number;
    total_predictions: number;
    correct_predictions: number;
    streak: number;
    avatar_url?: string;
    frame_url?: string;
}

interface PredictionHistory {
    id: number;
    match_name: string;
    question: string;
    prediction: string;
    result: 'correct' | 'incorrect' | 'pending';
    points_earned: number;
    created_at: string;
}

const ProfilePage = () => {
    const { userId } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [history, setHistory] = useState<PredictionHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const token = localStorage.getItem('token');
                
                // Fetch profile
                const profileRes = await fetch(`${apiUrl}/api/auth/profile/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                // Fetch prediction history
                const historyRes = await fetch(`${apiUrl}/api/rooms/all/predictions/user/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setProfile(profileData.user);
                }

                if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    setHistory(historyData.predictions || []);
                }
            } catch (err) {
                console.error('Error fetching profile data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchProfileData();
        }
    }, [userId, isAuthenticated]);

    if (isLoading) return <div className={styles.loading}>Loading Prophet Data...</div>;
    if (!profile) return <div className={styles.error}>Prophet not found.</div>;

    const accuracy = profile.total_predictions > 0 
        ? ((profile.correct_predictions / profile.total_predictions) * 100).toFixed(1) 
        : '0';

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarWrapper} style={{ borderColor: profile.frame_url || 'var(--accent)' }}>
                        <div className={styles.avatar}>
                            {profile.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className={styles.userInfo}>
                        <h1 className={styles.username}>@{profile.username}</h1>
                        <div className={styles.badges}>
                            <span className={styles.levelBadge}>Level {profile.level}</span>
                            <span className={styles.streakBadge}>⭐ {profile.streak} Day Streak</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                <section className={styles.statsGrid}>
                    <div className={`${styles.statCard} glass`}>
                        <span className={styles.statLabel}>Accuracy</span>
                        <span className={styles.statValue}>{accuracy}%</span>
                    </div>
                    <div className={`${styles.statCard} glass`}>
                        <span className={styles.statLabel}>Predictions</span>
                        <span className={styles.statValue}>{profile.total_predictions}</span>
                    </div>
                    <div className={`${styles.statCard} glass`}>
                        <span className={styles.statLabel}>Tokens</span>
                        <span className={styles.statValue}>{profile.tokens}</span>
                    </div>
                </section>

                <section className={styles.historySection}>
                    <h2 className={styles.sectionTitle}>Prediction History</h2>
                    <div className={styles.historyList}>
                        {history.length === 0 ? (
                            <p className={styles.emptyMsg}>No prophecies recorded yet.</p>
                        ) : (
                            history.map(item => (
                                <div key={item.id} className={`${styles.historyCard} glass`}>
                                    <div className={styles.historyInfo}>
                                        <h3>{item.match_name}</h3>
                                        <p>{item.question}</p>
                                        <span className={styles.predictionText}>Predicted: {item.prediction}</span>
                                    </div>
                                    <div className={`${styles.status} ${styles[item.result]}`}>
                                        {item.result === 'pending' ? '...' : (item.result === 'correct' ? `+${item.points_earned} PTS` : '✗')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;
