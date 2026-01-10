'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Feedback {
    id: number;
    username: string;
    prize_name: string;
    rating: number;
    comment: string;
    is_shared: boolean;
    shared_platform: string;
    created_at: string;
}

const AdminFeedbackPage = () => {
    const { token, user } = useAuth();
    const router = useRouter();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.permissions?.includes('super_admin')) {
            router.push('/');
            return;
        }

        const fetchFeedback = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            try {
                const res = await fetch(`${apiUrl}/api/gamification/feedback/all`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFeedbacks(data);
                }
            } catch (err) {
                console.error('Error fetching feedback:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, [token, user, router]);

    const avgRating = feedbacks.length > 0
        ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
        : '0.0';

    const shareCount = feedbacks.filter(f => f.is_shared).length;

    if (loading) return <div className={styles.loading}>Accessing Testimonials...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Winner Testimonials</h1>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statVal}>{feedbacks.length}</div>
                    <div className={styles.statLabel}>Total Reviews</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statVal}>{avgRating} ⭐</div>
                    <div className={styles.statLabel}>Average Rating</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statVal}>{shareCount}</div>
                    <div className={styles.statLabel}>Social Shares</div>
                </div>
            </div>

            <div className={styles.feedbackGrid}>
                {feedbacks.map((f) => (
                    <div key={f.id} className={`${styles.card} glass`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.userInfo}>
                                <h4>@{f.username}</h4>
                                <span className={styles.prizeName}>{f.prize_name}</span>
                            </div>
                            <div className={styles.rating}>
                                {Array.from({ length: f.rating }).map((_, i) => <span key={i}>⭐</span>)}
                            </div>
                        </div>
                        <p className={styles.comment}>"{f.comment || 'No comment provided.'}"</p>
                        <div className={styles.cardFooter}>
                            <span className={styles.date}>
                                {new Date(f.created_at).toLocaleDateString()}
                            </span>
                            <span className={`${styles.shareStatus} ${!f.is_shared ? styles.notShared : ''}`}>
                                {f.is_shared ? `Shared on ${f.shared_platform?.toUpperCase()}` : 'Not Shared'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {feedbacks.length === 0 && (
                <div className={styles.empty}>
                    <p>No feedback collected yet. Social proof will appear here once winners start claiming prizes!</p>
                </div>
            )}
        </div>
    );
};

export default AdminFeedbackPage;
