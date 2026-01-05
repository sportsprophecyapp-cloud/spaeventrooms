'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../hooks/useGamification';
import styles from './Navbar.module.css';
import TokenShop from './TokenShop';
import DailyLoginButton from './DailyLoginButton';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const { tokenBalance, loading } = useGamification();
    const [showShop, setShowShop] = useState(false);

    if (!isAuthenticated) return null;

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.container}>
                    <div className={styles.left}>
                        <span className={styles.logo}>🌌 Sports Prophecy</span>
                    </div>

                    <div className={styles.right}>
                        {/* Daily Login Button */}
                        <DailyLoginButton />

                        {/* Token Balance */}
                        <button
                            className={styles.tokenBalance}
                            onClick={() => setShowShop(true)}
                            title="Open Token Shop"
                        >
                            <span className={styles.tokenIcon}>🪙</span>
                            <span className={styles.tokenAmount}>
                                {loading ? '...' : tokenBalance.toLocaleString()}
                            </span>
                        </button>

                        {/* User Menu */}
                        <div className={styles.userMenu}>
                            <span className={styles.userEmail}>{user?.email}</span>
                            <button
                                className={styles.logoutBtn}
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Token Shop Modal */}
            {showShop && <TokenShop onClose={() => setShowShop(false)} />}
        </>
    );
}
