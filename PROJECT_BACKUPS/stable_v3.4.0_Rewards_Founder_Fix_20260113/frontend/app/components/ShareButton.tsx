'use client';

import React, { useState } from 'react';
import styles from './ShareButton.module.css';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';

interface ShareButtonProps {
    roomId: string;
}

export default function ShareButton({ roomId }: ShareButtonProps) {
    const { shareRoom } = useGamification();
    const { user } = useAuth();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [sharing, setSharing] = useState(false);

    const referralLink = user
        ? `${window.location.origin}/signup?ref=${user.id}`
        : '';

    const handleShare = async () => {
        setSharing(true);
        setMessage(null);

        const result = await shareRoom(roomId);

        if (result.success) {
            setMessage({ type: 'success', text: result.message || '+50 tokens earned!' });

            // Copy link to clipboard
            if (navigator.clipboard && referralLink) {
                await navigator.clipboard.writeText(referralLink);
            }
        } else {
            setMessage({ type: 'error', text: result.message || 'Share failed' });
        }

        setTimeout(() => setMessage(null), 5000);
        setSharing(false);
    };

    return (
        <div className={styles.container}>
            <button
                className={styles.shareBtn}
                onClick={handleShare}
                disabled={sharing}
            >
                <span className={styles.icon}>🔗</span>
                <span>{sharing ? 'Sharing...' : 'Share & Earn 50 Tokens'}</span>
            </button>

            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                    {message.type === 'success' && ' Link copied to clipboard!'}
                </div>
            )}

            {referralLink && (
                <div className={styles.linkPreview}>
                    <span className={styles.linkLabel}>Your referral link:</span>
                    <code className={styles.link}>{referralLink}</code>
                </div>
            )}
        </div>
    );
}
