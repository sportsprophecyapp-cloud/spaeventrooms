import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';



const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (user && !isLoading) {
      // Only redirect if we are on an auth screen or HowToPlay screen
      // Use setTimeout to ensure navigation state is ready
      const route = navigation.getCurrentRoute();
      const routeName = route?.name;

      if (!routeName || ['Login', 'Register', 'Landing'].includes(routeName)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    }
  }, [user, isLoading]);


  // Handle logout - navigate back to Landing when user becomes null
  useEffect(() => {
    if (!user && !isLoading) {
      const route = navigation.getCurrentRoute();
      const routeName = route?.name;

      // If we're on an authenticated screen, navigate to Landing
      if (routeName && !['Login', 'Register', 'Landing', 'HowToPlay', 'TermsOfService', 'PrivacyPolicy'].includes(routeName)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Landing' }],
        });
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="WeeklyDraw" component={WeeklyDrawScreen} />
          <Stack.Screen name="Sport" component={SportScreen} />
          <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
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
          {/* Allow guests to access Register/Login to upgrade/switch account */}
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <NavigationContainer
            documentTitle={{
              formatter: (options, route) => options?.title ? `${options.title} | Sports Prophecy` : 'Sports Prophecy'
            }}
          >
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ErrorBoundary>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
