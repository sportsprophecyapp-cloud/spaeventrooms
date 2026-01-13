import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Unified storage utility that works across web and native platforms
 * - Uses AsyncStorage for native (iOS/Android)
 * - Uses localStorage for web
 */

const isWeb = Platform.OS === 'web';

const storage = {
    async getItem(key) {
        try {
            if (isWeb) {
                // Use localStorage for web
                const value = localStorage.getItem(key);
                return value;
            } else {
                // Use AsyncStorage for native
                return await AsyncStorage.getItem(key);
            }
        } catch (error) {
            console.error(`Error getting item ${key}:`, error);
            return null;
        }
    },

    async setItem(key, value) {
        try {
            if (isWeb) {
                // Use localStorage for web
                localStorage.setItem(key, value);
            } else {
                // Use AsyncStorage for native
                await AsyncStorage.setItem(key, value);
            }
        } catch (error) {
            console.error(`Error setting item ${key}:`, error);
            throw error;
        }
    },

    async removeItem(key) {
        try {
            if (isWeb) {
                // Use localStorage for web
                localStorage.removeItem(key);
            } else {
                // Use AsyncStorage for native
                await AsyncStorage.removeItem(key);
            }
        } catch (error) {
            console.error(`Error removing item ${key}:`, error);
        }
    },

    async clear() {
        try {
            if (isWeb) {
                // Use localStorage for web
                localStorage.clear();
            } else {
                // Use AsyncStorage for native
                await AsyncStorage.clear();
            }
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    },
};

export default storage;
