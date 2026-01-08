'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './UserTray.module.css';

const UserTray = () => {
    const { user, token } = useAuth();
    // INITIALIZE WITH AUTH CACHE DATA TO PREVENT 0/0 FLICKER
    const [userData, setUserData] = useState<any>({
        token_balance: user?.tokens || 0,
        total_tickets: user?.tickets || 0,
        current_level: user?.level || 1
    });
    const [isExpanded, setIsExpanded] = useState(false);

    const isAdmin = user?.email === 'sportsprophecyapp@gmail.com';

    useEffect(() => {
        const fetchBalance = async () => {
            if (!token) return;
            // SYNC WITH PRODUCTION API
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.sportsprophecyapp.com';
            try {
                const res = await fetch(`${apiUrl}/api/gamification/balance`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserData(data);
                }
            } catch (err) {
                console.error('Balance Sync Failed');
            }
        };

        fetchBalance();
        // Sync every 60 seconds
        const interval = setInterval(fetchBalance, 60000);
        return () => clearInterval(interval);
    }, [token, user]);

    if (!user) return null;

    return (
        <div className={styles.wrapper}>
            <div className={styles.tray} onClick={() => setIsExpanded(!isExpanded)}>
                <div className={styles.stat}>
                    <span className={styles.icon}>🪙</span>
                    <span className={styles.value}>{userData?.token_balance ?? 0}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.icon}>🎫</span>
                    <span className={styles.value}>{userData?.total_tickets ?? 0}</span>
                </div>
                <div className={styles.avatar}>
                    {user.username?.substring(0, 2).toUpperCase()}
                </div>
            </div>

            {isExpanded && (
                <div className={`${styles.dropdown} glass`}>
                    <div className={styles.header}>
                        <p className={styles.name}>@{user.username}</p>
                        <p className={styles.level}>Level {userData?.current_level ?? 1} Supporter</p>
                    </div>
                    <div className={styles.menu}>
                        <Link href={`/profile/${user.id}`} className={styles.item}>👤 My Profile</Link>
                        {isAdmin && (
                            <>
                                <Link href="/admin/users" className={styles.item}>🛡️ Command Center</Link>
                                <Link href="/admin/rooms/create" className={styles.item}>🪄 Arena Wizard</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTray;
