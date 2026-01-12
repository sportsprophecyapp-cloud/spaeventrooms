'use client';

import React, { useState } from 'react';
import styles from './FeedbackModal.module.css';
import { useAuth } from '@/app/context/AuthContext';

interface FeedbackModalProps {
    drawId: number;
    prizeName: string;
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ drawId, prizeName, onClose }) => {
    const { token } = useAuth();
    const [step, setStep] = useState<'rating' | 'share'>('rating');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbackId, setFeedbackId] = useState<number | null>(null);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/gamification/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ drawId, rating, comment })
            });

            if (res.ok) {
                const data = await res.json();
                setFeedbackId(data.feedbackId);
                setStep('share');
            }
        } catch (err) {
            console.error('Feedback submission failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = async (platform: string) => {
        const shareText = `I just won a ${prizeName} in the Events Arena! 🏆 Join me and start winning at ${window.location.origin}`;
        let shareUrl = '';

        if (platform === 'x') {
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        } else if (platform === 'whatsapp') {
            shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        } else if (platform === 'native') {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'I won a prize!',
                        text: shareText,
                        url: window.location.origin
                    });
                } catch (err) { console.error('Sharing failed', err); }
            }
        }

        if (shareUrl) window.open(shareUrl, '_blank');

        // Track share on backend
        if (feedbackId) {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                await fetch(`${apiUrl}/api/gamification/feedback/share`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ feedbackId, platform })
                });
            } catch (err) { console.error('Share tracking failed', err); }
        }

        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
                {step === 'rating' ? (
                    <>
                        <h2 className={styles.title}>You're a Winner! 🏆</h2>
                        <p className={styles.subtitle}>How was your experience in the Arena?</p>

                        <div className={styles.stars}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <span
                                    key={s}
                                    className={`${styles.star} ${rating >= s ? styles.starActive : ''}`}
                                    onClick={() => setRating(s)}
                                >
                                    ⭐
                                </span>
                            ))}
                        </div>

                        <textarea
                            className={styles.feedbackArea}
                            placeholder="Write a quick testimonial (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <button
                            className={styles.submitBtn}
                            disabled={rating === 0 || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? 'SUBMITTING...' : 'CLAIM PRIZE & SUBMIT'}
                        </button>
                    </>
                ) : (
                    <>
                        <div className={styles.successIcon}>🎊</div>
                        <h2 className={styles.shareTitle}>Share your win to earn 10 Tokens!</h2>

                        <div className={styles.shareGrid}>
                            <div className={styles.shareBtn} onClick={() => handleShare('x')}>
                                <span className={styles.iconX}>𝕏</span>
                                <span className={styles.platformName}>X / Twitter</span>
                            </div>
                            <div className={styles.shareBtn} onClick={() => handleShare('whatsapp')}>
                                <span className={styles.iconWA}>📱</span>
                                <span className={styles.platformName}>WhatsApp</span>
                            </div>
                            <div className={styles.shareBtn} onClick={() => handleShare('native')}>
                                <span className={styles.iconNative}>🔗</span>
                                <span className={styles.platformName}>Share Link</span>
                            </div>
                        </div>

                        <button className={styles.skipBtn} onClick={onClose}>Not now, take me back</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
