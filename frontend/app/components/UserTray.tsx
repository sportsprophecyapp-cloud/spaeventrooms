'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './UserTray.module.css';

const UserTray = () => {
    const { user } = useAuth(); // Only need user object from context
    const [isExpanded, setIsExpanded] = useState(false);

    if (!user) return null; // Don't render if not logged in

    const isAdmin = user.role === 'admin';

    return (
        <div className={styles.wrapper}>
            <div className={styles.tray} onClick={() => setIsExpanded(!isExpanded)}>
                <div className={styles.stat}>
                    <span className={styles.icon}>🪙</span>
                    {/* Use the user object directly from AuthContext for consistency */}
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
