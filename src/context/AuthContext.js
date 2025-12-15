import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import storage from '../utils/storage';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAgeVerified, setIsAgeVerified] = useState(false);

    useEffect(() => {
        loadUser();
        loadAgeVerification();
        apiService.setUnauthorizedCallback(logout);
    }, []);

    const loadAgeVerification = async () => {
        try {
            const verified = await storage.getItem('age_verified');
            if (verified === 'true') {
                setIsAgeVerified(true);
            }
        } catch (e) {
            console.error('Failed to load age verification', e);
        }
    };

    const checkDailyReward = async (userId, isGuest = false) => {
        if (!userId || isGuest || userId === 'guest') return;
        try {
            console.log('Checking daily reward for user:', userId);
            const result = await apiService.claimDailyLoginReward(userId);
            console.log('Daily reward result:', result);

            if (result.claimed) {
                Alert.alert('Daily Reward', result.message);
                // Update user state with new balance
                if (result.balance) {
                    setUser(prev => {
                        if (!prev) return prev;
                        const newUser = {
                            ...prev,
                            tokens: result.balance.tokens,
                            crowns: result.balance.crowns
                        };
                        console.log('Updating user state with new balance:', newUser.tokens);
                        storage.setItem('userData', JSON.stringify(newUser));
                        return newUser;
                    });
                }
            }
        } catch (error) {
            console.error('Error checking daily reward:', error);
            // Don't block app loading if daily reward check fails
        }
    };

    const loadUser = async () => {
        try {
            const storedUser = await storage.getItem('userData');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);

                // If it's a guest user, just load local state and skip backend fetch
                if (parsedUser.isGuest || parsedUser.uuid === 'guest') {
                    setUser(parsedUser);
                    setIsLoading(false);
                    return;
                }

                // Fetch fresh data from backend immediately
                try {
                    const freshUser = await apiService.getUserProfile(parsedUser.uuid);
                    setUser(freshUser);
                    await storage.setItem('userData', JSON.stringify(freshUser));
                    checkDailyReward(freshUser.uuid, false);
                } catch (err) {
                    console.warn('Failed to fetch fresh user data, using stored data', err);
                    setUser(parsedUser);
                    checkDailyReward(parsedUser.uuid, false);
                }
            }
        } catch (e) {
            console.error('Failed to load user', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password, remember = true) => {
        try {
            const data = await apiService.login(email, password);
            if (data.user) {
                setUser(data.user);

                // Always store data for the session.
                // TODO: Implement SessionStorage for 'remember=false' if needed.
                await storage.setItem('userData', JSON.stringify(data.user));
                if (data.token) {
                    await storage.setItem('userToken', data.token);
                }

                // Check for daily reward
                checkDailyReward(data.user.uuid);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const register = async (email, password, username, referralCode, remember = true) => {
        try {
            const data = await apiService.register(email, password, username, referralCode);
            if (data.user) {
                setUser(data.user);

                // Always store data for the session
                await storage.setItem('userData', JSON.stringify(data.user));
                if (data.token) {
                    await storage.setItem('userToken', data.token);
                }

                // Show referral bonus message if applicable
                if (data.referralBonus && data.referralBonus.applied) {
                    Alert.alert(
                        '🎉 Referral Bonus!',
                        `You and ${data.referralBonus.referredBy} each earned ${data.referralBonus.crownsEarned} crowns!`,
                        [{ text: 'Awesome!' }]
                    );
                }

                // Check for daily reward (new users might get it too if configured)
                checkDailyReward(data.user.uuid);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        }
    };

    const googleLogin = async (idToken) => {
        try {
            const { token, user: userData } = await apiService.googleLogin(idToken);
            setUser(userData);
            await storage.setItem('userToken', token);
            await storage.setItem('userData', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Google login context error:', error);
            throw error;
        }
    };

    const appleLogin = async (identityToken, user) => {
        try {
            const { token, user: userData } = await apiService.appleLogin(identityToken, user);
            setUser(userData);
            await storage.setItem('userToken', token);
            await storage.setItem('userData', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Apple login context error:', error);
            throw error;
        }
    };

    const logout = async () => {
        // 1. Immediate UI update to ensure responsiveness
        setUser(null);

        // 2. Cleanup storage
        try {
            // Direct cleanup for web if available (synchronous and safe)
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem('userData');
                window.localStorage.removeItem('userToken');
                window.localStorage.removeItem('React_Native_Async_Storage_userData');
                window.localStorage.removeItem('React_Native_Async_Storage_userToken');
            }

            // Standard cleanup via wrapper (for native or if wrapper handles other logic)
            // We await this but it won't block the UI since we already updated state
            await storage.removeItem('userData');
            await storage.removeItem('userToken');
        } catch (e) {
            console.error('Logout cleanup failed', e);
        }
    };

    const refreshUser = async () => {
        try {
            const storedUser = await storage.getItem('userData');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // Fetch fresh data
                const freshUser = await apiService.getUserProfile(parsedUser.uuid);
                setUser(freshUser);
                await storage.setItem('userData', JSON.stringify(freshUser));
            }
        } catch (e) {
            console.error('Failed to refresh user', e);
        }
    };

    const updateUser = async (updates) => {
        try {
            const newUser = { ...user, ...updates };
            setUser(newUser);
            await storage.setItem('userData', JSON.stringify(newUser));
        } catch (e) {
            console.error('Failed to update user locally', e);
        }
    };

    const loginAsGuest = async () => {
        try {
            const guestUser = {
                uuid: 'guest',
                username: 'Guest',
                isGuest: true,
                tokens: 50,
                crowns: 0,
                predictedGames: []
            };
            setUser(guestUser);
            // We do NOT persist guest user to storage to keep it ephemeral
            // unless requested otherwise.
            return true;
        } catch (error) {
            console.error('Guest login failed', error);
            return false;
        }
    };

    const verifyAge = async () => {
        try {
            await storage.setItem('age_verified', 'true');
            setIsAgeVerified(true);
        } catch (e) {
            console.error('Failed to save age verification', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isAgeVerified, verifyAge, login, register, logout, loginAsGuest, googleLogin, appleLogin, refreshUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
