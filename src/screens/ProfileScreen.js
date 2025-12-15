import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { BiometricService } from '../services/biometrics';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, refreshUser, logout } = useAuth();
    const [predictions, setPredictions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // ID Name Change State
    const [showEditModal, setShowEditModal] = useState(false);
    const [newIdName, setNewIdName] = useState('');
    const [updatingName, setUpdatingName] = useState(false);

    useEffect(() => {
        fetchUserData();
        if (user) {
            setNotificationsEnabled(user.notificationsEnabled ?? true);
        }
        checkBiometrics();
    }, [user]);

    const checkBiometrics = async () => {
        const { hasHardware, isEnrolled } = await BiometricService.checkBiometricSupport();
        setIsBiometricSupported(hasHardware && isEnrolled);

        if (hasHardware && isEnrolled) {
            const credentials = await BiometricService.getCredentials();
            setBiometricsEnabled(!!credentials && credentials.email === user?.email);
        }
    };

    const fetchUserData = async () => {
        if (!user) return;
        console.log('DEBUG: ProfileScreen user:', JSON.stringify(user, null, 2));

        try {
            setLoading(true);
            const userPredictions = await apiService.getUserPredictions(user.uuid);
            setPredictions(userPredictions || []);

            // Fetch real notifications from backend
            let realNotifications = [];
            try {
                realNotifications = await apiService.getNotifications(user.uuid);
            } catch (e) {
                console.log('Error fetching real notifications', e);
            }

            // Create fake notifications for resolved predictions (legacy/fallback)
            const wonPredictions = (userPredictions || []).filter(p => p.resolved && p.won);
            const predictionNotifs = wonPredictions.map(p => ({
                id: `pred-${p.id}`,
                type: 'win',
                message: `You won your prediction on ${p.eventName || 'a game'}!`,
                reward: p.exactScore ? '+4 tokens, +2 crowns' : '+3 tokens, +1 crown',
                timestamp: p.resolvedAt || p.timestamp,
                read: false
            }));

            // Merge and sort
            const allNotifs = [...realNotifications, ...predictionNotifs].sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            setNotifications(allNotifs);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Failed to load profile data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setError(null);
        await fetchUserData();
        await refreshUser();
        setRefreshing(false);
    };

    const handleToggleNotifications = async (value) => {
        setNotificationsEnabled(value);
        try {
            await apiService.toggleNotifications(user.uuid, value);
        } catch (error) {
            console.error('Failed to toggle notifications:', error);
            // Revert on error
            setNotificationsEnabled(!value);
            Alert.alert('Error', 'Failed to update notification settings');
        }
    };

    const handleToggleBiometrics = async (value) => {
        if (value) {
            // Enable: Authenticate then Save
            const authenticated = await BiometricService.authenticate('Confirm to enable biometric login');
            if (authenticated) {
                // Prompt for password to save securely (since we don't have it in plain text)
                Alert.prompt(
                    'Confirm Password',
                    'Please enter your password to enable FaceID/TouchID functionality.',
                    [
                        { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                        {
                            text: 'Enable',
                            onPress: async (password) => {
                                if (!password) return;
                                const success = await BiometricService.saveCredentials(user.email, password);
                                if (success) {
                                    setBiometricsEnabled(true);
                                    Alert.alert('Success', 'Biometric login enabled!');
                                } else {
                                    Alert.alert('Error', 'Failed to enable biometrics');
                                }
                            }
                        }
                    ],
                    'secure-text'
                );
            }
        } else {
            // Disable: Clear credentials
            const success = await BiometricService.clearCredentials();
            if (success) {
                setBiometricsEnabled(false);
            }
        }
    };



    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: `Join me on Sports Prophecy and get 5 free crowns! Use my code ${user?.referralCode} at signup. Play here: https://www.sportsprophecyapp.com`,
            });
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to permanently delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await apiService.deleteAccount();
                            Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
                            logout(); // Log out after deletion
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete account. Please try again.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateIdName = async (resetLogout = null) => {
        // ... hook in logout if needed
        // Re-paste original handleUpdateIdName logic here as we replaced it partially to insert handleDeleteAccount? 
        // No, instruction says "Add handleDeleteAccount function", usually implies putting it alongside others.
        // I am targeting lines 156-179 which is handleUpdateIdName. I should probably insert BEFORE or AFTER it, not replace it unless I include it.
        // Let's include original logic.

        if (!newIdName || newIdName.length < 3) {
            Alert.alert('Invalid Name', 'ID Name must be at least 3 characters long.');
            return;
        }

        if (user.tokens < 20) {
            Alert.alert('Insufficient Tokens', 'You need 20 tokens to change your ID Name.');
            return;
        }

        try {
            setUpdatingName(true);
            await apiService.changeIdName(user.uuid, newIdName);
            await refreshUser();
            setShowEditModal(false);
            setNewIdName('');
            Alert.alert('Success', 'Your ID Name has been updated!');
        } catch (error) {
            Alert.alert('Error', error.error || 'Failed to update ID Name');
        } finally {
            setUpdatingName(false);
        }
    };

    const totalPredictions = predictions.length;
    const wonPredictions = predictions.filter(p => p.resolved && p.won).length;
    const winRate = totalPredictions > 0 ? Math.round((wonPredictions / totalPredictions) * 100) : 0;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent.cyan} />
                }
            >
                {error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color={COLORS.status.error} />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* User Info Card */}
                        <LinearGradient
                            colors={COLORS.gradients.primary}
                            style={styles.userCard}
                        >
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>{user?.idName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
                            </View>

                            <View style={styles.nameContainer}>
                                <Text style={styles.username}>{user?.idName || user?.username || 'Guest'}</Text>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => {
                                        setNewIdName(user?.idName || user?.username || '');
                                        setShowEditModal(true);
                                    }}
                                >
                                    <Ionicons name="pencil" size={16} color={COLORS.text.inverse} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.email}>{user?.email || ''}</Text>
                        </LinearGradient>

                        {/* Admin Panel Entry - Only for Admins */}
                        {user?.role === 'admin' && (
                            <TouchableOpacity
                                style={styles.adminButton}
                                onPress={() => navigation.navigate('AdminSponsors')}
                            >
                                <LinearGradient
                                    colors={['#FF416C', '#FF4B2B']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.adminButtonGradient}
                                >
                                    <Ionicons name="shield-checkmark" size={24} color="#fff" />
                                    <Text style={styles.adminButtonText}>Admin Panel</Text>
                                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {/* Stats Grid */}
                        <View style={styles.statsGrid}>
                            <View style={styles.statBox}>
                                <Ionicons name="wallet-outline" size={24} color={COLORS.accent.lime} />
                                <Text style={styles.statValue}>{user?.tokens || 0}</Text>
                                <Text style={styles.statLabel}>Tokens</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Ionicons name="trophy" size={24} color="#FFD700" />
                                <Text style={styles.statValue}>{user?.crowns || 0}</Text>
                                <Text style={styles.statLabel}>Crowns</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Ionicons name="checkmark-circle" size={24} color={COLORS.status.success} />
                                <Text style={styles.statValue}>{user?.correctPredictions || 0}</Text>
                                <Text style={styles.statLabel}>Wins</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Ionicons name="percent" size={24} color={COLORS.accent.cyan} />
                                <Text style={styles.statValue}>{winRate}%</Text>
                                <Text style={styles.statLabel}>Win Rate</Text>
                            </View>
                        </View>

                        {/* Badges Section */}
                        {(user?.badges?.length > 0 || user?.role === 'admin') && (
                            <View style={styles.badgesSection}>
                                <Text style={styles.sectionTitle}>🏆 Badges</Text>
                                <View style={styles.badgesContainer}>
                                    {/* Fallback for Admin Badge if not in array but role is admin */}
                                    {user?.role === 'admin' && !user?.badges?.includes('👑 Admin') && (
                                        <View style={styles.badgeItem}>
                                            <Text style={styles.badgeText}>👑 Admin</Text>
                                        </View>
                                    )}

                                    {user?.badges?.map((badge, index) => (
                                        <View key={index} style={styles.badgeItem}>
                                            <Text style={styles.badgeText}>{badge}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Referral Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🎁 Refer Friends & Earn</Text>
                            <LinearGradient
                                colors={COLORS.gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.referralCard}
                            >
                                <View style={styles.referralHeader}>
                                    <Ionicons name="gift" size={32} color={COLORS.text.inverse} />
                                    <Text style={styles.referralTitle}>Your Referral Code</Text>
                                </View>
                                <View style={styles.referralCodeContainer}>
                                    <Text style={styles.referralCode}>
                                        {user?.referralCode || 'N/A'}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.copyButton}
                                        onPress={handleShare}
                                    >
                                        <Ionicons name="share-social-outline" size={20} color={COLORS.text.inverse} />
                                        <Text style={styles.copyButtonText}>Share</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.referralStats}>
                                    <View style={styles.referralStatItem}>
                                        <Text style={styles.referralStatValue}>{user?.referralCount || 0}</Text>
                                        <Text style={styles.referralStatLabel}>Friends Referred</Text>
                                    </View>
                                    <View style={styles.referralDivider} />
                                    <View style={styles.referralStatItem}>
                                        <Text style={styles.referralStatValue}>5 👑</Text>
                                        <Text style={styles.referralStatLabel}>Per Referral</Text>
                                    </View>
                                </View>
                                <Text style={styles.referralInfo}>
                                    Share your code with friends! You both get 5 crowns when they sign up.
                                </Text>
                            </LinearGradient>
                        </View>

                        {/* Notifications Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="notifications" size={20} color={COLORS.accent.cyan} />
                                <Text style={styles.sectionTitle}>Notifications</Text>
                            </View>

                            <View style={styles.settingRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.settingLabel}>Enable Notifications</Text>
                                    <Text style={styles.settingSublabel}>Winners will be notified after draws completion</Text>
                                </View>
                                <Switch
                                    trackColor={{ false: "#767577", true: COLORS.accent.cyan }}
                                    thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
                                    onValueChange={handleToggleNotifications}
                                    value={notificationsEnabled}
                                />
                            </View>

                            {isBiometricSupported && (
                                <View style={[styles.settingRow, { marginTop: SPACING.lg }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.settingLabel}>Biometric Login</Text>
                                        <Text style={styles.settingSublabel}>Use FaceID/TouchID for quick access</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: "#767577", true: COLORS.accent.cyan }}
                                        thumbColor={biometricsEnabled ? "#fff" : "#f4f3f4"}
                                        onValueChange={handleToggleBiometrics}
                                        value={biometricsEnabled}
                                    />
                                </View>
                            )}

                            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                                <Text style={styles.sectionTitle}>Recent Activity</Text>
                                {notifications.length > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{notifications.length}</Text>
                                    </View>
                                )}
                            </View>

                            {notifications.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="notifications-off-outline" size={48} color={COLORS.text.tertiary} />
                                    <Text style={styles.emptyText}>No notifications yet</Text>
                                    <Text style={styles.emptySubtext}>Win predictions to get notified!</Text>
                                </View>
                            ) : (
                                notifications.map((notif) => (
                                    <View key={notif.id} style={styles.notificationCard}>
                                        <View style={styles.notifIcon}>
                                            <Ionicons
                                                name={notif.type === 'admin' ? "megaphone" : "trophy"}
                                                size={24}
                                                color={notif.type === 'admin' ? COLORS.accent.cyan : "#FFD700"}
                                            />
                                        </View>
                                        <View style={styles.notifContent}>
                                            <Text style={styles.notifMessage}>{notif.message}</Text>
                                            <Text style={styles.notifReward}>{notif.reward}</Text>
                                            <Text style={styles.notifTime}>
                                                {new Date(notif.timestamp).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <Ionicons name="checkmark-circle" size={20} color={COLORS.status.success} />
                                    </View>
                                ))
                            )}
                        </View>

                        {/* Recent Predictions */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="list" size={20} color={COLORS.accent.cyan} />
                                <Text style={styles.sectionTitle}>Recent Predictions</Text>
                            </View>

                            {predictions.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="football-outline" size={48} color={COLORS.text.tertiary} />
                                    <Text style={styles.emptyText}>No predictions yet</Text>
                                    <Text style={styles.emptySubtext}>Start making predictions to see them here!</Text>
                                </View>
                            ) : (
                                predictions.slice(0, 5).map((pred) => (
                                    <View key={pred.id} style={styles.predictionCard}>
                                        <View style={styles.predContent}>
                                            <Text style={styles.predTeam}>{pred.predictedWinner}</Text>
                                            <Text style={styles.predEvent}>{pred.eventId}</Text>
                                            <Text style={styles.predDate}>
                                                {new Date(pred.timestamp).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <View style={styles.predStatus}>
                                            {pred.resolved ? (
                                                pred.won ? (
                                                    <View style={styles.statusBadge}>
                                                        <Ionicons name="checkmark-circle" size={16} color={COLORS.status.success} />
                                                        <Text style={[styles.statusText, { color: COLORS.status.success }]}>Won</Text>
                                                    </View>
                                                ) : (
                                                    <View style={styles.statusBadge}>
                                                        <Ionicons name="close-circle" size={16} color={COLORS.status.error} />
                                                        <Text style={[styles.statusText, { color: COLORS.status.error }]}>Lost</Text>
                                                    </View>
                                                )
                                            ) : (
                                                <View style={styles.statusBadge}>
                                                    <Ionicons name="time" size={16} color={COLORS.text.tertiary} />
                                                    <Text style={[styles.statusText, { color: COLORS.text.tertiary }]}>Pending</Text>
                                                </View>
                                            )}
                                        </View>

                                    </View>
                                ))
                            )}
                        </View>
                    </>
                )}
            </View>

            {/* Delete Account Button */}
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
            >
                <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
        </>
    )
}
            </ScrollView >

    {/* Edit ID Name Modal */ }
    < Modal
animationType = "slide"
transparent = { true}
visible = { showEditModal }
onRequestClose = {() => setShowEditModal(false)}
            >
    <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change ID Name</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                    <Ionicons name="close" size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
                Choose a new unique ID Name. This will be displayed on the leaderboard and in chat.
            </Text>

            <View style={styles.costBadge}>
                <Text style={styles.costText}>Cost: 20 Tokens</Text>
                <Ionicons name="wallet-outline" size={16} color={COLORS.accent.lime} />
            </View>

            <TextInput
                style={styles.input}
                value={newIdName}
                onChangeText={setNewIdName}
                placeholder="Enter new ID Name"
                placeholderTextColor={COLORS.text.tertiary}
                autoCapitalize="none"
                maxLength={20}
            />

            <TouchableOpacity
                style={[styles.saveButton, (updatingName || !newIdName || newIdName.length < 3) && styles.disabledButton]}
                onPress={handleUpdateIdName}
                disabled={updatingName || !newIdName || newIdName.length < 3}
            >
                {updatingName ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </View>
    </View>
            </Modal >
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
        backgroundColor: COLORS.background.secondary,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    content: {
        padding: SPACING.base,
    },
    userCard: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.lg,
        ...SHADOWS.cyan,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    avatarText: {
        fontSize: TYPOGRAPHY.sizes.xxxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    username: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.inverse,
    },
    editButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 6,
        borderRadius: BORDER_RADIUS.full,
    },
    email: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.inverse,
        opacity: 0.8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    statBox: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    statValue: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        marginTop: SPACING.sm,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.secondary,
        marginTop: SPACING.xs,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    badge: {
        backgroundColor: COLORS.status.error,
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        marginLeft: SPACING.xs,
    },
    badgeText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    emptyState: {
        alignItems: 'center',
        padding: SPACING.xxxl,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.text.secondary,
        marginTop: SPACING.md,
    },
    emptySubtext: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.tertiary,
        marginTop: SPACING.xs,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
        alignItems: 'center',
    },
    notifIcon: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    notifContent: {
        flex: 1,
    },
    notifMessage: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    notifReward: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.accent.lime,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.xs,
    },
    notifTime: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.tertiary,
    },
    predictionCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
        alignItems: 'center',
    },
    predContent: {
        flex: 1,
    },
    predTeam: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    predEvent: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
    },
    predDate: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.tertiary,
    },
    predStatus: {
        marginLeft: SPACING.md,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.background.primary,
    },
    statusText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    referralCard: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        marginTop: SPACING.md,
        ...SHADOWS.cyan,
    },
    referralHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    referralTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.inverse,
    },
    referralCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.base,
        marginBottom: SPACING.lg,
    },
    referralCode: {
        fontSize: TYPOGRAPHY.sizes.xxxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
        letterSpacing: 4,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    copyButtonText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.inverse,
    },
    referralStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: SPACING.base,
    },
    referralStatItem: {
        alignItems: 'center',
    },
    referralStatValue: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
        marginBottom: SPACING.xs,
    },
    referralStatLabel: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.inverse,
        opacity: 0.9,
    },
    referralDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    referralInfo: {
        textAlign: 'center',
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.inverse,
        fontStyle: 'italic',
        opacity: 0.9,
    },
    badgesSection: {
        marginBottom: SPACING.lg,
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    badgeItem: {
        backgroundColor: COLORS.background.card,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border.primary,
    },
    badgeText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalContent: {
        width: '100%',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
        ...SHADOWS.card,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    modalDescription: {
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.text.secondary,
        marginBottom: SPACING.lg,
        lineHeight: 22,
    },
    costBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.lg,
    },
    costText: {
        color: COLORS.accent.lime,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    input: {
        backgroundColor: COLORS.background.input,
        borderWidth: 1,
        borderColor: COLORS.border.primary,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.lg,
        marginBottom: SPACING.xl,
    },
    saveButton: {
        backgroundColor: COLORS.accent.cyan,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    // Admin Button (missing from prev snippet? checking context...)
    adminButton: {
        marginBottom: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.card,
    },
    adminButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        justifyContent: 'space-between',
    },
    adminButtonText: {
        color: '#fff',
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.background.card,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
        marginBottom: SPACING.sm,
    },
    settingLabel: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginBottom: 2,
    },
    settingSublabel: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    // New delete button
    deleteButton: {
        alignSelf: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        marginTop: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.status.error,
        borderRadius: BORDER_RADIUS.md,
    },
    deleteButtonText: {
        color: COLORS.status.error,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.bold,
    },

    // retry
    errorContainer: {
        alignItems: 'center',
        padding: SPACING.xxxl,
    },
    errorText: {
        color: COLORS.status.error,
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.background.card,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border.primary,
    },
    retryButtonText: {
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.xs,
        marginTop: SPACING.sm,
    },
    settingLabel: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: 2,
    },
    settingSublabel: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.secondary,
        marginRight: SPACING.md,
    },
});

export default ProfileScreen;
