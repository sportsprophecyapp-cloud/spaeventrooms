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

interface Draw {
    id: number;
    title: string;
    prize_description: string;
    status: string;
    winner_name: string | null;
    sponsor_name: string | null;
}

const AdminUsersPage = () => {
    const { token, user } = useAuth();
    const router = useRouter();
    const [activeView, setActiveTab] = useState<'users' | 'draws' | 'debug'>('users');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [draws, setDraws] = useState<Draw[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const isAdmin = user?.email === 'sportsprophecyapp@gmail.com';

    useEffect(() => {
        if (isAdmin && activeView === 'draws') fetchDraws();
    }, [isAdmin, activeView]);

    const fetchDraws = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/admin/draws`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setDraws(await res.json());
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
                setMessage('Test Match Created! Resolve it in 1 minute.');
                setTimeout(() => setMessage(''), 5000);
            }
        } catch (e) {
            setMessage('Failed to create test match');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAdmin) return <div className={styles.error}>UNAUTHORIZED</div>;

    return (
        <div className={styles.container}>
            <div className={styles.navBar}>
                <button onClick={() => router.back()} className={styles.backBtn}>← RETURN</button>
            </div>

            <header className={styles.header}>
                <h1 className={styles.title}>COMMAND CENTER</h1>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeView === 'users' ? styles.activeTab : ''}`} onClick={() => setActiveTab('users')}>SUPPORTERS</button>
                    <button className={`${styles.tab} ${activeView === 'draws' ? styles.activeTab : ''}`} onClick={() => setActiveTab('draws')}>DRAWS</button>
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

                {activeView === 'draws' && (
                    <section className={styles.drawView}>
                        <div className={styles.drawGrid}>
                            {draws.map(draw => (
                                <div key={draw.id} className={`${styles.drawCard} glass`}>
                                    <h3>{draw.title}</h3>
                                    <p>{draw.prize_description}</p>
                                    <p className={styles.drawStatus}>{draw.status.toUpperCase()}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeView === 'debug' && (
                    <section className={styles.debugView}>
                        <div className={`${styles.card} glass`}>
                            <h3>Resolution Engine Tester</h3>
                            <p>Create a fake match that finishes in 60 seconds to verify prize ticket awarding.</p>
                            <button className={styles.launchBtn} onClick={triggerTestMatch} disabled={isLoading}>
                                🧪 LAUNCH TEST MATCH
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminUsersPage;
