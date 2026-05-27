'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './maintenance.module.css';

export default function MaintenancePage() {
    const router = useRouter();
    const [retrying, setRetrying] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleRetry = async () => {
        setRetrying(true);
        setStatusMessage('Rechecking connection to the Arena...');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
        
        try {
            // Set 5 second timeout for quick retry check
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`${apiUrl}/health`, {
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                setStatusMessage('Connection restored! Redirecting...');
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            } else {
                setStatusMessage('The Arena is still taking a timeout. Please try again in a moment.');
                setRetrying(false);
            }
        } catch (err) {
            console.error('Retry failed:', err);
            setStatusMessage('Could not reach the Arena yet. It may still be waking up or resolving limits.');
            setRetrying(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass`}>
                <div className={styles.iconWrapper}>
                    <span className={styles.icon}>⚡</span>
                </div>
                
                <h1 className={styles.title}>
                    EVENTS <span className={styles.accent}>ARENA</span>
                </h1>
                
                <h2 className={styles.subtitle}>Arena Temporary Timeout</h2>
                
                <p className={styles.description}>
                    We have temporarily hit our daily limits on our free-tier hosting database, or the Arena is undergoing scheduled maintenance. 
                    No data has been lost, and your prediction records are completely safe.
                </p>

                <div className={styles.infoBox}>
                    <p className={styles.infoTitle}>🚧 What this means:</p>
                    <ul className={styles.infoList}>
                        <li>Match lobbies and predictions are temporarily paused.</li>
                        <li>Database queries are suspended to protect system integrity.</li>
                        <li>Static resources (FAQ/Terms/Privacy) remain fully readable.</li>
                    </ul>
                </div>

                {statusMessage && (
                    <div className={`${styles.statusMessage} ${retrying ? styles.pulse : ''}`}>
                        {statusMessage}
                    </div>
                )}

                <div className={styles.actionGroup}>
                    <button 
                        onClick={handleRetry} 
                        disabled={retrying}
                        className={styles.retryBtn}
                    >
                        {retrying ? 'Connecting...' : '🔄 Try Again'}
                    </button>
                    
                    <a 
                        href="https://wa.me/16475540219" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.supportBtn}
                    >
                        💬 Contact WhatsApp Support
                    </a>
                </div>

                <div className={styles.footerText}>
                    Thank you for your patience! We'll have the gates reopened shortly.
                </div>
            </div>
        </div>
    );
}
