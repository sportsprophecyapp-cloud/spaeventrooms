'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface TeamSide {
    id: string;
    name: string;
    abbr: string;
    logo: string;
    color: string;
    wins: number;
    eliminated: boolean;
}

interface SeriesData {
    id: string;
    round: string;
    summary: string;
    completed: boolean;
    home: TeamSide;
    away: TeamSide;
    status: string;
    lastGame: { home_score: string; away_score: string; detail: string };
}

interface PlayoffsData {
    season: string;
    series: SeriesData[];
}

export default function NhlPlayoffsPage() {
    const [data, setData] = useState<PlayoffsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
            const res = await fetch(`${apiUrl}/api/pulse/nhl-playoffs`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error('Error fetching NHL playoffs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5 * 60 * 1000); // refresh every 5 min
        return () => clearInterval(interval);
    }, []);

    // Group series by round label
    const rounds: Record<string, SeriesData[]> = {};
    (data?.series || []).forEach(s => {
        // Strip out "Game X", trailing dashes, and trim
        let roundKey = s.round.replace(/Game \d+/i, '').replace(/-\s*$/, '').trim() || 'Playoff Series';
        
        // Normalize common ESPN variations if needed
        if (roundKey.includes('First Round')) {
            roundKey = roundKey.replace('First Round', '1st Round');
        }

        if (!rounds[roundKey]) rounds[roundKey] = [];
        // Only add if not already there (deduplicate by id)
        if (!rounds[roundKey].find(x => x.id === s.id)) {
            rounds[roundKey].push(s);
        }
    });

    // Sort rounds logically
    const roundOrder = [
        'East 1st Round',
        'West 1st Round',
        'East 2nd Round',
        'West 2nd Round',
        'Eastern Conference Final',
        'Western Conference Final',
        'Stanley Cup Final'
    ];

    const sortedRounds = Object.entries(rounds).sort(([a], [b]) => {
        const idxA = roundOrder.findIndex(r => a.includes(r) || r.includes(a));
        const idxB = roundOrder.findIndex(r => b.includes(r) || r.includes(b));
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/arena/nhl" className={styles.backBtn}>← NHL Arena</Link>
                <div className={styles.titleBlock}>
                    <div className={styles.trophy}>🏒</div>
                    <div>
                        <h1 className={styles.title}>Stanley Cup Playoffs</h1>
                        <p className={styles.subtitle}>{data?.season || '2025-26 Postseason'}</p>
                    </div>
                    <div className={styles.cup}>🏆</div>
                </div>
                {lastUpdated && (
                    <p className={styles.updated}>
                        Live · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading playoff bracket...</p>
                </div>
            ) : !data || data.series.length === 0 ? (
                <div className={styles.empty}>
                    <p>🏒 Playoff bracket data is not yet available.</p>
                    <Link href="/arena/nhl" className={styles.backBtn}>Go to NHL Arena</Link>
                </div>
            ) : (
                <div className={styles.content}>
                    {sortedRounds.map(([roundName, seriesList]) => (
                        <div key={roundName} className={styles.roundSection}>
                            <h2 className={styles.roundTitle}>{roundName}</h2>
                            <div className={styles.seriesGrid}>
                                {seriesList.map(series => (
                                    <SeriesCard key={series.id} series={series} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA */}
            <div className={styles.ctaSection}>
                <p className={styles.ctaText}>Think you know who wins the Cup? Make your predictions!</p>
                <Link href="/arena/nhl" className={styles.ctaBtn}>🏒 Predict in NHL Arena →</Link>
            </div>
        </div>
    );
}

function SeriesCard({ series }: { series: SeriesData }) {
    const { home, away, summary, completed, lastGame } = series;
    const winner = home.wins === 4 ? home : away.wins === 4 ? away : null;

    return (
        <Link href={`/arena/nhl`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={`${styles.seriesCard} ${completed ? styles.completed : ''} ${styles.clickableCard || ''}`}>
                {completed && winner && (
                    <div className={styles.seriesWinner}>✅ {winner.abbr} ADVANCES</div>
                )}

            {/* Home Team */}
            <div className={`${styles.teamRow} ${home.eliminated ? styles.eliminated : ''}`}>
                <img src={home.logo} alt={home.name} className={styles.teamLogo} onError={(e) => (e.currentTarget.style.display = 'none')} />
                <div className={styles.teamInfo}>
                    <span className={styles.teamName}>{home.name}</span>
                    {home.eliminated && <span className={styles.eliminatedTag}>Eliminated</span>}
                </div>
                <div className={styles.winsDisplay} style={{ color: home.wins === 4 ? '#2ed573' : 'white' }}>
                    {home.wins} <span className={styles.winsLabel}>W</span>
                </div>
            </div>

            {/* Series Bar */}
            <div className={styles.seriesBar}>
                <div className={styles.winsBar} style={{ width: `${(home.wins / 4) * 50}%`, background: `#${home.color?.replace('#', '')}` }}></div>
                <div className={styles.seriesDivider}>
                    <span className={styles.seriesSummary}>{summary || `${home.wins}–${away.wins}`}</span>
                </div>
                <div className={styles.winsBar} style={{ width: `${(away.wins / 4) * 50}%`, background: `#${away.color?.replace('#', '')}`, marginLeft: 'auto' }}></div>
            </div>

            {/* Away Team */}
            <div className={`${styles.teamRow} ${away.eliminated ? styles.eliminated : ''}`}>
                <img src={away.logo} alt={away.name} className={styles.teamLogo} onError={(e) => (e.currentTarget.style.display = 'none')} />
                <div className={styles.teamInfo}>
                    <span className={styles.teamName}>{away.name}</span>
                    {away.eliminated && <span className={styles.eliminatedTag}>Eliminated</span>}
                </div>
                <div className={styles.winsDisplay} style={{ color: away.wins === 4 ? '#2ed573' : 'white' }}>
                    {away.wins} <span className={styles.winsLabel}>W</span>
                </div>
            </div>

            {/* Last game result */}
            {lastGame?.detail && (
                <div className={styles.lastGame}>
                    Last: {home.abbr} {lastGame.home_score} – {lastGame.away_score} {away.abbr} · {lastGame.detail}
                </div>
            )}
            </div>
        </Link>
    );
}
