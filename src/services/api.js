import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variable or fallback to production API
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sportsprophecy-backend-lqq2d5um5.vercel.app/api';

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

    register: async (email, password, username) => {
        try {
            const response = await api.post('/register', { email, password, username });
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

    getChat: async () => {
        try {
            const response = await api.get('/chat');
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

    submitPrediction: async (predictionData) => {
        try {
            const response = await api.post('/predictions', predictionData);
            return response.data;
        } catch (error) {
            console.error('Error submitting prediction:', error);
            throw error;
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
    }
};

export default api;
