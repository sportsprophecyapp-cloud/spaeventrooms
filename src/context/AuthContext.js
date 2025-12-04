import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const checkDailyReward = async (userId) => {
        if (!userId) return;
        try {
            console.log('Checking daily reward for user:', userId);
            const result = await apiService.claimDailyLoginReward(userId);
            console.log('Daily reward result:', result);

            if (result.claimed) {
                Alert.alert('Daily Reward', result.message);
                // Update user state with new balance
                setUser(prev => {
                    if (!prev) return prev;
                    const newUser = {
                        ...prev,
                        tokens: result.balance.tokens,
                        crowns: result.balance.crowns
                    };
                    console.log('Updating user state with new balance:', newUser.tokens);
                    AsyncStorage.setItem('userData', JSON.stringify(newUser));
                    return newUser;
                });
            }
        } catch (error) {
            console.error('Error checking daily reward:', error);
            // Don't block app loading if daily reward check fails
        }
    };

    const loadUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('userData');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // Fetch fresh data from backend immediately
                try {
                    const freshUser = await apiService.getUserProfile(parsedUser.uuid);
                    setUser(freshUser);
                    await AsyncStorage.setItem('userData', JSON.stringify(freshUser));
                    checkDailyReward(freshUser.uuid);
                } catch (err) {
                    console.warn('Failed to fetch fresh user data, using stored data', err);
                    setUser(parsedUser);
                    checkDailyReward(parsedUser.uuid);
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

                if (remember) {
                    await AsyncStorage.setItem('userData', JSON.stringify(data.user));
                    // If the backend returned a token, store it too
                    if (data.token) {
                        await AsyncStorage.setItem('userToken', data.token);
                    }
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

                if (remember) {
                    await AsyncStorage.setItem('userData', JSON.stringify(data.user));
                    if (data.token) {
                        await AsyncStorage.setItem('userToken', data.token);
                    }
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

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('userToken');
            setUser(null);
        } catch (e) {
            console.error('Logout failed', e);
        }
    };

    const refreshUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('userData');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // Fetch fresh data
                const freshUser = await apiService.getUserProfile(parsedUser.uuid);
                setUser(freshUser);
                await AsyncStorage.setItem('userData', JSON.stringify(freshUser));
            }
        } catch (e) {
            console.error('Failed to refresh user', e);
        }
    };

    const updateUser = async (updates) => {
        try {
            const newUser = { ...user, ...updates };
            setUser(newUser);
            await AsyncStorage.setItem('userData', JSON.stringify(newUser));
        } catch (e) {
            console.error('Failed to update user locally', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
