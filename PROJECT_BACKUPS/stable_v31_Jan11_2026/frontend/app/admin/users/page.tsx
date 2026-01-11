'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './page.module.css';
import PermissionsModal from '../../components/PermissionsModal/PermissionsModal';
import MessageUserModal from '../../components/MessageUserModal/MessageUserModal';
import AnalyticsDashboard from '../../components/AnalyticsDashboard/AnalyticsDashboard';

interface Supporter {
    id: number;
    username: string;
    email: string;
    permissions: string[];
    created_at: string;
    prediction_count: string;
    is_banned: boolean;
    is_muted: boolean;
}

const AdminUsersPage = () => {
    const { token, user } = useAuth();
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<Supporter | null>(null);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

    const isSuperAdmin = user?.permissions.includes('super_admin');

    const fetchAllUsers = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setSupporters(await res.json());
        } catch (e) { console.error('Fetch users failed', e); }
    };

    const fetchOnlineUsers = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/admin/online-users`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setOnlineUsers(data.onlineUsers || []);
            }
        } catch (e) { console.error('Fetch online users failed', e); }
    };

    useEffect(() => {
        if (token && isSuperAdmin) {
            fetchAllUsers();
            fetchOnlineUsers();
            const interval = setInterval(fetchOnlineUsers, 10000);
            return () => clearInterval(interval);
        }
    }, [token, isSuperAdmin]);

    const handleOpenPermissionsModal = (supporter: Supporter) => {
        setSelectedUser(supporter);
        setIsPermissionsModalOpen(true);
    };

    const handleOpenMessageModal = (supporter: Supporter) => {
        setSelectedUser(supporter);
        setIsMessageModalOpen(true);
    };

    const handleCloseModals = () => {
        setSelectedUser(null);
        setIsPermissionsModalOpen(false);
        setIsMessageModalOpen(false);
        fetchAllUsers(); // Refresh list after any update
    };

    const filteredSupporters = supporters.filter(s => s.username.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!isSuperAdmin) return <div className={styles.error}>SUPER ADMIN ACCESS REQUIRED</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>COMMAND CENTER</h1>
                <p className={styles.subtitle}>User Permissions & Platform Management</p>
            </header>

            <main className={styles.main}>
                <AnalyticsDashboard />

                <div className={`${styles.searchBox} glass`}>
                    <input className={styles.input} placeholder="Filter Supporters..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className={`${styles.tableCard} glass`}>
                    {filteredSupporters.map(s => (
                        <div key={s.id} className={`${styles.row} ${s.is_banned ? styles.banned : ''}`}>
                            <div className={styles.userMeta}>
                                <span className={styles.username}>
                                    {onlineUsers.includes(s.id.toString()) && <span className={styles.onlineIndicator}></span>} 
                                    @{s.username}
                                </span>
                                <span className={styles.email}>{s.email}</span>
                                <span className={styles.metadata}>Joined: {new Date(s.created_at).toLocaleDateString()}</span>
                                <span className={styles.metadata}>Predictions: {s.prediction_count}</span>
                            </div>
                            <div className={styles.actions}>
                                {s.is_banned && <span className={styles.bannedBadge}>BANNED</span>}
                                {s.is_muted && <span className={styles.mutedBadge}>MUTED</span>} 
                                {s.permissions.map(p => <span key={p} className={styles.roleBadge}>{p}</span>)}
                                <button className={`${styles.manageBtn} ${styles.messageBtn}`} onClick={() => handleOpenMessageModal(s)}>MESSAGE</button>
                                <button className={styles.manageBtn} onClick={() => handleOpenPermissionsModal(s)}>MANAGE</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {selectedUser && (
                <PermissionsModal 
                    isOpen={isPermissionsModalOpen} 
                    onClose={handleCloseModals} 
                    user={selectedUser} 
                />
            )}

            {selectedUser && (
                <MessageUserModal 
                    isOpen={isMessageModalOpen} 
                    onClose={handleCloseModals} 
                    user={selectedUser} 
                />
            )}
        </div>
    );
};

export default AdminUsersPage;
