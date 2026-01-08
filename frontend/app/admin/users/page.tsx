'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './page.module.css';

interface Application {
    id: number;
    brand_name: string;
    contact_email: string;
    prize_description: string;
    status: string;
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
    
    const [supporters, setSupporters] = useState<any[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [apps, setApps] = useState<Application[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const isAdmin = user?.email === 'sportsprophecyapp@gmail.com';

    useEffect(() => {
        if (!isAdmin) return;
        if (activeView === 'debug') fetchMatches();
        if (activeView === 'apps') fetchApps();
    }, [isAdmin, activeView]);

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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/admin/sponsor-applications/${appId}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMessage('SPONSOR LIVE! Check the Arena.');
                fetchApps();
                setTimeout(() => setMessage(''), 5000);
            }
        } catch (e) { console.error('Deployment failed'); }
    };

    if (!isAdmin) return <div className={styles.error}>UNAUTHORIZED</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>COMMAND CENTER</h1>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeView === 'users' ? styles.activeTab : ''}`} onClick={() => setActiveTab('users')}>USERS</button>
                    <button className={`${styles.tab} ${activeView === 'apps' ? styles.activeTab : ''}`} onClick={() => setActiveTab('apps')}>APPLICATIONS</button>
                    <button className={`${styles.tab} ${activeView === 'debug' ? styles.activeTab : ''}`} onClick={() => setActiveTab('debug')}>DEBUG</button>
                </div>
            </header>

            <main className={styles.main}>
                {message && <div className={styles.toast}>{message}</div>}

                {activeView === 'apps' && (
                    <section className={styles.appView}>
                        <div className={`${styles.tableCard} glass`}>
                            <h3>PENDING PARTNERSHIPS</h3>
                            {apps.map(app => (
                                <div key={app.id} className={styles.row}>
                                    <div className={styles.appMeta}>
                                        <span className={styles.brandName}>{app.brand_name}</span>
                                        <span className={styles.prizeNote}>{app.prize_description.substring(0, 50)}...</span>
                                    </div>
                                    <button className={styles.launchBtn} onClick={() => deployApp(app.id)}>🚀 DEPLOY LIVE</button>
                                </div>
                            ))}
                            {apps.length === 0 && <p className={styles.emptyNote}>No pending applications.</p>}
                        </div>
                    </section>
                )}

                {/* USER and DEBUG views remain same */}
                {activeView === 'debug' && (
                    <section className={styles.debugView}>
                        <div className={`${styles.controls} glass`}>
                            <button className={styles.launchBtn} onClick={() => {}}>🧪 LAUNCH TEST</button>
                        </div>
                        <div className={`${styles.matchTable} glass`}>
                            {matches.map(m => (
                                <div key={m.match_id} className={styles.matchRow}>
                                    <span>{m.home_team} vs {m.away_team}</span>
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
