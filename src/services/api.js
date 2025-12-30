import axios from 'axios';
import storage from '../utils/storage';

// Use environment variable or fallback to local API for development
// Use environment variable or fallback to local API for development
const API_URL = process.env.NODE_ENV === 'production' || process.env.EXPO_PUBLIC_API_URL ? (process.env.EXPO_PUBLIC_API_URL || '/api') : 'http://localhost:3001/api';
// const API_URL = '/api'; // Use relative path for Vercel proxy

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    async (config) => {
        const token = await storage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let onUnauthorized = null;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (onUnauthorized) {
                onUnauthorized();
            }
        }
        return Promise.reject(error);
    }
);

export const apiService = {
    setUnauthorizedCallback: (callback) => {
        onUnauthorized = callback;
    },

    login: async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    register: async (email, password, username, referralCode, deviceLanguage = null, deviceRegion = null, ageVerified = false, tosAccepted = false, privacyPolicyAccepted = false) => {
        try {
            const response = await api.post('/register', {
                email,
                password,
                username,
                referralCode,
                deviceLanguage,
                deviceRegion,
                ageVerified,
                tosAccepted,
                privacyPolicyAccepted
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    loginAsGuest: async () => {
        const response = await api.post('/auth/guest');
        return response.data;
    },
    googleLogin: async (idToken) => {
        const response = await api.post('/auth/google', { idToken });
        return response.data;
    },
    appleLogin: async (identityToken, user) => {
        const response = await api.post('/auth/apple', { identityToken, user });
        return response.data;
    },
    getProfile: async () => {
        try {
            const response = await api.get('/profile');
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    googleLogin: async (payload, deviceLanguage = null, deviceRegion = null) => {
        // Support both old (idToken string) and new ({ idToken, accessToken }) formats
        let data = (typeof payload === 'string') ? { idToken: payload } : payload;
        // Add device language and region if provided
        if (deviceLanguage) data.deviceLanguage = deviceLanguage;
        if (deviceRegion) data.deviceRegion = deviceRegion;
        const response = await api.post('/auth/google', data);
        return response.data;
    },

    getEvents: async () => {
        try {
            const response = await api.get('/events');
            return response.data;
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    },

    /* 
    getChat: async (roomId = null, userId = null) => {
        try {
            const params = { roomId };
            if (userId) params.userId = userId;
            const response = await api.get('/chat', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching chat:', error);
            return [];
        }
    },

    sendChat: async (messageData) => {
        try {
            const response = await api.post('/chat', messageData);
            return response.data;
        } catch (error) {
            console.error('Error sending chat:', error);
            throw error;
        }
    },

    getRooms: async () => {
        try {
            const response = await api.get('/chat/rooms');
            return response.data;
        } catch (error) {
            console.error('Error fetching rooms:', error);
            return [];
        }
    },

    createRoom: async (roomData) => {
        try {
            const response = await api.post('/chat/rooms', roomData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    joinRoom: async (roomId, password) => {
        try {
            const response = await api.post('/chat/rooms/join', { roomId, password });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },
    */


    submitPrediction: async (predictionData) => {
        try {
            const response = await api.post('/predictions', predictionData);
            return response.data;
        } catch (error) {
            console.error('Error submitting prediction:', error);
            throw error;
        }
    },

    getUserPredictions: async (userId) => {
        try {
            const response = await api.get(`/predictions/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user predictions:', error);
            return [];
        }
    },

    enterWeeklyDraw: async (userId) => {
        try {
            const response = await api.post('/weekly-draw/enter', { userId });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    getWeeklyDrawStats: async () => {
        try {
            const response = await api.get('/weekly-draw/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching weekly draw stats:', error);
            return { totalEntries: 0 };
        }
    },

    getUserWeeklyDrawEntries: async (userId) => {
        try {
            const response = await api.get(`/weekly-draw/user-entries/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user draw entries:', error);
            return { count: 0 };
        }
    },


    getUserBalance: async (userId) => {
        try {
            const response = await api.get(`/balance/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user balance:', error);
            return { tokens: 0, crowns: 0 };
        }
    },

    claimDailyLoginReward: async (userId) => {
        try {
            const response = await api.post('/daily-login-reward', { userId });
            return response.data;
        } catch (error) {
            console.error('Error claiming daily login reward:', error);
            return { canClaim: false, claimed: false };
        }
    },

    getLeaderboard: async (timeframe = 'all') => {
        try {
            const response = await api.get('/leaderboard', { params: { timeframe } });
            return response.data;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return { leaderboard: [] };
        }
    },

    changeIdName: async (userId, newIdName) => {
        try {
            const response = await api.post('/user/change-idname', { userId, newIdName });
            return response.data;
        } catch (error) {
            console.error('Error changing ID name:', error);
            throw error.response?.data || error;
        }
    },

    updateProfile: async (data) => {
        try {
            const response = await api.patch('/user/profile', data);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error.response?.data || error;
        }
    },

    getUserProfile: async (userId) => {
        try {
            const response = await api.get(`/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error.response?.data || error;
        }
    },

    getPublicStats: async () => {
        try {
            const response = await api.get('/public/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching public stats:', error);
            throw error;
        }
    },

    getFeaturedWinner: async () => {
        try {
            const response = await api.get('/winners/featured');
            return response.data;
        } catch (error) {
            console.error('Error fetching featured winner:', error);
            // Return null instead of throwing to prevent landing page crash
            return null;
        }
    },

    pickWinner: async (data) => {
        try {
            const response = await api.post('/weekly-draw/pick-winner', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteAccount: async () => {
        try {
            const response = await api.delete('/user/delete');
            return response.data;
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error.response?.data || error;
        }
    },

    // --- League Methods ---
    createLeague: async (userId, name, entryFee) => {
        try {
            const response = await api.post('/leagues/create', { userId, name, entryFee });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    joinLeague: async (userId, code) => {
        try {
            const response = await api.post('/leagues/join', { userId, code });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getUserLeagues: async (userId) => {
        try {
            const response = await api.get(`/leagues/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user leagues:', error);
            return [];
        }
    },

    getLeagueDetails: async (code) => {
        try {
            const response = await api.get(`/leagues/${code}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching league details:', error);
            throw error.response?.data || error;
        }
    },

    // --- Sponsor Methods ---






    createSponsorCheckout: async (sponsorData) => {
        try {
            const response = await api.post('/sponsors/checkout', sponsorData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    createRoomSponsorCheckout: async (sponsorData) => {
        try {
            const response = await api.post('/sponsors/room-checkout', sponsorData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    submitPrizeApplication: async (data) => {
        try {
            const response = await api.post('/sponsors/prize-application', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // --- Admin Endpoints ---
    getAdminAnalytics: async () => {
        try {
            const response = await api.get('/admin/analytics');
            return response.data;
        } catch (error) {
            console.error('getAdminAnalytics error:', error);
            throw error.response?.data || error;
        }
    },

    getAdminUserAnalytics: async (search = '') => {
        try {
            const response = await api.get('/admin/analytics/users', { params: { search } });
            return response.data;
        } catch (error) {
            console.error('getAdminUserAnalytics error:', error);
            throw error.response?.data || error;
        }
    },

    getPendingSponsors: async () => {
        try {
            const response = await api.get('/admin/sponsors/pending');
            return response.data;
        } catch (error) {
            console.error('getPendingSponsors error:', error);
            throw error.response?.data || error;
        }
    },

    approveSponsor: async (sponsorId, duration = '1month') => {
        try {
            const response = await api.post(`/admin/sponsors/${sponsorId}/approve`, { duration });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    rejectSponsor: async (id) => {
        try {
            const response = await api.post(`/admin/sponsors/${id}/reject`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    holdSponsor: async (id) => {
        try {
            const response = await api.post(`/admin/sponsors/${id}/hold`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    deleteSponsor: async (id) => {
        try {
            const response = await api.delete(`/admin/sponsors/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getActiveSponsors: async () => {
        try {
            const response = await api.get('/admin/sponsors/active');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    deactivateSponsor: async (id) => {
        try {
            const response = await api.post(`/admin/sponsors/${id}/deactivate`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getActivePrizeSponsors: async () => {
        try {
            const response = await api.get('/sponsors/prizes');
            return response.data;
        } catch (error) {
            console.error('Error fetching active prize sponsors:', error);
            return [];
        }
    },

    getPrizeDrawSponsors: async () => {
        try {
            const response = await api.get('/sponsors/prize-draws');
            return response.data;
        } catch (error) {
            console.error('Error fetching prize draw sponsors:', error);
            return [];
        }
    },

    getActiveSponsors: async () => {
        try {
            const response = await api.get('/sponsors/active');
            return response.data;
        } catch (error) {
            console.error('Error fetching active sponsors:', error);
            return [];
        }
    },



    toggleNotifications: async (userId, enabled) => {
        try {
            const response = await api.post('/user/notifications/settings', { userId, enabled });
            return response.data;
        } catch (error) {
            console.error('Error toggling notifications:', error);
            throw error;
        }
    },

    getNotifications: async (userId) => {
        try {
            const response = await api.get(`/notifications/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    acknowledgeWarning: async () => {
        try {
            const response = await api.post('/notifications/acknowledge');
            return response.data;
        } catch (error) {
            console.error('Error acknowledging warning:', error);
            throw error;
        }
    },

    sendAdminNotification: async (message, targetUserId = 'all', requireAcknowledge = true) => {
        try {
            const response = await api.post('/admin/notify', { message, targetUserId, requireAcknowledge });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /*
    updateRoomCustomAd: async (roomId, adData) => {
        try {
            const response = await api.put(`/chat/rooms/${roomId}/custom-ad`, adData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteRoom: async (roomId) => {
        try {
            const response = await api.delete(`/chat/rooms/${roomId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    */

    getRolePermissions: async () => {
        try {
            const response = await api.get('/admin/role-permissions');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    updateRolePermissions: async (role, permissions) => {
        try {
            const response = await api.post('/admin/role-permissions', { role, permissions });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    setUserRole: async (newRole, targetEmail, targetUuid) => {
        try {
            const response = await api.post('/admin/set-role', { targetEmail, targetUuid, newRole });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    /*
    muteUser: async (targetEmail, muted, targetUuid) => {
        try {
            const response = await api.post('/admin/mute-user', { targetEmail, targetUuid, muted });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    kickUser: async (targetEmail, roomId, targetUuid) => {
        try {
            const response = await api.post('/admin/kick-user', { targetEmail, targetUuid, roomId });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    */


    // User Management
    getAllUsers: async (search = '') => {
        try {
            const response = await api.get(`/admin/users?search=${search}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error.response ? error.response.data : error;
        }
    },

    getAllWinners: async () => {
        try {
            const response = await api.get('/admin/winners');
            return response.data;
        } catch (error) {
            console.error('Error fetching winners:', error);
            throw error.response ? error.response.data : error;
        }
    },

    updateUserBalance: async (userId, tokens, crowns) => {
        try {
            const response = await api.post('/admin/update-user-balance', {
                userId,
                tokens,
                crowns
            });
            return response.data;
        } catch (error) {
            console.error('Error updating user balance:', error);
            throw error.response ? error.response.data : error;
        }
    },

    deleteWinner: async (winnerId) => {
        try {
            const response = await api.post('/admin/delete-winner', { winnerId });
            return response.data;
        } catch (error) {
            console.error('Error deleting winner:', error);
            throw error.response ? error.response.data : error;
        }
    },
};

export default api;
