'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import styles from './wizard.module.css'; // CRITICAL: Unique name to bypass Git cache issues

const CreateRoomPage = () => {
    const { token, user } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        room_id: '',
        display_name: '',
        owner_email: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    const isAdmin = user?.email === 'sportsprophecyapp@gmail.com';

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        try {
            const res = await fetch(`${apiUrl}/api/admin/rooms`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                setSuccessData(data);
            }
        } catch (err) {
            console.error('Room creation failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAdmin) return <div className={styles.error}>UNAUTHORIZED</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>ARENA WIZARD</h1>
                <p className={styles.subtitle}>Create a dedicated space for a Creator or Partner.</p>
            </header>

            {!successData ? (
                <form onSubmit={handleCreate} className={`${styles.card} glass`}>
                    <div className={styles.inputGroup}>
                        <label>Room ID (no spaces, e.g., will-live)</label>
                        <input 
                            required
                            value={formData.room_id}
                            onChange={(e) => setFormData({...formData, room_id: e.target.value.toLowerCase()})}
                            placeholder="will-live"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Display Name (e.g., Will's YouTube Arena)</label>
                        <input 
                            required
                            value={formData.display_name}
                            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                            placeholder="Will's Live Arena"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Owner Email (The Creator's account)</label>
                        <input 
                            required
                            type="email"
                            value={formData.owner_email}
                            onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                            placeholder="creator@email.com"
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? 'GENERATING...' : 'CREATE ARENA'}
                    </button>
                </form>
            ) : (
                <div className={`${styles.card} ${styles.successCard} glass`}>
                    <h2 className={styles.successTitle}>✅ ARENA DEPLOYED!</h2>
                    <p className={styles.successText}>Share these details with the Creator:</p>
                    
                    <div className={styles.instructionBox}>
                        <h4>1. CREATOR REMOTE (Remote Control)</h4>
                        <code className={styles.code}>{`${window.location.origin}/rooms/${successData.room_id}/creator`}</code>
                        
                        <h4>2. OBS OVERLAY (Add to Stream)</h4>
                        <code className={styles.code}>{`${window.location.origin}/rooms/${successData.room_id}/overlay`}</code>
                        
                        <h4>3. PUBLIC ARENA (For Fans)</h4>
                        <code className={styles.code}>{`${window.location.origin}/rooms/${successData.room_id}`}</code>
                    </div>

                    <button onClick={() => setSuccessData(null)} className={styles.resetBtn}>CREATE ANOTHER</button>
                </div>
            )}
        </div>
    );
};

export default CreateRoomPage;
