'use client';

import React, { useState, useEffect } from 'react';
import styles from './DrawRoom.module.css';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TicketShareCard from '../TicketShareCard/TicketShareCard';

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
    prize_image?: string;
}

const DrawRoom = () => {
    const { token, user, refreshUser } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [draws, setDraws] = useState<Draw[]>([]);
    const [myEntries, setMyEntries] = useState<Record<number, number>>({});
    const [ticketCount, setTicketCount] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [enteringId, setEnteringId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [now, setNow] = useState(Date.now());

    // TICKING TIMER
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // ADMIN STATE
    const [editingDrawId, setEditingDrawId] = useState<number | null>(null);
    const [editDate, setEditDate] = useState('');
    const [editStatus, setEditStatus] = useState<'active' | 'completed'>('active');
    const [selectedShareDraw, setSelectedShareDraw] = useState<Draw | null>(null);

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

                // Fetch my entries
                const entriesRes = await fetch(`${apiUrl}/api/gamification/draws/my-entries`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (entriesRes.ok) {
                    const data = await entriesRes.json();
                    const entryMap: Record<number, number> = {};
                    (data.entries || []).forEach((e: { draw_id: number, count: string }) => {
                        entryMap[e.draw_id] = parseInt(e.count);
                    });
                    setMyEntries(entryMap);
                }
            } catch (err) {
                console.error('Error fetching draw data:', err);
                setDraws([]);
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

                // OPTIMISTIC ENTRY COUNT UPDATE
                setDraws(prev => prev.map(d =>
                    d.id === drawId ? { ...d, entry_count: (d.entry_count || 0) + 1 } : d
                ));

                // UPDATE MY ENTRIES
                setMyEntries(prev => ({
                    ...prev,
                    [drawId]: (prev[drawId] || 0) + 1
                }));

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

    const handleUpdate = async (drawId: number) => {
        if (!token) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/gamification/draws/${drawId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    draw_date: editDate ? new Date(editDate).toISOString() : undefined,
                    status: editStatus
                })
            });

            if (res.ok) {
                setMessage({ text: 'Draw Updated!', type: 'success' });
                setEditingDrawId(null);
                // Refresh list
                const drawRes = await fetch(`${apiUrl}/api/gamification/draws/active`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (drawRes.ok) {
                    const data = await drawRes.json();
                    setDraws(data.draws || []);
                }
            } else {
                setMessage({ text: 'Update failed', type: 'error' });
            }
        } catch (e) {
            setMessage({ text: 'Update Error', type: 'error' });
        }
    };


    return (
        <div className={styles.drawRoom}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>{t('back_to_leagues')}</button>
                <h1>{t('draw_room_title')}</h1>
                <div className={styles.headerRight}>
                    <div className={styles.ticketEarningsInfo}>
                        <span className={styles.infoIcon}>ℹ️</span>
                        <div className={styles.infoTooltip}>
                            <h4>How to earn Tickets?</h4>
                            <ul>
                                <li>✅ 1 Ticket per Correct Call</li>
                                <li>🔥 Bonus Tickets for Streaks</li>
                                <li>📅 Daily Login Reward</li>
                            </ul>
                        </div>
                    </div>
                    <Link href="/sponsors/pricing" className={styles.sponsorBtn}>
                        💎 Sponsor This Arena
                    </Link>
                    <div className={styles.ticketBadge}>
                        <span className={styles.ticketIcon}>🎫</span>
                        <div className={styles.ticketInfo}>
                            <span className={styles.ticketLabel}>{t('your_tickets')}</span>
                            <span className={styles.ticketValue}>{ticketCount}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.drawGrid}>
                    {draws.map(draw => {
                        // FIX: Only show DEMO if explicitly named in description. DO NOT check ID < 100.
                        const isDemo = draw.description.toLowerCase().includes('megabet') ||
                            draw.description.toLowerCase().includes('fanatics');

                        // Calculate countdown
                        let countdown = '';
                        let isUrgent = false;
                        if (draw.draw_date) {
                            const target = new Date(draw.draw_date).getTime();
                            const diff = target - now;

                            if (diff > 0) {
                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                                if (days > 0) {
                                    countdown = `${days}d ${hours}h ${minutes}m`;
                                } else {
                                    isUrgent = true;
                                    countdown = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                                }
                            } else {
                                countdown = 'Drawing soon!';
                            }
                        }

                        return (
                            <div key={draw.id} className={`${styles.drawCard} glass`}>
                                {/* ADMIN EDIT OVERLAY */}
                                {user?.role === 'admin' && (
                                    <div className={styles.adminControls}>
                                        <button
                                            className={styles.adminEditBtn}
                                            onClick={() => {
                                                setEditingDrawId(draw.id);
                                                setEditStatus(draw.status);
                                                // Default to +1 hour if no date
                                                const d = draw.draw_date ? new Date(draw.draw_date) : new Date(Date.now() + 3600000);
                                                setEditDate(d.toISOString().slice(0, 16)); // Format for datetime-local
                                            }}
                                        >
                                            ✏️ Edit
                                        </button>
                                    </div>
                                )}

                                {editingDrawId === draw.id && (
                                    <div className={styles.editOverlay}>
                                        <h4>Admin Edit</h4>
                                        <label>Countdown Time:</label>
                                        <input
                                            type="datetime-local"
                                            value={editDate}
                                            onChange={(e) => setEditDate(e.target.value)}
                                            style={{ color: 'black', marginBottom: '10px' }}
                                        />
                                        <label>Status:</label>
                                        <select
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value as any)}
                                            style={{ color: 'black', marginBottom: '10px' }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleUpdate(draw.id)} style={{ background: 'green', padding: '5px' }}>Save</button>
                                            <button onClick={() => setEditingDrawId(null)} style={{ background: 'red', padding: '5px' }}>Cancel</button>
                                        </div>
                                    </div>
                                )}

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

                                {draw.prize_image ? (
                                    <img src={draw.prize_image} className={styles.prizeImage} alt="Prize" />
                                ) : (
                                    <div className={styles.prizeIcon}>🎁</div>
                                )}

                                <h3>{draw.title} {isDemo && '(TEST)'}</h3>
                                <p className={styles.prizeName}>{draw.prize}</p>
                                <p className={styles.drawDesc}>{draw.description}</p>

                                {/* Entry Count */}
                                <div className={styles.entryStats}>
                                    <div className={styles.totalEntries}>
                                        👥 {draw.entry_count || 0} {draw.entry_count === 1 ? 'entry' : 'entries'}
                                    </div>
                                    {myEntries[draw.id] > 0 && (
                                        <div className={styles.myEntriesRow}>
                                            <div className={styles.myEntries}>
                                                ⭐ Your entries: <strong>{myEntries[draw.id]}</strong>
                                            </div>
                                            <button 
                                                className={styles.shareEntryBtn}
                                                onClick={() => setSelectedShareDraw(draw)}
                                                title="Share Golden Ticket"
                                            >
                                                📤 Share
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Countdown Timer */}
                                {countdown && (
                                    <div className={`${styles.countdown} ${isUrgent ? styles.urgent : ''}`}>
                                        ⏰ {isUrgent ? t('ends_in') : t('draws_in')} <strong>{countdown}</strong>
                                    </div>
                                )}

                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.enterBtn}
                                        disabled={ticketCount === 0 || enteringId === draw.id}
                                        onClick={() => handleEnter(draw.id)}
                                    >
                                        {enteringId === draw.id ? t('entering') :
                                            myEntries[draw.id] > 0 ? t('enter_again') : t('enter_draw')}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {draws.length === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🏆</div>
                            <h3>Inaugural Draw Launching June 1st</h3>
                            <p>Our first Grand Champion prize draw is almost here. Make predictions now to stock up on tickets before the draw goes live.</p>
                            <div className={styles.launchCountdown}>
                                {(() => {
                                    const target = new Date('2026-06-01T00:00:00').getTime();
                                    const diff = target - now;
                                    if (diff <= 0) return <span>🎉 Draw is LIVE!</span>;
                                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                                    return (
                                        <div className={styles.countdownSegments}>
                                            <div className={styles.countdownSeg}><span>{days}</span><label>DAYS</label></div>
                                            <div className={styles.countdownSep}>:</div>
                                            <div className={styles.countdownSeg}><span>{String(hours).padStart(2,'0')}</span><label>HRS</label></div>
                                            <div className={styles.countdownSep}>:</div>
                                            <div className={styles.countdownSeg}><span>{String(minutes).padStart(2,'0')}</span><label>MIN</label></div>
                                            <div className={styles.countdownSep}>:</div>
                                            <div className={styles.countdownSeg}><span>{String(seconds).padStart(2,'0')}</span><label>SEC</label></div>
                                        </div>
                                    );
                                })()}
                            </div>
                            <Link href="/" className={styles.earnTicketsBtn}>
                                🎫 Make Predictions to Earn Tickets →
                            </Link>
                        </div>
                    )}
                </div>

                {message && (
                    <div className={`${styles.messageToast} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                {selectedShareDraw && user && (
                    <TicketShareCard 
                        prizeTitle={selectedShareDraw.title}
                        prizeValue={selectedShareDraw.prize}
                        sponsorName={selectedShareDraw.sponsor_name || 'Events Arena'}
                        username={user.username || 'Fan'}
                        referralCode={user.id.toString()}
                        onClose={() => setSelectedShareDraw(null)}
                    />
                )}

            </main>
        </div>
    );
};

export default DrawRoom;
