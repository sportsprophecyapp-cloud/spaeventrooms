'use client';

import React from 'react';
import Link from 'next/link';
import styles from './auth.module.css';

const ResetPasswordPage = () => {
    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass`}>
                <h1 className={styles.title}>Password Reset</h1>
                <p className={styles.subtitle}>
                    For security reasons, password resets are handled via direct support.
                </p>
                <div className={styles.infoBox}>
                    <p>Please email our support team at:</p>
                    <a href="mailto:partnerships@sportsprophecyapp.com" className={styles.emailLink}>
                        partnerships@sportsprophecyapp.com
                    </a>
                    <p>We will assist you with verifying your identity and resetting your password within 24 hours.</p>
                </div>
                <Link href="/auth/login" className={styles.returnLink}>← Back to Login</Link>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
