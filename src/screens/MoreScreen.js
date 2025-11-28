import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const MoreScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: logout }
            ]
        );
    };

    const menuItems = [
        { icon: 'trophy-outline', label: 'Leaderboard', badge: null },
        { icon: 'gift-outline', label: 'Weekly Draw', badge: 'New' },
        { icon: 'settings-outline', label: 'Settings', badge: null },
        { icon: 'help-circle-outline', label: 'Help & Support', badge: null },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>More</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.username}>{user?.username || 'Guest'}</Text>
                        <Text style={styles.email}>{user?.email || 'Sign in to sync'}</Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="wallet" size={24} color="#fbbf24" />
                        <Text style={styles.statValue}>{user?.tokens || 0}</Text>
                        <Text style={styles.statLabel}>Tokens</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="crown" size={24} color="#38bdf8" />
                        <Text style={styles.statValue}>{user?.crowns || 0}</Text>
                        <Text style={styles.statLabel}>Crowns</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={() => {
                                if (item.label === 'Leaderboard') {
                                    navigation.navigate('Leaderboard');
                                } else if (item.label === 'Weekly Draw') {
                                    navigation.navigate('WeeklyDraw');
                                }
                            }}
                        >
                            <View style={styles.menuIcon}>
                                <Ionicons name={item.icon} size={24} color="#94a3b8" />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#475569" />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                        </View>
                        <Text style={[styles.menuLabel, { color: '#ef4444' }]}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollContent: {
        padding: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#38bdf8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileInfo: {
        flex: 1,
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#94a3b8',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    menuContainer: {
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    menuIcon: {
        marginRight: 15,
    },
    menuLabel: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
});

export default MoreScreen;
