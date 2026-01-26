'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './LoginModal.module.css';

interface Sponsor {
    id: number;
    sponsor_id: number;
    placement_type: string;
    page: string;
    position: number;
    is_active: boolean;
    name: string;
    logo_url: string;
    link_url: string;
    tier: string;
}

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [sponsorLoading, setSponsorLoading] = useState(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                setSponsorLoading(true);
                const response = await fetch(
                    `${apiUrl}/api/sponsor-subscriptions/placements/login`
                );

                if (!response.ok) throw new Error('Failed to fetch sponsors');

                const data = await response.json();
                const activeSponsors = data.filter(
                    (s: Sponsor) =>
                        s.is_active &&
                        (s.tier === 'Growth' || s.tier === 'Premium' || s.tier === 'growth' || s.tier === 'premium')
                );
                setSponsors(activeSponsors);
            } catch (err) {
                console.error('Error fetching sponsor data:', err);
                setSponsors([]);
            } finally {
                setSponsorLoading(false);
            }
        };

        if (isOpen) fetchSponsors();
    }, [isOpen, apiUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Login failed');

            login(data.token, data.user);
            onLoginSuccess?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">✕</button>

                <div className={styles.container}>
                    <h2 className={styles.title}>Welcome Back</h2>
                    <p className={styles.subtitle}>Sign in to your Events Arena account</p>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="login-email" className={styles.label}>Email</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className={styles.input}
                                required
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="login-password" className={styles.label}>Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={styles.input}
                                    required
                                    disabled={loading}
                                    autoComplete="current-password"
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

                        <button type="submit" disabled={loading} className={styles.submitButton}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p className={styles.footerText}>
                            Don't have an account?{' '}
                            <button type="button" className={styles.signupLink} onClick={onClose}>Sign up</button>
                        </p>
                    </div>

                    {sponsors.length > 0 && !sponsorLoading && (
                        <div className={styles.sponsorSection}>
                            <div className={styles.sponsorDivider} />
                            <p className={styles.sponsorLabel}>Powered by</p>
                            <div className={styles.sponsorGrid}>
                                {sponsors.map((sponsor) => (
                                    <a
                                        key={sponsor.id}
                                        href={sponsor.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.sponsorItem}
                                        title={sponsor.name}
                                    >
                                        <img src={sponsor.logo_url} alt={sponsor.name} className={styles.sponsorLogo} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
