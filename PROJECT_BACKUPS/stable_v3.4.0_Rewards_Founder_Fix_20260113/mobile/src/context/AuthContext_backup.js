import React, { createContext, useState, useEffect, useContext, useReducer } from 'react';
import { Alert, Platform } from 'react-native';
import * as Localization from 'expo-localization';
import storage from '../utils/storage';
import { apiService } from '../services/api';
import { sessionMonitor } from '../utils/sessionMonitor'; // 🚀 Add this import

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'HYDRATE_FROM_STORAGE':
            return { ...state, user: action.payload, isLoading: false };
        case 'FETCH_FRESH_USER':
            return { ...state, user: action.payload };
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'LOGOUT':
            return { ...state, user: null };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [authState, dispatch] = useReducer(authReducer, {
        user: null,
        isLoading: true
    });

    const [dailyReward, setDailyReward] = useState(null);
    const [showingWarningIdx, setShowingWarningIdx] = useState(null);
    const [lastAlertedNotifId, setLastAlertedNotifId] = useState(null);

    // 🚀 OPTIMIZATION #3: Single useEffect for initialization with monitoring
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // 🟢 START: Hydration timing
                sessionMonitor.startHydration();

                // Step 1: Load stored user IMMEDIATELY
                const storedUser = await storage.getItem('userData');

                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);

                    // Dispatch immediately with stored user
                    dispatch({ type: 'HYDRATE_FROM_STORAGE', payload: parsedUser });

                    // 🟢 END: Hydration timing
                    sessionMonitor.endHydration(parsedUser.uuid);

                    // Step 2: Only fetch fresh data if NOT a guest
                    // This happens in the BACKGROUND while UI renders
                    if (!parsedUser.isGuest && parsedUser.uuid !== 'guest') {
                        try {
                            // 🔵 START: Background refresh timing
                            sessionMonitor.startBackgroundRefresh(parsedUser.uuid);

                            const freshUser = await apiService.getUserProfile(parsedUser.uuid);

                            dispatch({ type: 'FETCH_FRESH_USER', payload: freshUser });
                            await storage.setItem('userData', JSON.stringify(freshUser));
                            checkDailyReward(freshUser.uuid, false);

                            // 🔵 END: Background refresh timing (success)
                            sessionMonitor.endBackgroundRefresh(true);

                        } catch (err) {
                            // 🔵 END: Background refresh timing (failed)
                            sessionMonitor.endBackgroundRefresh(false, err);
                            console.warn('Fresh user fetch failed, using stored user', err);
                            // User stays loaded from storage, no re-render needed
                        }
                    } else {
                        // Guest users don't need background refresh
                        sessionMonitor.endBackgroundRefresh(true);
                    }
                } else {
                    // No stored user found
                    dispatch({ type: 'SET_LOADING', payload: false });
                    sessionMonitor.endHydration(null);
                }

                // Setup apiService unauthorized callback
                apiService.setUnauthorizedCallback(logout);

            } catch (e) {
                console.error('Auth initialization failed:', e);
                dispatch({ type: 'SET_LOADING', payload: false });
                sessionMonitor.endBackgroundRefresh(false, e);
            }
        };

        initializeAuth();
    }, []);

    // Separate polling logic from hydration
    useEffect(() => {
        let interval;
        let notifInterval;

        if (authState.user && authState.user.uuid && !authState.user.isGuest && authState.user.uuid !== 'guest') {
            checkNotifications();

            interval = setInterval(refreshUser, 30000);
            notifInterval = setInterval(checkNotifications, 60000);

            return () => {
                clearInterval(interval);
                clearInterval(notifInterval);
            };
        }

        return () => {
            if (interval) clearInterval(interval);
            if (notifInterval) clearInterval(notifInterval);
        };
    }, [authState.user?.uuid]);

    // Warning acknowledgement logic
    useEffect(() => {
        if (authState.user?.needsWarningAcknowledge && showingWarningIdx !== authState.user.uuid) {
            const warningMsg = authState.user.pendingWarningMessage || "You have received an official warning. Please acknowledge to continue.";

            const handleAcknowledge = async () => {
                try {
                    await apiService.acknowledgeWarning();
                    setShowingWarningIdx(null);
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
            setShowingWarningIdx(authState.user.uuid);
        }
    }, [authState.user?.needsWarningAcknowledge, authState.user?.pendingWarningMessage]);

    const checkNotifications = async () => {
        if (!authState.user || authState.user.isGuest || authState.user.uuid === 'guest') return;

        try {
            // 🟡 Track API call
            const apiCallId = sessionMonitor.startAPICall('/notifications');

            const notifications = await apiService.getNotifications(authState.user.uuid);
            sessionMonitor.endAPICall(apiCallId, true);

            if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
                return;
            }

            const lastSeenId = await storage.getItem(`lastSeenNotif_${authState.user.uuid}`);
            const adminNotifs = notifications.filter(n => n.type === 'admin');

            if (adminNotifs.length === 0) return;

            const latestNotif = adminNotifs[0];

            if (latestNotif._id !== lastSeenId && latestNotif._id !== lastAlertedNotifId) {
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

                setLastAlertedNotifId(latestNotif._id);
                await storage.setItem(`lastSeenNotif_${authState.user.uuid}`, latestNotif._id);
            }
        } catch (error) {
            console.error('Error in notification poller:', error);
            sessionMonitor.endAPICall(apiCallId, false, error);
        }
    };

    const checkDailyReward = async (userId, isGuest = false) => {
        if (!userId || isGuest || userId === 'guest') return;

        try {
            // 🟡 Track API call
            const apiCallId = sessionMonitor.startAPICall('/daily-login-reward');

            const result = await apiService.claimDailyLoginReward(userId);
            sessionMonitor.endAPICall(apiCallId, true);

            if (result.claimed) {
                setDailyReward(result);

                if (result.balance) {
                    dispatch({
                        type: 'SET_USER',
                        payload: {
                            ...authState.user,
                            tokens: result.balance.tokens,
                            crowns: result.balance.crowns
                        }
                    });
                    await storage.setItem('userData', JSON.stringify({
                        ...authState.user,
                        tokens: result.balance.tokens,
                        crowns: result.balance.crowns
                    }));
                }
            }
        } catch (error) {
            console.error('Error checking daily reward:', error);
            sessionMonitor.endAPICall(apiCallId, false, error);
        }
    };

    const clearDailyReward = () => {
        setDailyReward(null);
    };

    const login = async (email, password, remember = true) => {
        try {
            const apiCallId = sessionMonitor.startAPICall('/login');

            const data = await apiService.login(email, password);
            sessionMonitor.endAPICall(apiCallId, true);

            if (data.user) {
                dispatch({ type: 'SET_USER', payload: data.user });
                await storage.setItem('userData', JSON.stringify(data.user));

                if (data.token) {
                    await storage.setItem('userToken', data.token);
                }

                checkDailyReward(data.user.uuid);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed', error);
            sessionMonitor.endAPICall(apiCallId, false, error);
            throw error;
        }
    };

    const register = async (email, password, username, referralCode, ageVerified, tosAccepted, privacyPolicyAccepted, remember = true) => {
        try {
            const apiCallId = sessionMonitor.startAPICall('/register');

            const deviceLanguage = Localization.locale || null;
            const deviceRegion = Localization.region || null;

            const data = await apiService.register(
                email,
                password,
                username,
                referralCode,
                deviceLanguage,
                deviceRegion,
                ageVerified,
                tosAccepted,
                privacyPolicyAccepted
            );

            sessionMonitor.endAPICall(apiCallId, true);

            if (data.user) {
                dispatch({ type: 'SET_USER', payload: data.user });
                await storage.setItem('userData', JSON.stringify(data.user));

                if (data.token) {
                    await storage.setItem('userToken', data.token);
                }

                if (data.referralBonus && data.referralBonus.applied) {
                    Alert.alert(
                        '🎉 Referral Bonus!',
                        `You and ${data.referralBonus.referredBy} each earned ${data.referralBonus.crownsEarned} crowns!`,
                        [{ text: 'Awesome!' }]
                    );
                }

                checkDailyReward(data.user.uuid);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Registration failed', error);
            sessionMonitor.endAPICall(apiCallId, false, error);
            throw error;
        }
    };

    const googleLogin = async (idToken) => {
        try {
            const apiCallId = sessionMonitor.startAPICall('/auth/google');

            const deviceLanguage = Localization.locale || null;
            const deviceRegion = Localization.region || null;

            const { token, user: userData } = await apiService.googleLogin(idToken, deviceLanguage, deviceRegion);
            sessionMonitor.endAPICall(apiCallId, true);

            dispatch({ type: 'SET_USER', payload: userData });
            await storage.setItem('userToken', token);
            await storage.setItem('userData', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Google login context error:', error);
            sessionMonitor.endAPICall(apiCallId, false, error);
            throw error;
        }
    };

    const appleLogin = async (identityToken, user) => {
        try {
            const apiCallId = sessionMonitor.startAPICall('/auth/apple');

            const { token, user: userData } = await apiService.appleLogin(identityToken, user);
            sessionMonitor.endAPICall(apiCallId, true);

            dispatch({ type: 'SET_USER', payload: userData });
            await storage.setItem('userToken', token);
            await storage.setItem('userData', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Apple login context error:', error);
            sessionMonitor.endAPICall(apiCallId, false, error);
            throw error;
        }
    };

    const logout = async () => {
        // Immediate UI update
        dispatch({ type: 'LOGOUT' });

        // Async cleanup (non-blocking)
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem('userData');
                window.localStorage.removeItem('userToken');
                window.localStorage.removeItem('React_Native_Async_Storage_userData');
                window.localStorage.removeItem('React_Native_Async_Storage_userToken');
            }

            await storage.removeItem('userData');
            await storage.removeItem('userToken');
        } catch (e) {
            console.error('Logout cleanup failed', e);
        }
    };

    const refreshUser = async () => {
        try {
            const apiCallId = sessionMonitor.startAPICall('/user/:uuid');

            const storedUser = await storage.getItem('userData');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                const freshUser = await apiService.getUserProfile(parsedUser.uuid);
                sessionMonitor.endAPICall(apiCallId, true);

                dispatch({ type: 'FETCH_FRESH_USER', payload: freshUser });
                await storage.setItem('userData', JSON.stringify(freshUser));
            }
        } catch (e) {
            console.error('Failed to refresh user', e);
            sessionMonitor.endAPICall(apiCallId, false, e);
        }
    };

    const updateUser = async (updates) => {
        try {
            dispatch({
                type: 'SET_USER',
                payload: { ...authState.user, ...updates }
            });
            await storage.setItem('userData', JSON.stringify({ ...authState.user, ...updates }));
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
            dispatch({ type: 'SET_USER', payload: guestUser });
            await storage.setItem('userData', JSON.stringify(guestUser));
            return true;
        } catch (error) {
            console.error('Guest login failed', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user: authState.user,
            isLoading: authState.isLoading,
            login,
            register,
            logout,
            loginAsGuest,
            googleLogin,
            appleLogin,
            refreshUser,
            updateUser,
            dailyReward,
            clearDailyReward
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
