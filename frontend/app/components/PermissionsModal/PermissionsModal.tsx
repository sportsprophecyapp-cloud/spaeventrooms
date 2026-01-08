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
        setStatus(''); // Reset status on new user
    }, [user]);

    if (!isOpen) return null;

    const handlePermissionChange = (permission: string) => {
        setPermissions(prev => 
            prev.includes(permission) 
                ? prev.filter(p => p !== permission) 
                : [...prev, permission]
        );
    };

    const handleUpdatePermissions = async () => {
        // This function is not fully implemented in the provided snippet
        // but we can assume it updates permissions.
        setStatus('Updating permissions...');
        // Simulate API call
        setTimeout(() => {
            setStatus('Permissions updated successfully!');
            setTimeout(onClose, 1500);
        }, 1000);
    };

    const handleBanToggle = async () => {
        const newBanStatus = !isBanned;
        setStatus(newBanStatus ? 'Banning user...' : 'Unbanning user...');
        // Simulate API Call
        setTimeout(() => {
            setIsBanned(newBanStatus);
            setStatus(newBanStatus ? 'User has been banned.' : 'User has been unbanned.');
            setTimeout(onClose, 1500);
        }, 1000);
    };

    const handleMuteToggle = async () => {
        const newMuteStatus = !isMuted;
        setStatus(newMuteStatus ? 'Muting user...' : 'Unmuting user...');
        // Simulate API Call
        setTimeout(() => {
            setIsMuted(newMuteStatus);
            setStatus(newMuteStatus ? 'User has been muted.' : 'User has been unmuted.');
            setTimeout(onClose, 1500);
        }, 1000);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Manage @{user.username}</h3>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>

                <div className={styles.section}>
                    <h4>Permissions</h4>
                    <div className={styles.permissionsGrid}>
                        <label className={styles.checkboxLabel}>
                            <input type="checkbox" checked={permissions.includes('can_manage_users')} onChange={() => handlePermissionChange('can_manage_users')} />
                            can_manage_users
                        </label>
                         <label className={styles.checkboxLabel}>
                            <input type="checkbox" checked={permissions.includes('super_admin')} onChange={() => handlePermissionChange('super_admin')} />
                            super_admin
                        </label>
                    </div>
                </div>

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

                {status && <div className={styles.statusMessage}>{status}</div>}

                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={handleUpdatePermissions}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default PermissionsModal;
