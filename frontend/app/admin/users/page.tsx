'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './page.module.css';
import PermissionsModal from '../../components/PermissionsModal'; // NEW MODAL

interface Supporter {
    id: number;
    username: string;
    email: string;
    permissions: string[];
}

const AdminUsersPage = () => {
    const { token, user } = useAuth();
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<Supporter | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isSuperAdmin = user?.permissions.includes('super_admin');

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
        if (isSuperAdmin) fetchAllUsers();
    }, [isSuperAdmin]);

    const handleOpenModal = (supporter: Supporter) => {
        setSelectedUser(supporter);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        fetchAllUsers(); // Refresh list after update
    };

    const filteredSupporters = supporters.filter(s => 
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isSuperAdmin) return <div className={styles.error}>SUPER ADMIN ACCESS REQUIRED</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>COMMAND CENTER</h1>
                <p className={styles.subtitle}>User Permissions & Platform Management</p>
            </header>

            <main className={styles.main}>
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
                                {s.permissions.map(p => <span key={p} className={styles.roleBadge}>{p}</span>)}
                                <button className={styles.manageBtn} onClick={() => handleOpenModal(s)}>MANAGE</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {selectedUser && (
                <PermissionsModal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal} 
                    user={selectedUser} 
                />
            )}
        </div>
    );
};

export default AdminUsersPage;
