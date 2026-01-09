'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';
import RewardCenter from '@/app/components/RewardCenter/RewardCenter';

// ... (interfaces remain the same)

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
    const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]); // NEW
    const [isLoading, setIsLoading] = useState(true);
    
    // ... (editing and other state)

    useEffect(() => {
        const fetchProfileData = async () => {
            // ... (existing profile fetch logic)
        };

        const fetchUnlockedBadges = async () => { // NEW
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/badges/my-badges`, { 
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setUnlockedBadges(await res.json());
                }
            } catch (err) {
                console.error('Error fetching unlocked badges:', err);
            }
        };

        if (isAuthenticated && token) {
            fetchProfileData();
            if (user?.id.toString() === userId) {
                fetchUnlockedBadges(); // Only fetch for own profile
            }
        }
    }, [userId, isAuthenticated, token, user]);

    const handleEquipBadge = async (badgeId: number) => { // NEW
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            await fetch(`${apiUrl}/api/badges/equip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ badgeId })
            });
            // Optionally, refresh profile or give feedback
            alert('Badge equipped!');
        } catch (err) {
            alert('Failed to equip badge.');
        }
    };

    // ... (other handlers)

    if (isLoading) return <div className={styles.loading}>Accessing Records...</div>;
    if (!profile) return <div className={styles.error}>User not found.</div>;

    const isOwnProfile = user?.id.toString() === userId;

    return (
        <div className={styles.container}>
            {/* ... (navBar and header) ... */}

            <div className={styles.content}>
                {/* ... (statsGrid and other sections) ... */}

                {isOwnProfile && (
                    <section className={`${styles.badgeLocker} glass`}>
                        <h3 className={styles.sectionTitle}>My Badge Locker</h3>
                        <div className={styles.badgesGrid}>
                            {unlockedBadges.length > 0 ? unlockedBadges.map(badge => (
                                <div key={badge.id} className={styles.badgeCard}>
                                    <img src={badge.image_url} alt={badge.name} className={styles.badgeImage} />
                                    <h4>{badge.name}</h4>
                                    <p>{badge.description}</p>
                                    <button onClick={() => handleEquipBadge(badge.id)} className={styles.equipBtn}>
                                        Equip
                                    </button>
                                </div>
                            )) : <p>No badges unlocked yet.</p>}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
