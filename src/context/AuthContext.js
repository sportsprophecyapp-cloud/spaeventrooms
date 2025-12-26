import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Platform } from 'react-native';
import * as Localization from 'expo-localization';
import storage from '../utils/storage';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dailyReward, setDailyReward] = useState(null);

    useEffect(() => {
        loadUser();
        apiService.setUnauthorizedCallback(logout);
    }, []);

    // Flag to prevent duplicate alerts for the same session
    const [showingWarningIdx, setShowingWarningIdx] = useState(null);

    useEffect(() => {
        let interval;
        if (user && user.uuid && !user.isGuest && user.uuid !== 'guest') {
            checkNotifications();
            // Regularly refresh user profile to catch mute/warning flags
            // Reduced frequency to 30 seconds to support higher user concurrency (up to 1000 users/day)
            interval = setInterval(refreshUser, 30000);

            // Also poll notifications less frequently (60 seconds)
            const notifInterval = setInterval(checkNotifications, 60000);
            return () => {
                clearInterval(interval);
                clearInterval(notifInterval);
            };
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [user?.uuid]);

    // Fail-safe warning trigger: Watch the user object itself
    useEffect(() => {
        if (user?.needsWarningAcknowledge && showingWarningIdx !== user.uuid) {
            const warningMsg = user.pendingWarningMessage || "You have received an official warning. Please acknowledge to continue.";

            const handleAcknowledge = async () => {
                try {
                    await apiService.acknowledgeWarning();
                    setShowingWarningIdx(null); // Reset local flag
                    await refreshUser();
                } catch (e) {
                    console.error('Failed to acknowledge warning:', e);
                }
            };

            if (Platform.OS === 'web') {
                window.alert(`🛡️ Administrator Message\n\n${warningMsg}`);
                handleAcknowledge();
            } else {
                Alert.alert(
                    '🛡️ Administrator Message',
                    warningMsg,
                    [{
                        text: 'Acknowledged',
                        onPress: handleAcknowledge
                    }],
                    { cancelable: false }
                );
            }
            setShowingWarningIdx(user.uuid); // Mark as showing for this user
        }
    }, [user?.needsWarningAcknowledge, user?.pendingWarningMessage]);

    const checkNotifications = async () => {
        if (!user || user.isGuest || user.uuid === 'guest') return;
        try {
            const notifications = await apiService.getNotifications(user.uuid);
            if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
                return;
            }

            const lastSeenId = await storage.getItem(`lastSeenNotif_${user.uuid}`);

            // Filter for admin notifications (warnings)
            const adminNotifs = notifications.filter(n => n.type === 'admin');
            if (adminNotifs.length === 0) return;

            // Arrays from backend are sorted newest-first {timestamp: -1}
            const latestNotif = adminNotifs[0];

            // If we haven't seen this specific message ID yet, show it
            if (latestNotif._id !== lastSeenId) {
                const handleAcknowledge = async () => {
                    try {
                        await apiService.acknowledgeWarning();
                        await refreshUser();
                    } catch (e) {
                        console.error('Failed to acknowledge warning:', e);
                    }
                };

                if (Platform.OS === 'web') {
                    window.alert(`🛡️ Administrator Message\n\n${latestNotif.message}`);
                    handleAcknowledge();
                } else {
                    Alert.alert(
                        '🛡️ Administrator Message',
                        latestNotif.message,
                        [{
                            text: 'Acknowledged',
                            onPress: handleAcknowledge
                        }]
                    );
                }
                // Mark as seen immediately to prevent duplicate alerts in the next cycle
                await storage.setItem(`lastSeenNotif_${user.uuid}`, latestNotif._id);
            }
        } catch (error) {
            console.error('Error in notification poller:', error);
        }
    };



    const checkDailyReward = async (userId, isGuest = false) => {
        if (!userId || isGuest || userId === 'guest') return;
        try {
            const result = await apiService.claimDailyLoginReward(userId);

            if (result.claimed) {
                // Set daily reward state to trigger the modal
                setDailyReward(result);

                // Update user state with new balance
                if (result.balance) {
                    setUser(prev => {
                        if (!prev) return prev;
                        const newUser = {
                            ...prev,
                            tokens: result.balance.tokens,
                            crowns: result.balance.crowns
                        };
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

    const clearDailyReward = () => {
        setDailyReward(null);
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

                // Store session data (persists across app restarts via AsyncStorage)
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

    const register = async (email, password, username, referralCode, ageVerified, tosAccepted, privacyPolicyAccepted, remember = true) => {
        try {
            // Detect device language and region
            const deviceLanguage = Localization.locale || null; // e.g., "en-US"
            const deviceRegion = Localization.region || null; // e.g., "US"

            const data = await apiService.register(email, password, username, referralCode, deviceLanguage, deviceRegion, ageVerified, tosAccepted, privacyPolicyAccepted);
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
            // Detect device language and region
            const deviceLanguage = Localization.locale || null; // e.g., "en-US"
            const deviceRegion = Localization.region || null; // e.g., "US"

            const { token, user: userData } = await apiService.googleLogin(idToken, deviceLanguage, deviceRegion);
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



    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, loginAsGuest, googleLogin, appleLogin, refreshUser, updateUser, dailyReward, clearDailyReward }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
