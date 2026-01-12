'use client';

import React, { useState } from 'react';
import styles from './PermissionsModal.module.css';
import { useAuth } from '../context/AuthContext';

interface PermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

const ALL_PERMISSIONS = [
    { id: 'can_manage_users', label: 'Manage Users' },
    { id: 'can_manage_sponsors', label: 'Manage Sponsors' },
    { id: 'can_moderate_chat', label: 'Moderate Chat' },
    { id: 'can_manage_matches', label: 'Manage Matches' },
];

const PermissionsModal = ({ isOpen, onClose, user }: PermissionsModalProps) => {
    const { token } = useAuth();
    const [permissions, setPermissions] = useState<string[]>(user.permissions || []);
    const [message, setMessage] = useState('');

    const handleToggle = (permission: string) => {
        if (permissions.includes(permission)) {
            setPermissions(prev => prev.filter(p => p !== permission));
        } else {
            setPermissions(prev => [...prev, permission]);
        }
    };

    const handleSave = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/admin/users/${user.id}/permissions`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ permissions })
            });

            if (res.ok) {
                setMessage('Permissions updated successfully!');
                setTimeout(() => {
                    onClose();
                    setMessage('');
                }, 1500);
            } else {
                throw new Error('Update failed');
            }
        } catch (err) {
            setMessage('An error occurred.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} glass`}>
                <h3 className={styles.title}>Manage Permissions for @{user.username}</h3>
                
                <div className={styles.grid}>
                    {ALL_PERMISSIONS.map(perm => (
                        <div key={perm.id} className={styles.checkItem}>
                            <input 
                                type="checkbox" 
                                id={perm.id} 
                                checked={permissions.includes(perm.id)}
                                onChange={() => handleToggle(perm.id)}
                            />
                            <label htmlFor={perm.id}>{perm.label}</label>
                        </div>
                    ))}
                </div>

                {message && <p className={styles.message}>{message}</p>}

                <div className={styles.actions}>
                    <button onClick={onClose} className={styles.cancelBtn}>CANCEL</button>
                    <button onClick={handleSave} className={styles.saveBtn}>SAVE PERMISSIONS</button>
                </div>
            </div>
        </div>
    );
};

export default PermissionsModal;
