import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LandingScreen from './src/screens/LandingScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
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
import { AuthProvider, useAuth } from './src/context/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

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
        </>
      ) : (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
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
          <NavigationContainer>
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
    backgroundColor: '#0f172a',
  },
});
