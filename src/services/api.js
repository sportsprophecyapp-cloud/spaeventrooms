import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variable or fallback to local API for development
// Use environment variable or fallback to local API for development
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
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
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const apiService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    register: async (email, password, username, referralCode) => {
        try {
            const response = await api.post('/register', { email, password, username, referralCode });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
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

    getUserBalance: async (userId) => {
        try {
            const response = await api.get(`/user/${userId}/balance`);
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

    getLeaderboard: async () => {
        try {
            const response = await api.get('/leaderboard');
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

    getUserProfile: async (userId) => {
        try {
            const response = await api.get(`/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
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
    createSponsorCheckout: async (data) => {
        try {
            const response = await api.post('/sponsors/create-checkout-session', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    submitPrizeApplication: async (data) => {
        try {
            const response = await api.post('/sponsors/apply', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getPendingSponsors: async () => {
        try {
            const response = await api.get('/admin/sponsors/pending');
            return response.data;
        } catch (error) {
            console.error('Error fetching pending sponsors:', error);
            return [];
        }
    },

    approveSponsor: async (sponsorId) => {
        try {
            const response = await api.post('/admin/sponsors/approve', { sponsorId });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default api;
