'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import styles from './PermissionsModal.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: { id: number; username: string; permissions: string[]; is_banned: boolean; is_muted: boolean; };
}

const PermissionsModal = ({ isOpen, onClose, user }: Props) => {
    const { token } = useAuth();
    const [permissions, setPermissions] = useState(user.permissions || []);
    const [isBanned, setIsBanned] = useState(user.is_banned || false);
    const [isMuted, setIsMuted] = useState(user.is_muted || false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        setPermissions(user.permissions || []);
        setIsBanned(user.is_banned || false);
        setIsMuted(user.is_muted || false);
    }, [user]);

    const handlePermissionChange = (permission: string) => {
        setPermissions(prev => 
            prev.includes(permission) 
                ? prev.filter(p => p !== permission) 
                : [...prev, permission]
        );
    };

    const handleUpdatePermissions = async () => {
        // ... (existing code)
    };

    const handleBanToggle = async () => {
        // ... (existing code)
    };

    const handleMuteToggle = async () => {
        const newMuteStatus = !isMuted;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/admin/users/${user.id}/mute`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_muted: newMuteStatus })
            });

            if (res.ok) {
                setIsMuted(newMuteStatus);
                setStatus(newMuteStatus ? 'User has been muted.' : 'User has been unmuted.');
                setTimeout(onClose, 2000);
            } else {
                setStatus('Failed to update mute status.');
            }
        } catch (e) {
            setStatus('An error occurred.');
        }
    };

    if (!isOpen) return null;

    // ... (rest of the component)

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} glass`}>
                <h3>Manage @{user.username}</h3>
                
                {/* ... Permissions Section ... */}

                <div className={styles.section}>
                    <h4>Moderation</h4>
                    <div className={styles.moderationActions}>
                        <button 
                            className={`${styles.modBtn} ${styles.banBtn} ${isBanned ? styles.unban : ''}`}
                            onClick={handleBanToggle}
                        >
                            {isBanned ? 'UNBAN USER' : 'BAN USER'}
                        </button>
                        <button 
                            className={`${styles.modBtn} ${styles.muteBtn} ${isMuted ? styles.unmute : ''}`}
                            onClick={handleMuteToggle}
                        >
                            {isMuted ? 'UNMUTE USER' : 'MUTE USER'}
                        </button>
                    </div>
                </div>

                {/* ... Actions and Status ... */}
            </div>
        </div>
    );
};

export default PermissionsModal;
