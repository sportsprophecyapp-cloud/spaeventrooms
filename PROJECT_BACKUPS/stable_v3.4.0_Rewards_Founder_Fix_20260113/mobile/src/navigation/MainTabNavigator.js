import ChatScreen from '../screens/ChatScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import { COLORS } from '../constants/theme';
import HomeScreen from '../screens/HomeScreen';
import PrizeDrawsScreen from '../screens/PrizeDrawsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.background.secondary,
                    borderTopColor: COLORS.border.secondary,
                    height: Platform.OS === 'ios' ? 85 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: COLORS.accent.cyan,
                tabBarInactiveTintColor: COLORS.text.tertiary,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Chat') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'Prizes') {
                        iconName = focused ? 'gift' : 'gift-outline';
                    } else if (route.name === 'Leaderboard') {
                        iconName = focused ? 'trophy' : 'trophy-outline';
                    } else if (route.name === 'More') {
                        iconName = focused ? 'menu' : 'menu-outline';
                    }

                    return (
                        <View style={{ alignItems: 'center' }}>
                            <Ionicons name={iconName} size={size} color={color} />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Prizes" component={PrizeDrawsScreen} />
            <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarLabel: 'Ranks', tabBarIcon: ({ color, size }) => (<Ionicons name="trophy-outline" size={size} color={color} />) }} />
            <Tab.Screen name="More" component={MoreScreen} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;
