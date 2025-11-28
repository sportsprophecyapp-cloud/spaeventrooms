import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('userData');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Failed to load user', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const data = await apiService.login(email, password);
            if (data.user) {
                setUser(data.user);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));
                // If the backend returned a token, store it too
                if (data.token) {
                    await AsyncStorage.setItem('userToken', data.token);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const register = async (email, password, username) => {
        try {
            const data = await apiService.register(email, password, username);
            if (data.user) {
                setUser(data.user);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));
                if (data.token) {
                    await AsyncStorage.setItem('userToken', data.token);
                }
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

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
