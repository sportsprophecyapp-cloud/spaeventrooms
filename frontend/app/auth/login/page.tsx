'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';

const LoginPage = () => {
    const router = useRouter();
    const { login } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Login failed. Check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass`}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Enter the arena and resume your prophecies.</p>
                
                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input 
                            type="email" 
                            required 
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input 
                            type="password" 
                            required 
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? 'Authenticating...' : 'LOGIN'}
                    </button>
                </form>

                <p className={styles.footer}>
                    New to the arena? <Link href="/auth/register">SIGN UP FREE</Link>
                </p>
                <p className={styles.forgotPassword}>
                    <Link href="/auth/reset">Forgot password?</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
