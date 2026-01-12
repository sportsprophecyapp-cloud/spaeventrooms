'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const SuccessPage = () => {
    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass`}>
                <span className={styles.icon}>🎉</span>
                <h1 className={styles.title}>PAYMENT RECEIVED!</h1>
                <p className={styles.text}>
                    Your sponsorship application has been secured. <br />
                    Our team will review your creative assets within 24 hours.
                </p>
                <Link href="/rooms/soccer" className={styles.btn}>
                    ENTER THE ARENA
                </Link>
            </div>
        </div>
    );
};

export default SuccessPage;
