'use client';

import React, { useState } from 'react';
import styles from './delete.module.css';

const DeleteAccountPage = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would call the backend delete endpoint
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className={styles.container}>
                <div className={`${styles.successCard} glass`}>
                    <h1>🗑️ REQUEST RECEIVED</h1>
                    <p>Your account deletion request for <strong>{email}</strong> has been received. All data will be permanently purged within 48 hours.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <main className={`${styles.card} glass`}>
                <h1 className={styles.title}>ACCOUNT DELETION</h1>
                <p className={styles.warning}>DANGER: This action is permanent and cannot be undone.</p>
                
                <section className={styles.info}>
                    <p>Deleting your account will permanently remove:</p>
                    <ul>
                        <li>All earned XP and Levels</li>
                        <li>Current Token Balances</li>
                        <li>All Prize Draw Tickets</li>
                        <li>Your Fan Arena handle and history</li>
                    </ul>
                </section>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <label>Confirm Email Address</label>
                    <input 
                        required 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                    />
                    <button type="submit" className={styles.deleteBtn}>PERMANENTLY DELETE MY ACCOUNT</button>
                </form>
            </main>
        </div>
    );
};

export default DeleteAccountPage;
