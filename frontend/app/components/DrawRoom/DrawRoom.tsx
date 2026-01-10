'use client';

import React, { useState, useEffect } from 'react';
import styles from './DrawRoom.module.css';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useRouter } from 'next/navigation';

interface Draw {
    id: number;
    title: string;
    prize: string;
    description: string;
    room_id: string;
    status: 'active' | 'completed';
    entry_count?: number;
    sponsor_logo?: string;
    sponsor_name?: string;
    draw_date?: string;
}

const DrawRoom = () => {
    const { token, user, refreshUser } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [draws, setDraws] = useState<Draw[]>([]);
    const [ticketCount, setTicketCount] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [enteringId, setEnteringId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!token) {
            router.push('/auth/login');
            return;
        }

        const fetchData = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            try {
                // Fetch active draws
                const drawRes = await fetch(`${apiUrl}/api/gamification/draws/active`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                let activeDraws = [];
                if (drawRes.ok) {
                    const data = await drawRes.json();
                    activeDraws = data.draws || [];
                }

                // FALLBACK: If API is empty or fails, use the Demo draws the user expects
                if (activeDraws.length === 0) {
                    activeDraws = [
                        {
                            id: 1,
                            title: "Soccer Weekly Jackpot",
                            prize: "$100 Amazon Voucher",
                            description: "Sponsored by MegaBet - Predict 10 matches correctly to enter!",
                            room_id: "soccer",
                            status: "active"
                        },
                        {
                            id: 2,
                            title: "NFL Playoff Special",
                            prize: "Authentic NFL Jersey",
                            description: "Sponsored by Fanatics - Daily entries for active predictors.",
                            room_id: "soccer",
                            status: "active"
                        }
                    ];
                }
                setDraws(activeDraws);

                // Fetch user tickets
                const ticketRes = await fetch(`${apiUrl}/api/gamification/tickets`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (ticketRes.ok) {
                    const data = await ticketRes.json();
                    setTicketCount(data.count || 0);
                }
            } catch (err) {
                console.error('Error fetching draw data:', err);
                // Fallback on error too
                setDraws([
                    {
                        id: 1,
                        title: "Soccer Weekly Jackpot",
                        prize: "$100 Amazon Voucher",
                        description: "Sponsored by MegaBet - Predict 10 matches correctly to enter!",
                        room_id: "soccer",
                        status: "active"
                    }
                ]);
            }
        };

        fetchData();
    }, [token]);

    const handleEnter = async (drawId: number) => {
        if (!token) return;
        setEnteringId(drawId);
        setMessage(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/gamification/draws/${drawId}/enter`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.ok) {
                setTicketCount(prev => Math.max(0, prev - 1));
                setMessage({ text: 'GOOD LUCK! Entry Confirmed.', type: 'success' });
                // Refresh user balances in AuthContext
                if (user) {
                    await refreshUser();
                }
            } else {
                setMessage({ text: data.error || 'Entry failed', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error. Try again!', type: 'error' });
        } finally {
            setEnteringId(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };


    return (
        <div className={styles.drawRoom}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>{t('back_to_leagues')}</button>
                <h1>{t('draw_room_title')}</h1>
                <div className={styles.ticketBadge}>
                    <span className={styles.ticketIcon}>🎫</span>
                    <div className={styles.ticketInfo}>
                        <span className={styles.ticketLabel}>{t('your_tickets')}</span>
                        <span className={styles.ticketValue}>{ticketCount}</span>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.drawGrid}>
                    {draws.map(draw => {
                        const isDemo = draw.description.toLowerCase().includes('megabet') ||
                            draw.description.toLowerCase().includes('fanatics') ||
                            draw.id < 100; // Mock IDs

                        // Calculate countdown
                        let countdown = '';
                        if (draw.draw_date) {
                            const now = new Date().getTime();
                            const target = new Date(draw.draw_date).getTime();
                            const diff = target - now;

                            if (diff > 0) {
                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                countdown = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
                            } else {
                                countdown = 'Drawing soon!';
                            }
                        }

                        return (
                            <div key={draw.id} className={`${styles.drawCard} glass`}>
                                {/* Sponsor Logo */}
                                {draw.sponsor_logo && (
                                    <img
                                        src={draw.sponsor_logo}
                                        className={styles.sponsorLogo}
                                        alt={draw.sponsor_name || 'Sponsor'}
                                    />
                                )}

                                {isDemo && (
                                    <div className={styles.demoBadge}>[TESTING] DEMO</div>
                                )}
                                <div className={styles.prizeIcon}>🎁</div>
                                <h3>{draw.title} {isDemo && '(TEST)'}</h3>
                                <p className={styles.prizeName}>{draw.prize}</p>
                                <p className={styles.drawDesc}>{draw.description}</p>

                                {/* Entry Count */}
                                <div className={styles.entryCount}>
                                    👥 {draw.entry_count || 0} {draw.entry_count === 1 ? 'entry' : 'entries'}
                                </div>

                                {/* Countdown Timer */}
                                {countdown && (
                                    <div className={styles.countdown}>
                                        ⏰ Draws in: <strong>{countdown}</strong>
                                    </div>
                                )}

                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.enterBtn}
                                        disabled={ticketCount === 0 || enteringId === draw.id}
                                        onClick={() => handleEnter(draw.id)}
                                    >
                                        {enteringId === draw.id ? 'ENTERING...' : t('enter_draw')}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {message && (
                    <div className={`${styles.messageToast} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

            </main>
        </div>
    );
};

export default DrawRoom;
