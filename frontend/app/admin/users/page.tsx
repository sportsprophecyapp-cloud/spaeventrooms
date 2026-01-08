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
    created_at: string;
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
    const [activeView, setActiveTab] = useState<'users' | 'debug' | 'apps'>('users');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [apps, setApps] = useState<any[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const isAdmin = user?.email === 'sportsprophecyapp@gmail.com';

    useEffect(() => {
        if (!isAdmin) return;
        if (activeView === 'debug') fetchMatches();
        if (activeView === 'apps') fetchApps();
        if (activeView === 'users') fetchAllUsers(); // Auto-fetch all users
    }, [isAdmin, activeView]);

    const fetchAllUsers = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setSupporters(await res.json());
        } catch (e) { console.error('Fetch users failed'); }
    };

    const fetchMatches = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/admin/matches`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setMatches(await res.json());
    };

    const fetchApps = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/admin/sponsor-applications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setApps(data.applications || []);
        }
    };

    const deployApp = async (appId: number) => {
        if (!confirm('Deploy this sponsor to the live Arena instantly?')) return;
        // ... (deployment logic)
    };

    const filteredSupporters = supporters.filter(s => 
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isAdmin) return <div className={styles.error}>UNAUTHORIZED</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>COMMAND CENTER</h1>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeView === 'users' ? styles.activeTab : ''}`} onClick={() => setActiveTab('users')}>USERS ({supporters.length})</button>
                    <button className={`${styles.tab} ${activeView === 'apps' ? styles.activeTab : ''}`} onClick={() => setActiveTab('apps')}>APPLICATIONS ({apps.length})</button>
                    <button className={`${styles.tab} ${activeView === 'debug' ? styles.activeTab : ''}`} onClick={() => setActiveTab('debug')}>DEBUG</button>
                </div>
            </header>

            <main className={styles.main}>
                {message && <div className={styles.toast}>{message}</div>}

                {activeView === 'users' && (
                    <section className={styles.userView}>
                        <div className={`${styles.searchBox} glass`}>
                            <input className={styles.input} placeholder="Filter Supporters..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className={`${styles.tableCard} glass`}>
                            {filteredSupporters.map(s => (
                                <div key={s.id} className={styles.row}>
                                    <div className={styles.userMeta}>
                                        <span className={styles.username}>@{s.username}</span>
                                        <span className={styles.email}>{s.email}</span>
                                    </div>
                                    <div className={styles.userInfo}>
                                        <span className={styles.roleBadge}>{s.role}</span>
                                        <span className={styles.joinDate}>Joined {new Date(s.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                
                {/* Other Tabs Remain the Same */}
            </main>
        </div>
    );
};

export default AdminUsersPage;
