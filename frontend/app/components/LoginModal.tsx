'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: AuthModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const { login } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const endpoint = isRegister ? 'register' : 'login';

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            if (isRegister) {
                // If register successful, switch to login or auto-login
                setIsRegister(false);
                setError('Registration successful! Please login.');
                return;
            }

            login(data.token, data.user);
            onClose();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="********"
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.submitBtn}>
                        {isRegister ? 'Sign Up' : 'Login'}
                    </button>
                </form>
                <p className={styles.switch}>
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <span onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? 'Login' : 'Sign Up'}
                    </span>
                </p>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>
            </div>
        </div>
    );
};
