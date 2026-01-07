'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './UserTray.module.css';

const UserTray = () => {
    const { user, token } = useAuth();
    const [userData, setUserData] = useState<any>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // REVERTED: Keep personal email for login access
    const isAdmin = user?.email === 'sportsprophecyapp@gmail.com';

    useEffect(() => {
        const fetchBalance = async () => {
            if (!token) return;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            try {
                const res = await fetch(`${apiUrl}/api/gamification/balance`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserData(data);
                }
            } catch (err) {
                console.error('Failed to fetch balance');
            }
        };

        fetchBalance();
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, [token]);

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
