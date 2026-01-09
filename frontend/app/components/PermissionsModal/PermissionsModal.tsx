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
        setStatus('');
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
        setStatus('Updating permissions...');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            await fetch(`${apiUrl}/api/admin/users/${user.id}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ permissions })
            });
            setStatus('Permissions updated successfully!');
            setTimeout(onClose, 1500);
        } catch (e) {
            setStatus('Failed to update permissions.');
        }
    };

    // ... (ban/mute handlers remain the same)

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
                            <input type="checkbox" checked={permissions.includes('super_admin')} onChange={() => handlePermissionChange('super_admin')} />
                            super_admin
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input type="checkbox" checked={permissions.includes('day_one')} onChange={() => handlePermissionChange('day_one')} />
                            day_one (Founder Badge)
                        </label>
                    </div>
                </div>

                {/* ... (moderation section) ... */}

                {status && <div className={styles.statusMessage}>{status}</div>}

                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={handleUpdatePermissions}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default PermissionsModal;
