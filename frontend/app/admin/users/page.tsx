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
    const [activeView, setActiveTab] = useState<'users' | 'debug'>('users');
    
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
        try {
            const res = await fetch(`${apiUrl}/api/admin/matches`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setMatches(await res.json());
        } catch (e) { console.error('Fetch matches failed'); }
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
        } finally { setIsLoading(false); }
    };

    const triggerTestMatch = async () => {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            await fetch(`${apiUrl}/api/rooms/soccer/test-game`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage('Test Match Created!');
            fetchMatches();
            setTimeout(() => setMessage(''), 3000);
        } finally { setIsLoading(false); }
    };

    const deleteMatch = async (matchId: string) => {
        const isTest = matchId.startsWith('test-');
        const warnMsg = isTest ? `Delete test match?` : `🚨 DANGER: You are deleting REAL production data (${matchId}). Proceed?`;
        
        if (!confirm(warnMsg)) return;
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${apiUrl}/api/admin/matches/${matchId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchMatches();
    };

    const nukeDebug = async () => {
        if (!confirm('NUKE ALL TEST GAMES? This will NOT affect real matches.')) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${apiUrl}/api/admin/matches/clear-debug`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchMatches();
    };

    // FILTER LOGIC
    const testMatches = matches.filter(m => m.match_id.startsWith('test-'));
    const realMatches = matches.filter(m => !m.match_id.startsWith('test-'));

    if (!isAdmin) return <div className={styles.error}>UNAUTHORIZED</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>COMMAND CENTER</h1>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeView === 'users' ? styles.activeTab : ''}`} onClick={() => setActiveTab('users')}>SUPPORTERS</button>
                    <button className={`${styles.tab} ${activeView === 'debug' ? styles.activeTab : ''}`} onClick={() => setActiveTab('debug')}>ARENA DEBUG</button>
                </div>
            </header>

            <main className={styles.main}>
                {message && <div className={styles.toast}>{message}</div>}

                {activeView === 'users' && (
                    <section className={styles.userView}>
                        <div className={`${styles.searchBox} glass`}>
                            <input className={styles.input} placeholder="Search Supporters..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <button className={styles.searchBtn} onClick={handleSearch}>SEARCH</button>
                        </div>
                        <div className={`${styles.tableCard} glass`}>
                            {supporters.map(s => (
                                <div key={s.id} className={styles.row}>
                                    <span>@{s.username}</span>
                                    <span className={styles.roleBadge}>{s.role}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeView === 'debug' && (
                    <section className={styles.debugView}>
                        <div className={`${styles.controls} glass`}>
                            <div className={styles.controlInfo}>
                                <h3>🧪 TEST SIMULATOR</h3>
                                <p>Verify resolution & ticket awarding logic.</p>
                            </div>
                            <div className={styles.btnRow}>
                                <button className={styles.launchBtn} onClick={triggerTestMatch}>LAUNCH TEST</button>
                                <button className={styles.nukeBtn} onClick={nukeDebug}>NUKE ALL TESTS</button>
                            </div>
                        </div>

                        {/* SECTION 1: TEST MATCHES */}
                        <div className={`${styles.matchTable} ${styles.testTable} glass`}>
                            <h3>ACTIVE TEST SCENARIOS ({testMatches.length})</h3>
                            {testMatches.map(m => (
                                <div key={m.match_id} className={styles.matchRow}>
                                    <span className={styles.matchTeams}>{m.home_team} vs {m.away_team}</span>
                                    <button className={styles.deleteBtn} onClick={() => deleteMatch(m.match_id)}>🗑️</button>
                                </div>
                            ))}
                            {testMatches.length === 0 && <p className={styles.emptyNote}>No active test scenarios.</p>}
                        </div>

                        {/* SECTION 2: PRODUCTION DATA */}
                        <div className={`${styles.matchTable} glass`}>
                            <h3>LIVE PRODUCTION DATA ({realMatches.length})</h3>
                            <p className={styles.warningText}>Caution: Deleting these affects the live arena.</p>
                            {realMatches.map(m => (
                                <div key={m.match_id} className={styles.matchRow}>
                                    <div className={styles.matchMeta}>
                                        <span className={styles.matchLeague}>{m.league}</span>
                                        <span className={styles.matchTeams}>{m.home_team} vs {m.away_team}</span>
                                    </div>
                                    <button className={`${styles.deleteBtn} ${styles.dangerBtn}`} onClick={() => deleteMatch(m.match_id)}>🗑️</button>
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
