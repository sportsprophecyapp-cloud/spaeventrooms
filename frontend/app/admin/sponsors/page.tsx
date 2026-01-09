'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import SponsorDashboard from '../../components/SponsorDashboard/SponsorDashboard';
import { useAuth } from '@/app/context/AuthContext';

const AdminSponsorsPage = () => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState<'stats' | 'apps' | 'draws' | 'placements'>('stats');
    const [applications, setApplications] = useState<any[]>([]);
    const [draws, setDraws] = useState<any[]>([]);
    const [placements, setPlacements] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const canViewSponsors = user?.permissions.includes('can_view_sponsors') || user?.permissions.includes('super_admin');

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            if (activeTab === 'apps') {
                const res = await fetch(`${apiUrl}/api/sponsor-applications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setApplications(data.applications || []);
            } else if (activeTab === 'draws') {
                const res = await fetch(`${apiUrl}/api/gamification/draws/active`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setDraws(data.draws || []);
            } else if (activeTab === 'placements') {
                const res = await fetch(`${apiUrl}/api/sponsor-applications/placements`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setPlacements(data.sponsors || []);
            }
        } catch (e) {
            console.error('Fetch failed', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canViewSponsors) fetchData();
    }, [activeTab, token]);

    const handleApprove = async (id: number) => {
        if (!confirm('Approve this sponsor and make it live?')) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/sponsor-applications/${id}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            alert('Sponsor is now LIVE!');
            fetchData();
        }
    };

    const handleDeleteDraw = async (id: number) => {
        if (!confirm('Permanently remove this prize draw?')) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/gamification/draws/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            alert('Draw removed.');
            fetchData();
        }
    };

    const handlePickWinner = async (id: number) => {
        if (!confirm('Ready to pick a random winner for this draw?')) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/gamification/draws/${id}/pick-winner`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            alert(`Winner selected: ${data.winner.username} (${data.winner.email})`);
            fetchData();
        } else {
            alert(data.error || 'Failed to pick winner.');
        }
    };

    const handleUpdateSponsor = async (id: number) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/sponsor-applications/placements/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editData)
        });
        if (res.ok) {
            alert('Sponsor updated!');
            setEditingId(null);
            fetchData();
        }
    };

    if (!canViewSponsors) {
        return <div className={styles.error}>ACCESS DENIED: Requires 'can_view_sponsors' permission.</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>SPONSOR & DRAW HUB</h1>
                <div className={styles.tabs}>
                    <button className={activeTab === 'stats' ? styles.activeTab : ''} onClick={() => setActiveTab('stats')}>Overview</button>
                    <button className={activeTab === 'apps' ? styles.activeTab : ''} onClick={() => setActiveTab('apps')}>Incoming Applications</button>
                    <button className={activeTab === 'placements' ? styles.activeTab : ''} onClick={() => setActiveTab('placements')}>Live Placements</button>
                    <button className={activeTab === 'draws' ? styles.activeTab : ''} onClick={() => setActiveTab('draws')}>Active Draws</button>
                </div>
            </header>

            <main className={styles.main}>
                {activeTab === 'stats' && <SponsorDashboard />}

                {activeTab === 'apps' && (
                    <div className={styles.appList}>
                        {loading && <p>Loading applications...</p>}
                        {applications.length === 0 && !loading && <p>No pending applications.</p>}
                        {applications.map(app => (
                            <div key={app.id} className={`${styles.card} glass`}>
                                <div className={styles.cardHeader}>
                                    <h3>{app.brand_name}</h3>
                                    <span className={styles.targetBadge}>{app.arena_target.toUpperCase()}</span>
                                </div>
                                <p><strong>Contact:</strong> {app.contact_email}</p>
                                <p><strong>Prize:</strong> {app.prize_description}</p>
                                <div className={styles.cardActions}>
                                    <button onClick={() => handleApprove(app.id)} className={styles.approveBtn}>APPROVE & GO LIVE</button>
                                    <button className={styles.contactBtn} onClick={() => window.location.href = `mailto:${app.contact_email}`}>CONTACT SPONSOR</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'draws' && (
                    <div className={styles.appList}>
                        {loading && <p>Loading draws...</p>}
                        {draws.length === 0 && !loading && <p>No active draws.</p>}
                        {draws.map(draw => (
                            <div key={draw.id} className={`${styles.card} glass`}>
                                <div className={styles.cardHeader}>
                                    <h3>{draw.title}</h3>
                                    <span className={styles.statusBadge}>{draw.status.toUpperCase()}</span>
                                </div>
                                <p><strong>Prize:</strong> {draw.prize}</p>
                                {draw.winner_id && <p className={styles.winnerAnnounce}>Winner ID: {draw.winner_id}</p>}
                                <div className={styles.cardActions}>
                                    {!draw.winner_id && (
                                        <button onClick={() => handlePickWinner(draw.id)} className={styles.pickWinnerBtn}>PICK WINNER</button>
                                    )}
                                    <button onClick={() => handleDeleteDraw(draw.id)} className={styles.deleteBtn}>REMOVE DRAW</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'placements' && (
                    <div className={styles.appList}>
                        {loading && <p>Loading placements...</p>}
                        {placements.length === 0 && !loading && <p>No active placements.</p>}
                        {placements.map(sp => (
                            <div key={sp.id} className={`${styles.card} glass`}>
                                {editingId === sp.id ? (
                                    <div className={styles.editForm}>
                                        <input value={editData.sponsor_name || sp.sponsor_name} onChange={e => setEditData({ ...editData, sponsor_name: e.target.value })} />
                                        <input value={editData.website_url || sp.website_url} onChange={e => setEditData({ ...editData, website_url: e.target.value })} />
                                        <div className={styles.cardActions}>
                                            <button onClick={() => handleUpdateSponsor(sp.id)} className={styles.approveBtn}>SAVE</button>
                                            <button onClick={() => setEditingId(null)} className={styles.deleteBtn}>CANCEL</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.cardHeader}>
                                            <h3>{sp.sponsor_name}</h3>
                                            <span className={styles.targetBadge}>{sp.room_id.toUpperCase()}</span>
                                        </div>
                                        <p><strong>Website:</strong> {sp.website_url || 'N/A'}</p>
                                        <div className={styles.cardActions}>
                                            <button onClick={() => { setEditingId(sp.id); setEditData(sp); }} className={styles.pickWinnerBtn}>EDIT</button>
                                            <button className={styles.contactBtn} onClick={() => window.location.href = sp.website_url}>VISIT SITE</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminSponsorsPage;
