'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './UserTray.module.css';
import WinnerAlerter from './WinnerAlerter/WinnerAlerter';
import DailyLoginButton from './DailyLoginButton';
import TokenShop from './TokenShop';

const UserTray = () => {
    const { user, logout, refreshUser } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const pathname = usePathname();

    // Auto-close dropdown when route changes
    useEffect(() => {
        setIsExpanded(false);
    }, [pathname]);

    // HEARTBEAT: Keep tokens/tickets in sync across tabs or after background updates
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => {
            refreshUser();
        }, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, [user, refreshUser]);

    // GUARD CLAUSE: Do not render anything if the user object is not yet loaded.
    if (!user) {
        return null;
    }

    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    // SAFE PERMISSION CHECK: Check permissions only after confirming user exists.
    const isAdmin = user.permissions?.includes('super_admin') || user.permissions?.includes('can_manage_users');

    return (
        <div className={styles.wrapper} ref={menuRef}>
            <WinnerAlerter />
            <div className={styles.tray}>
                <div className={styles.balances} onClick={() => setIsExpanded(!isExpanded)}>
                    <div className={styles.stat}>
                        <span className={styles.icon}>🪙</span>
                        <span className={styles.value}>{user.tokens ?? 0}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.icon}>🎫</span>
                        <span className={styles.value}>{user.tickets ?? 0}</span>
                    </div>
                </div>

                <div
                    className={`${styles.avatarContainer} ${user.equipped?.frame ? styles.hasFrame : ''}`}
                    onClick={() => setIsShopOpen(true)}
                    title="Open Cosmetic Lab"
                >
                    {user.equipped?.frame && (
                        <div className={styles.frameOverlay}>
                            <img src={user.equipped.frame} alt="Frame" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                    )}
                    <div className={styles.avatar}>
                        {user.equipped?.avatar ? (
                            <img src={user.equipped.avatar} alt={user.username} className={styles.avatarImg} onError={(e) => e.currentTarget.style.display = 'none'} />
                        ) : (
                            user.username?.substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <div className={styles.editBadge}>⚙️</div>
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

            {isShopOpen && (
                <TokenShop onClose={() => setIsShopOpen(false)} />
            )}
        </div>
    );
};

export default UserTray;
