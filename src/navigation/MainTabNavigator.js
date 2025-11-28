import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#0f172a',
                    borderTopColor: 'rgba(255,255,255,0.05)',
                    height: Platform.OS === 'ios' ? 85 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: '#38bdf8',
                tabBarInactiveTintColor: '#64748b',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Chat') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
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
            <Tab.Screen name="More" component={MoreScreen} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;
