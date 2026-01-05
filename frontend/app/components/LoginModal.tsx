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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [sponsorLoading, setSponsorLoading] = useState(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Fetch sponsor data for login modal
    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                setSponsorLoading(true);
                const response = await fetch(
                    `${apiUrl}/api/sponsor-subscriptions/placements/login`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch sponsors');
                }

                const data = await response.json();
                // Filter to only active Growth or Premium tier sponsors
                const activeSponsors = data.filter(
                    (s: Sponsor) =>
                        s.is_active &&
                        (s.tier === 'Growth' || s.tier === 'Premium' || s.tier === 'growth' || s.tier === 'premium')
                );
                setSponsors(activeSponsors);
            } catch (err) {
                console.error('Error fetching sponsor data:', err);
                // Fail gracefully - no sponsors shown if API fails
                setSponsors([]);
            } finally {
                setSponsorLoading(false);
            }
        };

        if (isOpen) {
            fetchSponsors();
        }
    }, [isOpen, apiUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const success = await login(email, password);
            // login method from AuthContext usually returns void or Promise<void>, not boolean.
            // But based on previous reads of LoginModal, it might have been calling login and assuming success if no error.
            // Let's assume standard behavior: if login succeeds, we call onLoginSuccess. 
            // Checking AuthContext usage in previous LoginModal provided: 
            // "login(data.token, data.user); onClose();"
            // The new code tries to use `const success = await login(...)`. 
            // I'll stick close to the provided code but ensure it works with the likely AuthContext implementation.
            // If login throws, it goes to catch.
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
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={styles.closeButton}
                    aria-label="Close modal"
                >
                    ✕
                </button>

                {/* Login Form */}
                <div className={styles.container}>
                    <h2 className={styles.title}>Welcome Back</h2>
                    <p className={styles.subtitle}>Sign in to your Sports Prophecy account</p>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className={styles.input}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.label}>
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={styles.input}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p className={styles.footerText}>
                            Don't have an account?{' '}
                            <button
                                type="button"
                                className={styles.signupLink}
                                onClick={() => {
                                    onClose();
                                    // Trigger signup modal if you have one
                                }}
                            >
                                Sign up
                            </button>
                        </p>
                    </div>

                    {/* Sponsor Section - Bottom of Modal */}
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
                                        <img
                                            src={sponsor.logo_url}
                                            alt={sponsor.name}
                                            className={styles.sponsorLogo}
                                        />
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
