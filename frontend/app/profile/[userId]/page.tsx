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
    image_url: string;
}

const ProfilePage = () => {
    const { userId } = useParams();
    const router = useRouter();
    const { user, isAuthenticated, token, login } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [editError, setEditError] = useState('');
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
                    setNewName(data.user.username);
                }
            } catch (err) { console.error('Error fetching profile data:', err); }
        };

        const fetchUnlockedBadges = async () => {
            if (user?.id.toString() !== userId) return;
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/badges/my-badges`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) setUnlockedBadges(await res.json());
            } catch (err) { console.error('Error fetching unlocked badges:', err); }
        };
        
        setIsLoading(true);
        Promise.all([fetchProfileData(), fetchUnlockedBadges()]).finally(() => setIsLoading(false));

    }, [userId, isAuthenticated, token, user]);

    const handleUpdateIdentity = async () => {
        setEditError('');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/auth/username`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newUsername: newName })
            });
            const data = await res.json();
            if (res.ok) {
                setProfile(p => p ? { ...p, username: data.user.username } : null);
                if (user) login(token!, { ...user, username: data.user.username });
                setIsEditing(false);
            } else {
                setEditError(data.error || 'Name already taken');
            }
        } catch (err) { setEditError('Connection failed.'); }
    };

    const handleCopyReferral = () => {
        if (!profile) return;
        const refUrl = `${window.location.origin}/auth/register?ref=${profile.id}`;
        navigator.clipboard.writeText(refUrl);
        setCopyMessage('LINK COPIED! (+50 TOKENS)');
        setTimeout(() => setCopyMessage(''), 3000);
    };
    
    const handleEquipBadge = async (badgeId: number) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/badges/equip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ badgeId })
            });
            if(res.ok) alert('Badge equipped! It will show up in chat shortly.');
            else alert('Failed to equip badge.');
        } catch (err) { alert('Server error while equipping badge.'); }
    };

    if (isLoading) return <div className={styles.loading}>Accessing Records...</div>;
    if (!profile) return <div className={styles.error}>User not found.</div>;

    const isOwnProfile = user?.id.toString() === userId;

    return (
        <div className={styles.container}>
            <div className={styles.navBar}>
                <button onClick={() => router.back()} className={styles.backBtn}>← RETURN TO ARENA</button>
            </div>

            <header className={styles.header}>{/* ... */}</header>

            <div className={styles.content}>
                <section className={styles.statsGrid}>{/* ... */}</section>

                {isOwnProfile && (
                    <>
                        <section className={`${styles.referralCard} glass`}>
                            <div className={styles.refInfo}>
                                <h3>RECRUIT NEW PLAYERS</h3>
                                <p>Share your link and earn 50 tokens for every signup.</p>
                            </div>
                            <button onClick={handleCopyReferral} className={styles.copyBtn}>
                                {copyMessage || 'COPY REFERRAL LINK'}
                            </button>
                        </section>
                        
                        <RewardCenter />

                        <section className={`${styles.badgeLocker} glass`}>
                            <h3 className={styles.sectionTitle}>My Badge Locker</h3>
                            <div className={styles.badgesGrid}>
                                {unlockedBadges.length > 0 ? unlockedBadges.map(badge => (
                                    <div key={badge.id} className={styles.badgeCard}>
                                        <img src={badge.image_url} alt={badge.name} className={styles.badgeImage} />
                                        <h4>{badge.name}</h4>
                                        <p>{badge.description}</p>
                                        <button onClick={() => handleEquipBadge(badge.id)} className={styles.equipBtn}>Equip</button>
                                    </div>
                                )) : <p>No badges unlocked yet. Create some in the database!</p>}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
