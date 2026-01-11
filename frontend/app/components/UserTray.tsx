'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './UserTray.module.css';
import WinnerAlerter from './WinnerAlerter/WinnerAlerter';
import DailyLoginButton from './DailyLoginButton';

const UserTray = () => {
    const { user, logout } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const pathname = usePathname();

    // Auto-close dropdown when route changes
    useEffect(() => {
        setIsExpanded(false);
    }, [pathname]);

    // GUARD CLAUSE: Do not render anything if the user object is not yet loaded.
    if (!user) {
        return null;
    }

    // SAFE PERMISSION CHECK: Check permissions only after confirming user exists.
    const isAdmin = user.permissions?.includes('super_admin') || user.permissions?.includes('can_manage_users');

    return (
        <div className={styles.wrapper}>
            <WinnerAlerter />
            <div className={styles.tray} onClick={() => setIsExpanded(!isExpanded)}>
                <div className={styles.stat}>
                    <span className={styles.icon}>🪙</span>
                    <span className={styles.value}>{user.tokens ?? 0}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.icon}>🎫</span>
                    <span className={styles.value}>{user.tickets ?? 0}</span>
                </div>
                <div className={styles.avatar}>
                    {user.username?.substring(0, 2).toUpperCase()}
                </div>
            </div>

            {isExpanded && (
                <div className={`${styles.dropdown} glass`}>
                    <div className={styles.header}>
                        <p className={styles.name}>@{user.username}</p>
                        <p className={styles.level}>Level {user.level ?? 1} Supporter</p>
                    </div>

                    <div className={styles.dailyReward}>
                        <DailyLoginButton />
                    </div>

                    <div className={styles.menu}>
                        <Link href={`/profile/${user.id}`} className={styles.item}>👤 My Profile</Link>
                        <Link href="/draw" className={styles.item}>🎁 Prize Draws</Link>
                        {isAdmin && (
                            <>
                                <Link href="/admin/users" className={styles.item}>🛡️ Command Center</Link>
                                <Link href="/admin/sponsors" className={styles.item}>💎 Sponsor Hub</Link>
                                <Link href="/admin/feedback" className={styles.item}>💬 Testimonials</Link>
                                <Link href="/admin/rooms/create" className={styles.item}>🪄 Arena Wizard</Link>
                            </>
                        )}
                        <button onClick={logout} className={`${styles.item} ${styles.logoutBtn}`}>Logout</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTray;
