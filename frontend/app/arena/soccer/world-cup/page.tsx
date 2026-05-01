'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface TeamInfo {
    id: string;
    name: string;
    abbr: string;
    logo: string;
    color: string;
    score: string;
    winner: boolean;
}

interface Match {
    id: string;
    name: string;
    date: string;
    venue: string;
    status: string;
    statusDetail: string;
    completed: boolean;
    home: TeamInfo | null;
    away: TeamInfo | null;
}

interface WorldCupData {
    tournament: string;
    phase: string;
    startDate: string;
    matches: Match[];
}

export default function WorldCupPage() {
    const [data, setData] = useState<WorldCupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

    const fetchData = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
            const res = await fetch(`${apiUrl}/api/pulse/world-cup`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error('Error fetching World Cup:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const allMatches = data?.matches || [];
    const liveMatches = allMatches.filter(m => m.status === 'In Progress');
    const upcomingMatches = allMatches.filter(m => m.status === 'Scheduled' || m.status === 'Postponed');
    const completedMatches = allMatches.filter(m => m.completed);

    const displayed = filter === 'live' ? liveMatches
        : filter === 'upcoming' ? upcomingMatches
        : filter === 'completed' ? completedMatches
        : allMatches;

    const daysUntilStart = data?.startDate
        ? Math.max(0, Math.ceil((new Date(data.startDate).getTime() - Date.now()) / 86400000))
        : null;

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/arena/soccer" className={styles.backBtn}>← Soccer Arena</Link>
                <div className={styles.titleBlock}>
                    <span className={styles.trophy}>⚽</span>
                    <div>
                        <h1 className={styles.title}>{data?.tournament || '2026 FIFA World Cup'}</h1>
                        <p className={styles.subtitle}>{data?.phase || 'Group Stage'} · USA, Canada & Mexico</p>
                    </div>
                    <span className={styles.trophy}>🌍</span>
                </div>
                {daysUntilStart !== null && daysUntilStart > 0 && (
                    <div className={styles.countdown}>
                        <span className={styles.countdownNum}>{daysUntilStart}</span>
                        <span className={styles.countdownLabel}>days until kickoff</span>
                    </div>
                )}
                {lastUpdated && (
                    <p className={styles.updated}>Live · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                )}
            </div>

            {/* Stats Bar */}
            {!loading && data && (
                <div className={styles.statsBar}>
                    <div className={styles.stat}><span className={styles.statNum}>{allMatches.length}</span><span className={styles.statLabel}>Matches</span></div>
                    <div className={styles.stat}><span className={styles.statNum} style={{ color: '#2ed573' }}>{liveMatches.length}</span><span className={styles.statLabel}>Live</span></div>
                    <div className={styles.stat}><span className={styles.statNum} style={{ color: '#ffa502' }}>{upcomingMatches.length}</span><span className={styles.statLabel}>Scheduled</span></div>
                    <div className={styles.stat}><span className={styles.statNum}>{completedMatches.length}</span><span className={styles.statLabel}>Finished</span></div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className={styles.filterBar}>
                {(['all', 'live', 'upcoming', 'completed'] as const).map(f => (
                    <button
                        key={f}
                        className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'live' && '🔴 '}
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading World Cup fixtures...</p>
                </div>
            ) : displayed.length === 0 ? (
                <div className={styles.empty}>
                    <p>⚽ No {filter} matches found.</p>
                    <button onClick={() => setFilter('all')} className={styles.backBtn}>Show All</button>
                </div>
            ) : (
                <div className={styles.content}>
                    <div className={styles.matchGrid}>
                        {displayed.map(match => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                </div>
            )}

            {/* CTA */}
            <div className={styles.ctaSection}>
                <p className={styles.ctaText}>Make your World Cup match predictions now!</p>
                <Link href="/arena/soccer" className={styles.ctaBtn}>⚽ Predict in Soccer Arena →</Link>
            </div>
        </div>
    );
}

function MatchCard({ match }: { match: Match }) {
    const { home, away, status, statusDetail, completed, date, venue, id } = match;
    const isLive = status === 'In Progress';
    const matchDate = new Date(date);

    return (
        <Link href={`/arena/soccer`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={`${styles.matchCard} ${isLive ? styles.liveCard : ''} ${completed ? styles.completedCard : ''} ${styles.clickableCard || ''}`}>
            {isLive && <div className={styles.liveTag}><span className={styles.liveDot}></span>LIVE</div>}

            <div className={styles.matchTeams}>
                {/* Home */}
                <div className={`${styles.matchTeam} ${completed && away?.winner ? styles.loserTeam : ''}`}>
                    <img src={home?.logo} alt={home?.name} className={styles.matchLogo} onError={(e) => (e.currentTarget.style.display='none')} />
                    <span className={styles.matchTeamName}>{home?.abbr || '?'}</span>
                    {completed && <span className={`${styles.matchScore} ${home?.winner ? styles.winScore : ''}`}>{home?.score}</span>}
                </div>

                {/* VS / Score separator */}
                <div className={styles.matchMiddle}>
                    {isLive ? (
                        <span className={styles.liveScore}>{home?.score} – {away?.score}</span>
                    ) : completed ? (
                        <span className={styles.ftLabel}>FT</span>
                    ) : (
                        <div className={styles.matchTime}>
                            <span>{matchDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            <span>{matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    )}
                </div>

                {/* Away */}
                <div className={`${styles.matchTeam} ${styles.matchTeamRight} ${completed && home?.winner ? styles.loserTeam : ''}`}>
                    {completed && <span className={`${styles.matchScore} ${away?.winner ? styles.winScore : ''}`}>{away?.score}</span>}
                    <span className={styles.matchTeamName}>{away?.abbr || '?'}</span>
                    <img src={away?.logo} alt={away?.name} className={styles.matchLogo} onError={(e) => (e.currentTarget.style.display='none')} />
                </div>
            </div>

            {venue && <p className={styles.matchVenue}>📍 {venue}</p>}
            </div>
        </Link>
    );
}
