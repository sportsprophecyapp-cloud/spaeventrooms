'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import styles from './page.module.css';

interface Prophet {
    id: number;
    username: string;
    email: string;
    role: string;
    current_level: number;
}

interface Room {
    room_id: string;
    display_name: string;
    owner_name: string | null;
}

const AdminUsersPage = () => {
    const { token, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [prophets, setProphets] = useState<Prophet[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const isAdmin = user?.email === 'sportsprophecyapp@gmail.com';

    useEffect(() => {
        if (isAdmin) fetchRooms();
    }, [isAdmin]);

    const fetchRooms = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/admin/rooms`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setRooms(await res.json());
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
        } catch (err) {
            console.error('Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    const updateRole = async (userId: number, newRole: string) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ role: newRole })
        });
        if (res.ok) {
            setMessage('Prophet role updated!');
            handleSearch();
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (!isAdmin) return <div className={styles.error}>UNAUTHORIZED: Super Admin access required.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>PROPHET MANAGEMENT</h1>
                <p className={styles.subtitle}>Control the hierarchy and assign room ownership.</p>
            </header>

            <main className={styles.main}>
                {/* Search Section */}
                <section className={`${styles.searchBox} glass`}>
                    <input 
                        className={styles.input}
                        placeholder="Search by Prophet Handle or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className={styles.searchBtn} onClick={handleSearch}>SEARCH</button>
                </section>

                {message && <div className={styles.toast}>{message}</div>}

                {/* Results Table */}
                <div className={`${styles.tableCard} glass`}>
                    <div className={styles.tableHeader}>
                        <span>Prophet</span>
                        <span>Current Role</span>
                        <span>Actions</span>
                    </div>
                    
                    <div className={styles.rows}>
                        {isLoading ? <p className={styles.loading}>Accessing records...</p> : 
                         prophets.length === 0 ? <p className={styles.empty}>Enter a name to begin.</p> :
                         prophets.map(p => (
                            <div key={p.id} className={styles.row}>
                                <div className={styles.userInfo}>
                                    <span className={styles.username}>@{p.username}</span>
                                    <span className={styles.email}>{p.email}</span>
                                </div>
                                <div className={styles.roleBadge}>{p.role.toUpperCase()}</div>
                                <div className={styles.actions}>
                                    <button onClick={() => updateRole(p.id, 'creator')} className={styles.creatorBtn}>MAKE CREATOR</button>
                                    <button onClick={() => updateRole(p.id, 'admin')} className={styles.adminBtn}>MAKE ADMIN</button>
                                    <button onClick={() => updateRole(p.id, 'prophet')} className={styles.resetBtn}>RESET</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Room Ownership Section */}
                <h2 className={styles.sectionTitle}>ROOM ASSIGNMENTS</h2>
                <div className={styles.roomGrid}>
                    {rooms.map(room => (
                        <div key={room.room_id} className={`${styles.roomCard} glass`}>
                            <h3>{room.display_name}</h3>
                            <p>Current Owner: <span>{room.owner_name || 'System'}</span></p>
                            <button className={styles.assignBtn}>REASSIGN OWNER</button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AdminUsersPage;
