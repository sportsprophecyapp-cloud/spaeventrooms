'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './page.module.css';

interface Supporter {
    id: number;
    username: string;
    email: string;
    role: string;
}

interface Match {
    match_id: string;
    home_team: string;
    away_team: string;
    status: string;
    league: string;
}

const AdminUsersPage = () => {
    const { token, user } = useAuth();
    const router = useRouter();
    const [activeView, setActiveTab] = useState<'users' | 'draws' | 'debug'>('users');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const isAdmin = user?.email === 'sportsprophecyapp@gmail.com';

    useEffect(() => {
        if (isAdmin && activeView === 'debug') fetchMatches();
    }, [isAdmin, activeView]);

    const fetchMatches = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/admin/matches`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setMatches(await res.json());
    };

    const handleSearch = async () => {
        if (searchTerm.length < 2) return;
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/admin/users/search?query=${searchTerm}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setSupporters(await res.json());
        } catch (err) { console.error('Search failed'); }
        finally { setIsLoading(false); }
    };

    const triggerTestMatch = async () => {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/rooms/soccer/test-game`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMessage('Test Match Created!');
                fetchMatches();
                setTimeout(() => setMessage(''), 3000);
            }
        } finally { setIsLoading(false); }
    };

    const deleteMatch = async (matchId: string) => {
        if (!confirm(`Delete match ${matchId}?`)) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${apiUrl}/api/admin/matches/${matchId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchMatches();
    };

    const nukeDebug = async () => {
        if (!confirm('NUKE ALL TEST GAMES? This cannot be undone.')) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${apiUrl}/api/admin/matches/clear-debug`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchMatches();
    };

    if (!isAdmin) return <div className={styles.error}>UNAUTHORIZED</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>COMMAND CENTER</h1>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeView === 'users' ? styles.activeTab : ''}`} onClick={() => setActiveTab('users')}>SUPPORTERS</button>
                    <button className={`${styles.tab} ${activeView === 'debug' ? styles.activeTab : ''}`} onClick={() => setActiveTab('debug')}>DEBUG</button>
                </div>
            </header>

            <main className={styles.main}>
                {message && <div className={styles.toast}>{message}</div>}

                {activeView === 'users' && (
                    <section className={styles.userView}>
                        <div className={`${styles.searchBox} glass`}>
                            <input className={styles.input} placeholder="Search Supporters..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
                            <button className={styles.searchBtn} onClick={handleSearch}>SEARCH</button>
                        </div>
                        <div className={`${styles.tableCard} glass`}>
                            {supporters.map(s => (
                                <div key={s.id} className={styles.row}>
                                    <span className={styles.username}>@{s.username}</span>
                                    <span className={styles.roleBadge}>{s.role}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeView === 'debug' && (
                    <section className={styles.debugView}>
                        <div className={`${styles.controls} glass`}>
                            <button className={styles.launchBtn} onClick={triggerTestMatch}>🧪 LAUNCH TEST MATCH</button>
                            <button className={styles.nukeBtn} onClick={nukeDebug}>☢️ NUKE ALL TEST GAMES</button>
                        </div>

                        <div className={`${styles.matchTable} glass`}>
                            <h3>ARENA MATCH OVERVIEW</h3>
                            {matches.map(m => (
                                <div key={m.match_id} className={styles.matchRow}>
                                    <div className={styles.matchMeta}>
                                        <span className={styles.matchLeague}>{m.league}</span>
                                        <span className={styles.matchTeams}>{m.home_team} vs {m.away_team}</span>
                                    </div>
                                    <div className={styles.matchActions}>
                                        <span className={styles.statusLabel}>{m.status}</span>
                                        <button className={styles.deleteBtn} onClick={() => deleteMatch(m.match_id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminUsersPage;
