'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// IRONCLAD USER TYPE (v3.8): Synchronized with backend permissions
interface User {
    id: number;
    email: string;
    username: string;
    permissions: string[]; // <-- The missing piece
    tokens: number;
    tickets: number;
    points: number;
    level: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token');
        const verifySession = async () => {
            if (savedToken) {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.sportsprophecyapp.com';
                    const res = await fetch(`${apiUrl}/api/auth/me`, {
                        headers: { 'Authorization': `Bearer ${savedToken}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        login(savedToken, data.user);
                    } else {
                        logout();
                    }
                } catch (e) {
                    logout();
                }
            }
        };
        verifySession();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('auth_token', newToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
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
