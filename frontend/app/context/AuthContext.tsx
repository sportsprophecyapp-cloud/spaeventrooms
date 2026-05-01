'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // NEW

// IRONCLAD USER TYPE (v3.8): Synchronized with backend permissions
interface User {
    id: number;
    email: string;
    username: string;
    permissions: string[];
    tokens: number;
    tickets: number;
    points: number;
    level: number;
    canUploadCustom?: boolean;
    referral_count?: number;
    streak?: number;
    correct_picks?: number;
    equipped?: {
        avatar?: string;
        frame?: string;
    };
    layeredIdentity?: any;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User, rememberMe?: boolean) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    updateCosmetics: (avatar?: string, frame?: string) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter(); // NEW

    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        const verifySession = async () => {
            if (savedToken) {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
                    const res = await fetch(`${apiUrl}/api/auth/me`, {
                        headers: { 'Authorization': `Bearer ${savedToken}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        login(savedToken, data.user);
                    } else if (res.status === 401) {
                        logout();
                    }
                } catch (e) {
                    console.error('Session verification failed', e);
                }
            }
        };
        verifySession();
    }, []);

    const login = (newToken: string, newUser: User, rememberMe: boolean = true) => {
        // DERIVE ROLE FROM PERMISSIONS (Fix for Admin UI)
        if (newUser.permissions && (newUser.permissions.includes('admin') || newUser.permissions.includes('super_admin'))) {
            newUser.role = 'admin';
        }
        setToken(newToken);
        setUser(newUser);
        
        if (rememberMe) {
            localStorage.setItem('auth_token', newToken);
            sessionStorage.removeItem('auth_token'); // Clear from other storage
        } else {
            sessionStorage.setItem('auth_token', newToken);
            localStorage.removeItem('auth_token'); // Clear from other storage
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        router.push('/'); // NEW: Redirect to homepage
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const updatedUser = data.user;
                // DERIVE ROLE FROM PERMISSIONS (Fix for Admin UI)
                if (updatedUser.permissions && (updatedUser.permissions.includes('admin') || updatedUser.permissions.includes('super_admin'))) {
                    updatedUser.role = 'admin';
                }
                setUser(updatedUser);
            }
        } catch (e) {
            console.error('Failed to refresh user:', e);
        }
    };

    const updateCosmetics = async (avatar?: string, frame?: string) => {
        if (!token) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
            const res = await fetch(`${apiUrl}/api/users/cosmetics`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatar, frame })
            });
            if (res.ok) {
                // Determine if the backend returns the updated user or if we just optimistically update
                // The prompt says: "if (res.ok) { ... setUser({ ...user, equipped: { avatar, frame } }); }"
                // Using optimistic update for speed
                if (user) {
                    setUser({
                        ...user,
                        equipped: {
                            avatar: avatar ?? user.equipped?.avatar,
                            frame: frame ?? user.equipped?.frame
                        }
                    });
                }
            }
        } catch (e) {
            console.error('Failed to update cosmetics:', e);
        }
    };

    return (
        <AuthContext.Provider value={{
            user, token, login, logout, refreshUser,
            updateCosmetics,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
