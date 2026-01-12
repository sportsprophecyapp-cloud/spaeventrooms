'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../reset/auth.module.css'; // Reusing styles from the old reset page

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Password reset email sent! Please check your inbox.');
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
                <h1 className={styles.title}>Forgot Password</h1>
                <p className={styles.subtitle}>Enter your email to receive a password reset link.</p>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn}>Send Reset Link</button>
                </form>
                {message && <p className={styles.successMessage}>{message}</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}
                <Link href="/auth/login" className={styles.returnLink}>← Back to Login</Link>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
