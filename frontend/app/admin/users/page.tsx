'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';

interface Prophet {
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
    const [activeView, setActiveTab] = useState<'users' | 'draws'>('users');
    
    // User Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [prophets, setProphets] = useState<Prophet[]>([]);
    
    // Draws State
    const [draws, setDraws] = useState<Draw[]>([]);
    const [isCreatingDraw, setIsCreatingDraw] = useState(false);
    
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
            if (res.ok) setProphets(await res.json());
        } catch (err) { console.error('Search failed'); }
        finally { setIsLoading(false); }
    };

    const resolveDraw = async (drawId: number) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/admin/draws/resolve`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ drawId, prizeCount: 10 })
        });
        if (res.ok) {
            setMessage('Draw Resolved! Winners notified.');
            fetchDraws();
            setTimeout(() => setMessage(''), 3000);
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
                    <button 
                        className={`${styles.tab} ${activeView === 'users' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('users')}
                    >USER ROLES</button>
                    <button 
                        className={`${styles.tab} ${activeView === 'draws' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('draws')}
                    >PRIZE DRAWS</button>
                </div>
            </header>

            <main className={styles.main}>
                {message && <div className={styles.toast}>{message}</div>}

                {activeView === 'users' ? (
                    <section className={styles.userView}>
                        <div className={`${styles.searchBox} glass`}>
                            <input 
                                className={styles.input}
                                placeholder="Search Prophets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className={styles.searchBtn} onClick={handleSearch}>SEARCH</button>
                        </div>

                        <div className={`${styles.tableCard} glass`}>
                            {prophets.map(p => (
                                <div key={p.id} className={styles.row}>
                                    <span className={styles.username}>@{p.username}</span>
                                    <span className={styles.roleBadge}>{p.role}</span>
                                    <div className={styles.actions}>
                                        <button className={styles.adminBtn}>ADMIN</button>
                                        <button className={styles.creatorBtn}>CREATOR</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    <section className={styles.drawView}>
                        <button className={styles.createBtn} onClick={() => setIsCreatingDraw(true)}>+ CREATE NEW DRAW</button>
                        
                        <div className={styles.drawGrid}>
                            {draws.map(draw => (
                                <div key={draw.id} className={`${styles.drawCard} glass`}>
                                    <span className={styles.drawStatus}>{draw.status.toUpperCase()}</span>
                                    <h3>{draw.title}</h3>
                                    <p className={styles.prize}>{draw.prize_description}</p>
                                    <p className={styles.sponsor}>Sponsor: {draw.sponsor_name || 'Generic'}</p>
                                    
                                    {draw.status === 'active' ? (
                                        <button 
                                            className={styles.resolveBtn}
                                            onClick={() => resolveDraw(draw.id)}
                                        >RESOLVE (50/50)</button>
                                    ) : (
                                        <p className={styles.winnerText}>Winner: <span>@{draw.winner_name}</span></p>
                                    )}
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
