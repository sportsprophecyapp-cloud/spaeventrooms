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
}

const DrawRoom = () => {
    const { token, user } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [draws, setDraws] = useState<Draw[]>([]);
    const [ticketCount, setTicketCount] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            try {
                // Fetch active draws
                const drawRes = await fetch(`${apiUrl}/api/gamification/draws/active`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (drawRes.ok) {
                    const data = await drawRes.json();
                    setDraws(data.draws || []);
                }

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
                setDraws([]);
            }
        };

        fetchData();
    }, [token]);


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
                    {draws.map(draw => (
                        <div key={draw.id} className={`${styles.drawCard} glass`}>
                            <div className={styles.prizeIcon}>🎁</div>
                            <h3>{draw.title}</h3>
                            <p className={styles.prizeName}>{draw.prize}</p>
                            <p className={styles.drawDesc}>{draw.description}</p>

                            <div className={styles.cardActions}>
                                <button className={styles.enterBtn} disabled={ticketCount === 0 || isDrawing}>
                                    {t('enter_draw')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
};

export default DrawRoom;
