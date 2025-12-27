import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LandingScreen from './src/screens/LandingScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import WeeklyDrawScreen from './src/screens/WeeklyDrawScreen';
import SportScreen from './src/screens/SportScreen';
import HowToPlayScreen from './src/screens/HowToPlayScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import SponsorScreen from './src/screens/SponsorScreen';
import ReportScreen from './src/screens/ReportScreen';
import AdminScreen from './src/screens/AdminScreen';
import LeagueScreen from './src/screens/LeagueScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import AnnouncementsScreen from './src/screens/AnnouncementsScreen';
import AdminSponsorsScreen from './src/screens/AdminSponsorsScreen';
import PredictionHistoryScreen from './src/screens/PredictionHistoryScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import SplashScreen from './src/components/SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';



const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isLoading, loginAsGuest } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    // Expose functions to window for the static index.html landing page
    if (typeof window !== 'undefined') {
      window.loginAsGuest = loginAsGuest;

      // Hide the static landing overlay once the app is fully hydrated.
      // This handles both guests (LandingScreen) and logged-in users (Main)
      if (!isLoading && window.hideStaticLanding) {
        window.hideStaticLanding();

        // Handle pending auth actions from the static landing page
        if (window.pendingAuthAction === 'guest') {
          window.loginAsGuest();
          window.pendingAuthAction = null;
        }
      }
    }
  }, [isLoading, loginAsGuest]);



  // ... (other imports remain, but SplashScreen import added above)

  // ...

  // 🎯 OPTIMIZATION #4: Show branded SplashScreen during hydration
  // This replaces the blank loading screen and provides visual feedback
  if (isLoading) {
    // If we are on web, we don't show the secondary loading indicator
    // because the static landing overlay is already visible.
    if (Platform.OS === 'web') return null;

    // On native, or if web behavior needs to match native
    return <SplashScreen />;
  }


  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      // CRITICAL: Ensure options is NEVER null, as per React 19 fix
      contentStyle: { backgroundColor: '#0a1628' }
    }}>
      {!user ? (
        // Auth Portal (Landing)
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      ) : (
        // Main App
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="WeeklyDraw" component={WeeklyDrawScreen} />
          <Stack.Screen name="Sport" component={SportScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="Sponsor" component={SponsorScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="League" component={LeagueScreen} />
          <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
          <Stack.Screen name="AdminSponsors" component={AdminSponsorsScreen} />
          <Stack.Screen name="PredictionHistory" component={PredictionHistoryScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
          {/* Allow guests to access Register/Login to upgrade/switch account */}
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  useEffect(() => {
    // Standard cleanup or global listeners can go here
  }, []);





  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <NavigationContainer
            fallback={<SplashScreen />}
            documentTitle={{
              formatter: (options, route) => options?.title ? `${options.title} | Sports Prophecy` : 'Sports Prophecy'
            }}
          >
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ErrorBoundary>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
});
