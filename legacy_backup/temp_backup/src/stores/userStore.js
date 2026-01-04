import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define API URL from environment
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-backend-url.com';

export const useUserStore = create(
    persist(
        (set, get) => ({
            // State
            userData: null,
            games: [],
            prizeDraws: [],
            loading: false,
            error: null,

            // Actions
            setUserData: (data) => set({ userData: data }),
            setGames: (games) => set({ games: games }),
            setPrizeDraws: (draws) => set({ prizeDraws: draws }),

            fetchUserData: async (userId) => {
                if (!userId && !get().userData?.id) return;
                const idToFetch = userId || get().userData.id;

                set({ loading: true, error: null });
                try {
                    const response = await fetch(`${API_URL}/api/profile/${idToFetch}`);
                    if (!response.ok) throw new Error('Failed to fetch user data');
                    const data = await response.json();
                    set({ userData: data, loading: false });
                } catch (error) {
                    set({ error: error.message, loading: false });
                }
            },

            fetchGames: async () => {
                try {
                    const response = await fetch(`${API_URL}/api/games/upcoming`);
                    if (!response.ok) throw new Error('Failed to fetch games');
                    const data = await response.json();
                    set({ games: data });
                } catch (error) {
                    console.error('Error fetching games:', error);
                    // Don't set global error for games failure to avoid blocking UI
                }
            },

            updateBalance: (tokens, crowns) => set((state) => ({
                userData: {
                    ...state.userData,
                    tokens: state.userData.tokens + tokens,
                    crowns: state.userData.crowns + crowns,
                },
            })),

            incrementStreak: () => set((state) => ({
                userData: {
                    ...state.userData,
                    login_streak: state.userData.login_streak + 1,
                },
            })),

            resetStreak: () => set((state) => ({
                userData: {
                    ...state.userData,
                    login_streak: 0,
                },
            })),

            logout: () => set({ userData: null, error: null }),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ userData: state.userData }), // Only persist user data
        }
    )
);
