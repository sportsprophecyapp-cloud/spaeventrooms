'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './auth.module.css';

const ResetForm = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Missing reset token. Please request a new link.');
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Password successfully reset! Redirecting to login...');
                setTimeout(() => router.push('/auth/login'), 2000);
            } else {
                setError(data.error || 'Failed to reset password.');
            }
        } catch (err) {
            setError('Could not connect to the server.');
        }
    };

    if (!token) {
        return (
            <div className={styles.infoBox}>
                <p className={styles.errorMessage}>Invalid Link</p>
                <p>No reset token found. Please request a new password reset link.</p>
                <Link href="/auth/forgot-password" className={styles.returnLink}>Request Link</Link>
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <label htmlFor="password">New Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>
                <button type="submit" className={styles.submitBtn}>Reset Password</button>
            </form>
            {message && <p className={styles.successMessage}>{message}</p>}
            {error && <p className={styles.errorMessage}>{error}</p>}
        </>
    );
};

const ResetPasswordPage = () => {
    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass`}>
                <h1 className={styles.title}>Reset Password</h1>
                {/* Suspense boundary for useSearchParams */}
                <Suspense fallback={<p>Loading...</p>}>
                    <ResetForm />
                </Suspense>
                <Link href="/auth/login" className={styles.returnLink}>← Back to Login</Link>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
