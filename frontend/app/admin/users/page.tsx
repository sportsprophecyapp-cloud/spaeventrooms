'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './page.module.css';

interface Supporter {
    id: number;
    username: string;
    email: string;
    role: string;
    created_at: string;
}

const AdminUsersPage = () => {
    const { token, user } = useAuth();
    const [activeView, setActiveTab] = useState<'users' | 'debug' | 'apps'>('users');
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');

    const isAdmin = user?.role === 'admin';

    const fetchAllUsers = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setSupporters(await res.json());
        } catch (e) { console.error('Fetch users failed'); }
    };

    useEffect(() => {
        if (isAdmin && activeView === 'users') fetchAllUsers();
    }, [isAdmin, activeView]);

    const handleRoleUpdate = async (userId: number, newRole: string) => {
        if (!confirm(`Set user ${userId} to ${newRole}?`)) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                setMessage('User role updated!');
                fetchAllUsers(); // Refresh the list
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error('Role update failed', err);
        }
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
                    {/* Other tabs will be added here */}
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
                                    <div className={styles.actions}>
                                        <span className={styles.roleBadge}>{s.role || 'supporter'}</span>
                                        {s.role !== 'admin' && (
                                            <button className={styles.adminBtn} onClick={() => handleRoleUpdate(s.id, 'admin')}>MAKE ADMIN</button>
                                        )}
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
