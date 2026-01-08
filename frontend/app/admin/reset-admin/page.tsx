'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

const ResetAdminPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/auth/reset-admin-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Admin password has been successfully reset! You can now log in.');
            } else {
                setError(data.error || 'An error occurred.');
            }
        } catch (err) {
            setError('Could not connect to the server.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass`}>
                <h2 className={styles.title}>Reset Admin Password</h2>
                <p className={styles.subtitle}>Use this form to reset the password for the default admin account (sportsprophecyapp@gmail.com).</p>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn}>Reset Password</button>
                </form>
                {message && <p className={styles.successMessage}>{message}</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}
            </div>
        </div>
    );
};

export default ResetAdminPasswordPage;
