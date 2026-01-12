'use client';

import React from 'react';
import styles from './page.module.css';
import ChatFilterManager from '../../components/ChatFilterManager/ChatFilterManager';

const ModerationPage = () => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>MODERATION CENTER</h1>
                <p className={styles.subtitle}>Chat Filters & User Content Management</p>
            </header>

            <main className={styles.main}>
                <ChatFilterManager />
            </main>
        </div>
    );
};

export default ModerationPage;
