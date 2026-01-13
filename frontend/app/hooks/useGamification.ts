'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface Streak {
    current: number;
    nextBonus: number;
}

interface DailyLoginResponse {
    success: boolean;
    streak: Streak;
    tokenBalance: number;
    reward: {
        amount: number;
        message: string;
    };
}

interface Cosmetic {
    id: number;
    name: string;
    type: string;
    cost: number;
    imageUrl: string;
    description: string;
    requirement?: string;
    owned: boolean;
    is_achievement_reward?: boolean;
}

interface ShopResponse {
    success: boolean;
    cosmetics: Cosmetic[];
    balance: number;
}

export const useGamification = () => {
    const { user, token, refreshUser } = useAuth();
    const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Derived balances from AuthContext (Source of Truth)
    const tokenBalance = user?.tokens ?? 0;
    const ticketBalance = user?.tickets ?? 0;
    const streak = { current: user?.points ?? 0, nextBonus: 7 }; // TBD: Backend doesn't return full streak obj yet

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';

    // Fetch user's gamification data
    const fetchGamificationData = useCallback(async () => {
        if (!token || !user) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch shop data (includes balance)
            const shopRes = await fetch(`${apiUrl}/api/gamification/shop`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!shopRes.ok) throw new Error('Failed to fetch shop data');

            const shopData: ShopResponse = await shopRes.json();
            setCosmetics(shopData.cosmetics);
            // Balance is now handled by refreshUser() which is called after actions
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [token, user, apiUrl]);

    // Claim daily login reward
    const claimDailyLogin = async (): Promise<DailyLoginResponse | null> => {
        if (!token) return null;

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${apiUrl}/api/gamification/daily-login`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) throw new Error('Failed to claim daily login');

            const data: DailyLoginResponse = await res.json();
            await refreshUser(); // Sync global user state (Source of Truth)
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to claim reward');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Purchase cosmetic
    const purchaseCosmetic = async (cosmeticId: number): Promise<boolean> => {
        if (!token) return false;

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${apiUrl}/api/gamification/purchase`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cosmeticId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Purchase failed');
            }

            const data = await res.json();
            await refreshUser(); // Sync global user state
            await fetchGamificationData();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Purchase failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Equip cosmetic
    const equipCosmetic = async (cosmeticId: number, slotType: string): Promise<boolean> => {
        if (!token) return false;

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${apiUrl}/api/gamification/equip`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cosmeticId, slotType }),
            });

            if (!res.ok) throw new Error('Failed to equip cosmetic');

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to equip');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Share room
    const shareRoom = async (roomId: string): Promise<{ success: boolean; message?: string }> => {
        if (!token) return { success: false };

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${apiUrl}/api/gamification/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Share failed');
            }

            await refreshUser(); // Sync global user state
            return { success: true, message: data.message };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Share failed';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        if (user && token) {
            fetchGamificationData();
        }
    }, [user, token, fetchGamificationData]);

    return {
        tokenBalance,
        ticketBalance,
        streak,
        cosmetics,
        loading,
        error,
        claimDailyLogin,
        purchaseCosmetic,
        equipCosmetic,
        shareRoom,
        refetch: fetchGamificationData,
    };
};
