'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <Link href="/" className={styles.logoLink}>
                    <div className={styles.logoGroup}>
                        <span className={styles.logoIcon}>🎯</span>
                        <span className={styles.logo}>EVENTS ARENA</span>
                    </div>
                </Link>

                <div className={styles.links}>
                    {!isAuthenticated ? (
                        <>
                            <Link href="/auth/login" className={styles.loginBtn}>LOGIN</Link>
                            <Link href="/auth/register" className={styles.registerBtn}>JOIN FREE</Link>
                        </>
                    ) : (
                        <button onClick={logout} className={styles.logoutBtn}>LOGOUT</button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
