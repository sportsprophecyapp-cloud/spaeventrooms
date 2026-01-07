'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const { language, setLanguage } = useLanguage();

    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <Link href="/" className={styles.logoLink}>
                    <div className={styles.logoGroup}>
                        {/* REMOVED CHEESY TARGET: Letting typography lead */}
                        <span className={styles.logo}>EVENTS ARENA</span>
                    </div>
                </Link>

                <div className={styles.rightSection}>
                    <div className={styles.langPicker}>
                        <button 
                            className={`${styles.langBtn} ${language === 'en' ? styles.activeLang : ''}`}
                            onClick={() => setLanguage('en')}
                        >
                            EN
                        </button>
                        <button 
                            className={`${styles.langBtn} ${language === 'id' ? styles.activeLang : ''}`}
                            onClick={() => setLanguage('id')}
                        >
                            ID
                        </button>
                        <button 
                            className={`${styles.langBtn} ${language === 'th' ? styles.activeLang : ''}`}
                            onClick={() => setLanguage('th')}
                        >
                            TH
                        </button>
                    </div>

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
            </div>
        </nav>
    );
};

export default Navbar;
