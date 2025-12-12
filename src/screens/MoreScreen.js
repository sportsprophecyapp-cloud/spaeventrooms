import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const MoreScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    console.log('DEBUG: MoreScreen user role:', user?.role);
    console.log('DEBUG: MoreScreen user email:', user?.email);

    const handleLogout = () => {
        if (typeof window !== 'undefined' && window.confirm) {
            if (window.confirm('Are you sure you want to logout?')) {
                logout();
            }
        } else {
            Alert.alert(
                "Logout",
                "Are you sure you want to logout?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Logout", style: "destructive", onPress: logout }
                ]
            );
        }
    };

    const menuItems = [
        { icon: 'help-circle-outline', label: 'How to Play', badge: null },
        { icon: 'trophy-outline', label: 'Leaderboard', badge: null },
        { icon: 'gift-outline', label: 'Prize Draws', badge: 'New' },
        { icon: 'settings-outline', label: 'Settings', badge: null },
        { icon: 'help-circle-outline', label: 'Help & Support', badge: null },
        { icon: 'megaphone-outline', label: 'Advertise with Us', badge: 'Beta' },
    ];

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>MORE</Text>
                    <Text style={styles.headerSubtitle}>SETTINGS & INFO</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Profile Card */}
                    <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('Profile')}>
                        <LinearGradient
                            colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)']}
                            style={styles.profileCardGradient}
                        >
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.username}>{user?.username || 'Guest'}</Text>
                                <Text style={styles.email}>{user?.email || 'Sign in to sync'}</Text>
                                <Text style={styles.viewProfileText}>View Profile & Settings</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={COLORS.accent.gold} />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="wallet" size={28} color={COLORS.accent.gold} />
                            <Text style={styles.statValue}>{user?.tokens || 0}</Text>
                            <Text style={styles.statLabel}>Tokens</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="crown" size={28} color={COLORS.accent.gold} />
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
                                    if (item.label === 'How to Play') {
                                        navigation.navigate('HowToPlay');
                                    } else if (item.label === 'Leaderboard') {
                                        navigation.navigate('Leaderboard');
                                    } else if (item.label === 'Prize Draws') {
                                        navigation.navigate('WeeklyDraw');
                                    } else if (item.label === 'Settings') {
                                        navigation.navigate('Profile');
                                    } else if (item.label === 'Help & Support') {
                                        navigation.navigate('HelpSupport');
                                    } else if (item.label === 'Advertise with Us') {
                                        navigation.navigate('Sponsor');
                                    }
                                }}
                                accessibilityLabel={`Menu: ${item.label}`}
                                testID={`more-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                                <View style={styles.menuIcon}>
                                    <Ionicons name={item.icon} size={24} color={COLORS.text.secondary} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                {item.badge && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.badge}</Text>
                                    </View>
                                )}
                                <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
                            </TouchableOpacity>
                        ))}

                        {/* Admin Panel - Only visible to admins */}
                        {user?.role === 'admin' && (
                            <TouchableOpacity
                                style={[styles.menuItem, styles.adminMenuItem]}
                                onPress={() => navigation.navigate('Admin')}
                                accessibilityLabel="Menu: Admin Panel"
                                testID="more-menu-admin"
                            >
                                <View style={styles.menuIcon}>
                                    <Ionicons name="shield-checkmark" size={24} color={COLORS.accent.gold} />
                                </View>
                                <Text style={[styles.menuLabel, { color: COLORS.accent.gold }]}>Admin Panel</Text>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.accent.gold} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.menuItem} onPress={handleLogout} accessibilityLabel="Logout Button" testID="more-logout-button">
                            <View style={styles.menuIcon}>
                                <Ionicons name="log-out-outline" size={24} color={COLORS.status.error} />
                            </View>
                            <Text style={[styles.menuLabel, { color: COLORS.status.error }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </BackgroundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        letterSpacing: 2,
    },
    headerSubtitle: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.accent.gold,
        letterSpacing: 1,
        marginTop: SPACING.xs,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    profileCard: {
        marginBottom: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.lg,
    },
    profileCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        borderRadius: BORDER_RADIUS.lg,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.accent.gold,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.base,
        ...SHADOWS.md,
    },
    avatarText: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
    },
    profileInfo: {
        flex: 1,
    },
    username: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    email: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
    },
    viewProfileText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.accent.gold,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
        ...SHADOWS.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border.secondary,
        marginHorizontal: SPACING.base,
    },
    statValue: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.accent.gold,
        marginVertical: SPACING.sm,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    menuContainer: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.base,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
    },
    menuIcon: {
        marginRight: SPACING.base,
        width: 32,
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    badge: {
        backgroundColor: COLORS.accent.lime,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs / 2,
        borderRadius: BORDER_RADIUS.sm,
        marginRight: SPACING.sm,
    },
    badgeText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    adminMenuItem: {
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
        borderColor: 'rgba(255, 215, 0, 0.2)',
    },
});

export default MoreScreen;
