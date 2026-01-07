'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    tokens: number;
    points: number;
    level: number;
    total_predictions: number;
    correct_predictions: number;
    streak: number;
    draw_entries?: number; // Added entries count
}

const ProfilePage = () => {
    const { userId } = useParams();
    const router = useRouter();
    const { user, isAuthenticated, token, login } = useAuth(); 
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [editError, setEditError] = useState('');
    const [copyMessage, setCopyMessage] = useState('');

    const fetchProfileData = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/auth/profile/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                
                // Fetch Ticket Count specifically
                const ticketRes = await fetch(`${apiUrl}/api/gamification/tickets`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const ticketData = await ticketRes.json();

                setProfile({
                    ...data.user,
                    draw_entries: ticketData.count || 0
                });
                setNewName(data.user.username);
            }
        } catch (err) {
            console.error('Error fetching profile data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchProfileData();
        }
    }, [userId, isAuthenticated, token]);

    const handleUpdateIdentity = async () => {
        setEditError('');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
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
                login(token!, data.user);
                setIsEditing(false);
            } else {
                setEditError(data.error || 'Name already taken');
            }
        } catch (err) {
            setEditError('Connection failed.');
        }
    };

    const handleCopyReferral = () => {
        if (!profile) return;
        const refUrl = `${window.location.origin}/auth/register?ref=${profile.id}`;
        navigator.clipboard.writeText(refUrl);
        setCopyMessage('LINK COPIED! (+50 TOKENS)');
        setTimeout(() => setCopyMessage(''), 3000);
    };

    if (isLoading) return <div className={styles.loading}>Accessing Prophet Records...</div>;
    if (!profile) return <div className={styles.error}>Prophet not found.</div>;

    const isOwnProfile = user?.id.toString() === userId;

    return (
        <div className={styles.container}>
            <div className={styles.navBar}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    ← RETURN TO ARENA
                </button>
            </div>

            <header className={styles.header}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarWrapper} style={{ borderColor: 'var(--accent)' }}>
                        <div className={styles.avatar}>
                            {profile.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className={styles.userInfo}>
                        {isOwnProfile && isEditing ? (
                            <div className={styles.editArea}>
                                <input 
                                    className={styles.nameInput}
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Enter Handle"
                                    maxLength={15}
                                />
                                <button className={styles.saveBtn} onClick={handleUpdateIdentity}>SAVE</button>
                                <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>✕</button>
                                {editError && <p className={styles.editError}>{editError}</p>}
                            </div>
                        ) : (
                            <div className={styles.nameDisplay}>
                                <h1 className={styles.username}>@{profile.username}</h1>
                                {isOwnProfile && (
                                    <button className={styles.editBtn} onClick={() => setIsEditing(true)}>✎ Edit Identity</button>
                                )}
                            </div>
                        )}
                        <div className={styles.badges}>
                            <span className={styles.levelBadge}>Level {profile.level || 1}</span>
                            <span className={styles.pointsBadge}>💎 {profile.points || 0} XP</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                <section className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.ticketCard} glass`}>
                        <span className={styles.statLabel}>PRIZE DRAW TICKETS</span>
                        <span className={styles.statValue}>🎫 {profile.draw_entries || 0}</span>
                        <p className={styles.statHint}>Earned from skill & streaks</p>
                    </div>
                    <div className={`${styles.statCard} glass`}>
                        <span className={styles.statLabel}>PROPHET TOKENS</span>
                        <span className={styles.statValue}>🪙 {profile.tokens}</span>
                    </div>
                    <div className={`${styles.statCard} glass`}>
                        <span className={styles.statLabel}>ARENA RANK</span>
                        <span className={styles.statValue}>#{profile.level > 1 ? '12' : '---'}</span>
                    </div>
                </section>

                {isOwnProfile && (
                    <section className={`${styles.referralCard} glass`}>
                        <div className={styles.refInfo}>
                            <h3>RECRUIT NEW PROPHETS</h3>
                            <p>Share your link and earn 50 tokens for every signup.</p>
                        </div>
                        <button onClick={handleCopyReferral} className={styles.copyBtn}>
                            {copyMessage || 'COPY REFERRAL LINK'}
                        </button>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
