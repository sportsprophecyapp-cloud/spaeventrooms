'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import styles from './page.module.css';

const LoginContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, rememberMe })
            });

            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user, rememberMe);
                const destination = searchParams.get('redirect') || '/';
                router.push(destination);
            } else {
                setError(data.message || 'Login failed. Check your credentials.');
            }
        } catch (err: any) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass`}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Enter the arena and resume your prophecies.</p>


                {/* Google Sign In */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            if (!credentialResponse.credential) return;
                            try {
                                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                                const res = await fetch(`${apiUrl}/api/auth/google`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ token: credentialResponse.credential })
                                });
                                const data = await res.json();
                                if (res.ok) {
                                    login(data.token, data.user);
                                    router.push('/');
                                } else {
                                    setError(data.error || 'Google Login Failed');
                                }
                            } catch (err) {
                                setError('Failed to authenticate with Google');
                            }
                        }}
                        onError={() => setError('Google Login Failed')}
                        theme="filled_black"
                        shape="pill"
                    />
                </div>

                <div className={styles.divider}>
                    <span>OR CONTINUE WITH EMAIL</span>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className={styles.toggleBtn}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className={styles.rememberMeWrapper}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="rememberMe">Remember me for 30 days</label>
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
                    <Link href="/auth/forgot-password">Forgot password?</Link>
                </p>
            </div>
        </div>
    );
};

const LoginPage = () => (
    <Suspense fallback={
        <div style={{ 
            height: '100vh', 
            background: '#000', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#B4975A',
            fontSize: '18px',
            fontWeight: '900',
            letterSpacing: '3px'
        }}>
            ENTERING ARENA...
        </div>
    }>
        <LoginContent />
    </Suspense>
);

export default LoginPage;
