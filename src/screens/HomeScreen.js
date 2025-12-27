import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import StreakIndicator from '../components/StreakIndicator';
import PrizeDrawBanner from '../components/PrizeDrawBanner';
import PerformanceStats from '../components/PerformanceStats';
import GameCard from '../components/GameCard';
import FirstTimeUserView from '../components/FirstTimeUserView';
import SocialProofCard from '../components/SocialProofCard';
import { NoPredictionsYet, BrokenStreak } from '../components/EmptyStates';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import { APP_VERSION } from '../constants/version';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [prizeDraws, setPrizeDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [showBrokenStreakModal, setShowBrokenStreakModal] = useState(false);

  // 🛡️ OPTIMIZATION: Initialize loading as TRUE until user context is ready
  useEffect(() => {
    if (!user) {
      setLoading(true);
      return;
    }

    loadData();
    console.log('HomeScreen - User data:', JSON.stringify(user, null, 2));
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Check onboarding status
      if (!user || typeof user !== 'object') {
        console.warn('HomeScreen: user is not ready');
        setGames([]);
        setLoading(false);
        return;
      }

      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding && user && !user.isGuest) {
        setIsFirstTimeUser(true);
      }

      // 2. Fetch games with explicit type checking
      try {
        const gamesData = await apiService.getEvents();
        const safeGames = Array.isArray(gamesData) ? gamesData.slice(0, 3) : [];
        setGames(safeGames);
      } catch (gameError) {
        console.error('Error fetching games:', gameError);
        setGames([]);
      }

      // 3. Fetch prize draws
      try {
        const stats = await apiService.getWeeklyDrawStats();
        setPrizeDraws([{
          id: 'weekly-current',
          title: 'Weekly Prize Draw',
          prizeValue: '$50 Google Gift Card',
          entriesCount: stats?.totalEntries || 0,
          endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }]);
      } catch (prizeError) {
        console.error('Error fetching prize draws:', prizeError);
        setPrizeDraws([{
          id: 'weekly-current',
          title: 'Weekly Prize Draw',
          prizeValue: '$50 Google Gift Card',
          entriesCount: 0,
          endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }]);
      }

    } catch (error) {
      console.error('HomeScreen loadData error:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  // 🛡️ Streak check with explicit guards
  useEffect(() => {
    if (!user || typeof user !== 'object') return;
    if (!user?.lastLoginDate || !user?.loginStreak) return;

    try {
      const lastLogin = new Date(user.lastLoginDate);
      const today = new Date();

      const lastDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffTime = currentDate - lastDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1 || (user.loginStreak > 1 && user.loginStreak % 5 === 0)) {
        setShowBrokenStreakModal(true);
      }
    } catch (e) {
      console.error('Error calculating streak:', e);
    }
  }, [user]);

  // 🛡️ GATE KEEPER: Show loading ONLY if no user yet
  if (!user || typeof user !== 'object' || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent.cyan} />
        <Text style={{ color: COLORS.text.muted, marginTop: 12, fontSize: 12 }}>
          Loading your prophecies...
        </Text>
      </View>
    );
  }

  if (isFirstTimeUser) {
    return (
      <FirstTimeUserView
        navigation={navigation}
        games={games}
        onComplete={() => {
          setIsFirstTimeUser(false);
          loadData();
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#2563EB', '#9333EA', '#DB2777']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome Test v2.18.12 🎯</Text>
          <View style={styles.balanceRow}>
            <Text>{user?.username || user?.idName || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#FFF" />
            {user?.unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {user?.unreadNotifications || 0}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Token/Crown Balance */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Ionicons name="logo-bitcoin" size={20} color="#FCD34D" />
              <Text style={styles.balanceLabel}>Tokens</Text>
            </View>
            <Text style={styles.balanceAmount}>{user?.tokens || 0}</Text>
            <Text style={styles.balanceSubtext}>+{user?.tokensToday || 0} today</Text>
            <Text style={styles.helperText}>free. login daily for +5</Text>
          </View>

          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Ionicons name="trophy" size={20} color="#FCD34D" />
              <Text style={styles.balanceLabel}>Crowns</Text>
            </View>
            <Text style={styles.balanceAmount}>{user?.crowns || 0}</Text>
            <Text style={styles.balanceSubtext}>
              {Math.floor(user?.crowns || 0)} entries ready
            </Text>
            <Text style={styles.helperText}>unlocks prize entries</Text>
          </View>
        </View>

        {/* Streak Indicator */}
        <StreakIndicator streak={user?.loginStreak || 0} />
      </LinearGradient>

      {/* Broken Streak Modal/Banner */}
      {showBrokenStreakModal && (
        <BrokenStreak
          streakLength={user?.loginStreak || 0}
          onContinue={() => setShowBrokenStreakModal(false)}
        />
      )}

      {/* Prize Draw Banner */}
      <View style={styles.prizeDrawContainer}>
        {/* 🛡️ IRON-CLAD: Check prizeDraws is array before mapping */}
        {Array.isArray(prizeDraws) && prizeDraws.length > 0 ? (
          <PrizeDrawBanner
            draw={prizeDraws[0]}
            onPress={() => navigation.navigate('Prizes')}
          />
        ) : null}
      </View>

      {/* Social Proof - Live Activity */}
      <View style={styles.socialProofContainer}>
        <SocialProofCard
          user="BenchWarmer"
          amount="50 Google Gift Card"
          message="Finally! Hard work and sports knowledge paid off! 🏆"
          type="winner"
        />
      </View>

      {/* Performance Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Performance</Text>
        <PerformanceStats stats={user} />
      </View>

      {/* Games Today */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Games Today</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Sport', { sportId: 'all', sportName: 'Upcoming Games', _t: Date.now() })}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {/* 🛡️ Empty state for new users */}
        {(user?.correctPredictions === 0 || !user) && (
          <NoPredictionsYet onMakePrediction={() => navigation.navigate('Sport', { sportId: 'all', sportName: 'All Games', _t: Date.now() })} />
        )}

        {/* 🛡️ THE IRON-CLAD AIRBAG: Triple-layer safety check */}
        {Array.isArray(games) && games.length > 0 ? (
          // Layer 1: Verify games is array
          games.map((game, index) => {
            // Layer 2: Verify each game object exists
            if (!game) return null;

            return (
              <GameCard
                // Layer 3: Safe key generation
                key={game?.id || game?._id || `home-game-${index}`}
                game={game}
                onPress={() => navigation.navigate('Sport', {
                  sportId: game?.sport_key || 'all',
                  sportName: game?.sport_title || 'Game Details',
                  _t: Date.now()
                })}
              />
            );
          })
        ) : (
          <Text style={{ textAlign: 'center', color: '#6B7280', marginVertical: 20 }}>
            No games scheduled for today.
          </Text>
        )}
      </View>

      {/* Sponsors Section */}
      <View style={styles.legalNotice}>
        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
        <Text style={styles.legalNoticeText}>
          100% Free to Play • No Deposits • No Gambling • Skill-Based Only
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Sponsors</Text>
        <View style={styles.sponsorsCard}>
          <Text style={styles.sponsorsSubtext}>Trusted by leading sports brands</Text>
          <View style={styles.sponsorsGrid}>
            {/* 🛡️ IRON-CLAD: Safe sponsor grid mapping */}
            {Array.isArray([1, 2, 3]) ? (
              [1, 2, 3].map((item, index) => (
                <View key={`sponsor-${index}`} style={styles.sponsorItem}>
                  <Text style={styles.sponsorText}>Partner Brand</Text>
                </View>
              ))
            ) : (
              <Text>No sponsors available</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Sponsor')}>
            <Text style={styles.viewPartnersText}>View All Partners →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Version Display */}
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Text style={{ color: COLORS.text.muted, fontSize: 10, opacity: 0.6 }}>v{APP_VERSION}</Text>
      </View>

      {/* Spacer for bottom tab */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  heroSection: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  welcomeText: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  usernameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.75,
    marginTop: 4,
  },
  prizeDrawContainer: {
    marginHorizontal: 16,
    marginTop: -32,
    marginBottom: 8,
    zIndex: 10,
  },
  socialProofContainer: {
    marginBottom: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent.cyan,
  },
  sponsorsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sponsorsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  sponsorsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  sponsorItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  sponsorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  viewPartnersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
    paddingVertical: 8,
  },
  legalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  legalNoticeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontStyle: 'italic',
  },
  balanceRow: {
    color: '#FFF',
  },
});
