import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ActivityIndicator, Switch, Image, Share } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { AVATAR_CATEGORIES, PRESET_AVATARS, getAvatarSource, BADGE_AVATARS } from '../constants/avatars';
import { BiometricService } from '../services/biometrics';
import TooltipIconButton from '../components/TooltipIconButton';
import UserAvatar from '../components/UserAvatar';
import { Platform } from 'react-native';

const showAlert = (title, message, buttons) => {
    if (Platform.OS === 'web') {
        if (buttons && buttons.length > 0) {
            // If it's a confirmation style alert
            const confirmText = buttons.find(b => b.style === 'destructive' || b.text === 'Delete' || b.text === 'Confirm')?.text || 'OK';
            if (window.confirm(`${title}\n\n${message}`)) {
                const action = buttons.find(b => b.text === confirmText || b.style === 'destructive')?.onPress;
                if (action) action();
            }
        } else {
            window.alert(`${title}\n\n${message}`);
        }
    } else {
        Alert.alert(title, message, buttons);
    }
};

const blurActiveElement = () => {
    if (Platform.OS === 'web') {
        try {
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
            // Move focus to body to be safe
            document.body.focus();
        } catch (e) {
            // Focus reset failed, ignore
        }
    }
};

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
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'won', 'lost', 'pending'
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest), 'asc' (oldest)

    // ID Name Change State
    const [showEditModal, setShowEditModal] = useState(false);
    const [newIdName, setNewIdName] = useState('');
    const [updatingName, setUpdatingName] = useState(false);

    // Ranking State
    const [rankData, setRankData] = useState(null);
    const [loadingRank, setLoadingRank] = useState(false);

    // Avatar Selection State
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [activeCategory, setActiveCategory] = useState(AVATAR_CATEGORIES[0]);

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

        try {
            setLoading(true);
            const userPredictions = await apiService.getUserPredictions(user.uuid);
            // Sort by timestamp descending to show newest first
            const sortedPredictions = (Array.isArray(userPredictions) ? userPredictions : []).sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            setPredictions(sortedPredictions);

            // Fetch real notifications from backend
            let realNotifications = [];
            try {
                realNotifications = await apiService.getNotifications(user.uuid);
            } catch (e) {
                // Error fetching notifications, ignore
            }

            // Create fake notifications for resolved predictions (legacy/fallback)
            const wonPredictions = (Array.isArray(userPredictions) ? userPredictions : []).filter(p => p.resolved && p.won);
            const predictionNotifs = (Array.isArray(wonPredictions) ? wonPredictions : []).map(p => ({
                id: `pred-${p.id}`,
                type: 'win',
                message: `You won your prediction on ${p.eventName || 'a game'}!`,
                reward: p.exactScore ? '+10 tokens, +5 crowns' : '+5 tokens, +2 crowns',
                timestamp: p.resolvedAt || p.timestamp,
                read: false
            }));

            // Merge and sort
            const allNotifs = [...realNotifications, ...predictionNotifs].sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            setNotifications(allNotifs);

            // Fetch Ranking Data
            setLoadingRank(true);
            try {
                const leaderboard = await apiService.getLeaderboard('all');
                if (leaderboard && leaderboard.userStats) {
                    setRankData(leaderboard.userStats);
                }
            } catch (rankingError) {
                // Error fetching rank, ignore
            } finally {
                setLoadingRank(false);
            }
        } catch (error) {
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
            // Revert on error
            setNotificationsEnabled(!value);
            showAlert('Error', 'Failed to update notification settings');
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
                                    showAlert('Success', 'Biometric login enabled!');
                                } else {
                                    showAlert('Error', 'Failed to enable biometrics');
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

    const handleUpdateAvatar = async (avatar) => {
        if (user?.isGuest) {
            showAlert(
                'Join the Club!',
                'Please create an account to customize your profile and unlock permanent rewards.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Create Account', onPress: () => navigation.navigate('Register') }
                ]
            );
            return;
        }
        if (isUpdatingAvatar) return;

        let avatarId;
        if (typeof avatar === 'string' && avatar.startsWith('preset_')) {
            avatarId = avatar;
        } else {
            // Find preset ID by mapping back from image require
            for (const category in PRESET_AVATARS) {
                const index = PRESET_AVATARS[category].indexOf(avatar);
                if (index !== -1) {
                    avatarId = `preset_${category.toLowerCase()}_${index + 1}`;
                    break;
                }
            }
        }

        if (!avatarId) return;

        setIsUpdatingAvatar(true);
        try {
            await apiService.updateProfile({ profilePicture: avatarId });
            await refreshUser();
            showAlert('Success', 'Avatar updated successfully!');
            blurActiveElement();
            setShowAvatarModal(false);
        } catch (error) {
            showAlert('Error', 'Failed to update avatar. Please try again.');
        } finally {
            setIsUpdatingAvatar(false);
        }
    };

    const handleEquipBadge = async (badge) => {
        if (isUpdatingAvatar) return;
        setIsUpdatingAvatar(true);
        try {
            // Toggle: If clicking already equipped badge, unequip it (set to null)
            const newBadgeId = user?.selectedBadge === badge.id ? null : badge.id;

            await apiService.updateProfile({ selectedBadge: newBadgeId });
            await refreshUser();

            if (newBadgeId) {
                // Auto-close modal for better UX
                setTimeout(() => {
                    blurActiveElement();
                    setShowAvatarModal(false);
                }, 800);
            }
        } catch (error) {
            showAlert('Error', 'Failed to update badge. Please try again.');
        } finally {
            setIsUpdatingAvatar(false);
        }
    };

    const isBadgeUnlocked = (badge) => {
        if (!user || user.isGuest) return false;

        const wins = predictions.filter(p => p.resolved && (p.result?.won || p.won)).length;

        switch (badge.unlockType) {
            case 'predictions':
                return predictions.length >= badge.unlockThreshold;
            case 'wins':
                return wins >= badge.unlockThreshold;
            case 'roomsCreated':
                return user.badges?.includes('🔨 Room Creator') || false;
            case 'referrals':
                return (user.referralCount || 0) >= badge.unlockThreshold;
            case 'crowns':
                return (user.crowns || 0) >= badge.unlockThreshold;
            default:
                return false;
        }
    };

    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: `Join me on Events Arena and get 5 free crowns! Use my code ${user?.referralCode} at signup. Play here: https://www.sportsprophecyapp.com`,
            });
        } catch (error) {
            showAlert('Error', error.message);
        }
    };

    const handleDeleteAccount = async () => {
        const performDelete = async () => {
            try {
                setLoading(true);
                await apiService.deleteAccount(user.uuid);
                showAlert('Account Deleted', 'Your account has been deleted successfully.');
                logout();
            } catch (error) {
                showAlert('Error', 'Failed to delete account. Please try again.');
                setLoading(false);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to permanently delete your account?\n\nThis will permanently delete all your data, including tokens and prediction history. This action cannot be undone.')) {
                if (window.confirm('FINAL WARNING: This action is irreversible. Are you absolutely sure?')) {
                    performDelete();
                }
            }
        } else {
            showAlert(
                'Delete Account',
                'This will permanently delete all your data. This action cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                            showAlert('Final Warning', 'This action is irreversible. Continue?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete Forever', style: 'destructive', onPress: performDelete }
                            ]);
                        }
                    }
                ]
            );
        }
    };

    const handleUpdateIdName = async () => {
        if (user?.isGuest) {
            showAlert(
                'Join the Club!',
                'Please create an account to claim your unique ID Name.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Create Account', onPress: () => navigation.navigate('Register') }
                ]
            );
            return;
        }
        const currentIdName = user?.idName?.trim().toLowerCase();
        const currentUsername = user?.username?.trim().toLowerCase();
        const isFirstTime = !user?.idName || currentIdName === currentUsername;
        const cost = isFirstTime ? 0 : 50;

        if (!newIdName || newIdName.length < 3) {
            showAlert('Invalid Name', 'ID Name must be at least 3 characters long.');
            return;
        }

        if (newIdName.length > 15) {
            showAlert('Invalid Name', 'ID Name cannot exceed 15 characters.');
            return;
        }

        if (cost > 0 && user.tokens < cost) {
            showAlert('Insufficient Tokens', `You need ${cost} tokens to change your ID Name.`);
            return;
        }

        try {
            setUpdatingName(true);
            await apiService.changeIdName(user.uuid, newIdName);
            await refreshUser();
            blurActiveElement();
            setShowEditModal(false);
            setNewIdName('');
            showAlert('Success', 'Your Unique ID Name has been updated!');
        } catch (error) {
            const errorMsg = error.error || error.message || 'Failed to update ID Name.';
            showAlert('Error', errorMsg);
        } finally {
            setUpdatingName(false);
        }
    };

    const totalPredictions = predictions.length;
    const wonPredictions = predictions.filter(p => p.resolved && (p.result?.won || p.won)).length;
    const winRate = totalPredictions > 0 ? Math.round((wonPredictions / totalPredictions) * 100) : 0;

    const filteredPredictions = React.useMemo(() => {
        let result = [...predictions];

        // Filter
        if (activeFilter === 'won') {
            result = result.filter(p => p.resolved && (p.result?.won || p.won));
        } else if (activeFilter === 'lost') {
            result = result.filter(p => p.resolved && !(p.result?.won || p.won));
        } else if (activeFilter === 'pending') {
            result = result.filter(p => !p.resolved);
        }

        // Sort
        result.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [predictions, activeFilter, sortOrder]);

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
                        {/* Profile Header */}
                        <View style={styles.profileHeader}>
                            <View style={styles.avatarWrapper}>
                                <TouchableOpacity onPress={() => setShowAvatarModal(true)}>
                                    <UserAvatar
                                        size={100}
                                        profilePicture={user?.profilePicture}
                                        selectedBadge={user?.selectedBadge}
                                        fallbackName={user?.idName || user?.username}
                                        style={styles.largeAvatar}
                                        customBadgeSize={36}
                                    />
                                    <View style={styles.editIconBadge}>
                                        <Ionicons name="camera" size={16} color={COLORS.text.inverse} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.usernameRow}>
                                <Text style={styles.profileUsername}>{user?.idName || user?.username || 'Guest'}</Text>
                                <TouchableOpacity
                                    onPress={() => setShowEditModal(true)}
                                    style={styles.editNameButton}
                                >
                                    <Ionicons name="pencil-outline" size={16} color={COLORS.accent.cyan} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.joinedRow}>
                                <Text style={styles.joinedText}>
                                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Dec 2025'}
                                </Text>
                                <View style={styles.dotSeparator} />
                                {loadingRank ? (
                                    <ActivityIndicator size="small" color={COLORS.accent.cyan} />
                                ) : rankData?.rank ? (
                                    <Text style={styles.rankBadgeText}>#{rankData.rank} Ranked</Text>
                                ) : rankData?.notEligible ? (
                                    <Text style={[styles.rankBadgeText, { color: COLORS.status.warning, fontSize: 11 }]}>
                                        Need {Math.max(0, (rankData.minNeeded || 100) - (rankData.totalPredictions || 0))} more picks to rank
                                    </Text>
                                ) : (
                                    <Text style={[styles.rankBadgeText, { color: COLORS.text.tertiary }]}>Unranked</Text>
                                )}
                            </View>
                        </View>

                        {/* 2x2 Stats Grid */}
                        <View style={styles.quickStatsContainer}>
                            <Text style={styles.sectionHeading}>📊 QUICK STATS</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.gridBox}>
                                    <View style={styles.gridIconRow}>
                                        <Ionicons name="wallet-outline" size={18} color={COLORS.accent.lime} />
                                        <Text style={styles.gridLabel}>Tokens</Text>
                                    </View>
                                    <Text style={styles.gridValue}>{user?.tokens || 0} 🎫</Text>
                                </View>
                                <View style={styles.gridBox}>
                                    <View style={styles.gridIconRow}>
                                        <Ionicons name="trophy-outline" size={18} color="#FFD700" />
                                        <Text style={styles.gridLabel}>Crowns</Text>
                                    </View>
                                    <Text style={styles.gridValue}>{user?.crowns || 0} 👑</Text>
                                </View>
                                <View style={styles.gridBox}>
                                    <View style={styles.gridIconRow}>
                                        <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.status.success} />
                                        <Text style={styles.gridLabel}>Picks</Text>
                                    </View>
                                    <Text style={styles.gridValue}>{wonPredictions} ✅</Text>
                                </View>
                                <View style={styles.gridBox}>
                                    <View style={styles.gridIconRow}>
                                        <Ionicons name="trending-up-outline" size={18} color={COLORS.accent.cyan} />
                                        <Text style={styles.gridLabel}>Accuracy</Text>
                                    </View>
                                    <Text style={styles.gridValue}>{winRate}% 📈</Text>
                                </View>
                            </View>
                        </View>

                        {/* Badges & Achievements */}
                        <View style={styles.badgesSection}>
                            <Text style={styles.sectionHeading}>🏆 BADGES & ACHIEVEMENTS</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
                                {user?.role === 'admin' && (
                                    <View style={[styles.badgePill, { borderColor: '#fbbf24' }]}>
                                        <Text style={styles.badgeEmoji}>👑</Text>
                                        <Text style={styles.badgeLabel}>Admin</Text>
                                    </View>
                                )}
                                <View style={styles.badgePill}>
                                    <Text style={styles.badgeEmoji}>🎯</Text>
                                    <Text style={styles.badgeLabel}>First Win</Text>
                                </View>
                                <View style={styles.badgePill}>
                                    <Text style={styles.badgeEmoji}>🔥</Text>
                                    <Text style={styles.badgeLabel}>5 Streak</Text>
                                </View>
                                {(Array.isArray(user?.badges) ? user.badges : []).map((badge, idx) => (
                                    <View key={idx} style={styles.badgePill}>
                                        <Text style={styles.badgeLabel}>{badge}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Referral Rewards */}
                        <View style={styles.referralRewardsContainer}>
                            <Text style={styles.sectionHeading}>🎁 REFERRAL REWARDS</Text>
                            <View style={styles.referralInnerCard}>
                                <Text style={styles.referralQuote}>
                                    "Share code <Text style={styles.codeHighlight}>{user?.referralCode || 'LOADING'}</Text> - 5👑 per referral"
                                </Text>
                                <View style={styles.referralActions}>
                                    <TouchableOpacity style={styles.actionButton} onPress={() => { /* Copy Code */ }}>
                                        <Ionicons name="copy-outline" size={18} color={COLORS.text.inverse} />
                                        <Text style={styles.actionButtonText}>Copy Code</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionButton, styles.shareBtn]} onPress={handleShare}>
                                        <Ionicons name="share-outline" size={18} color={COLORS.text.inverse} />
                                        <Text style={styles.actionButtonText}>Share</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Settings Menu */}
                        <View style={styles.settingsMenu}>
                            <Text style={styles.sectionHeading}>⚙️ SETTINGS</Text>

                            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PredictionHistory')}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="time-outline" size={20} color={COLORS.accent.lime} />
                                    <Text style={styles.menuItemText}>Prediction History</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={COLORS.text.tertiary} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="notifications-outline" size={20} color={COLORS.accent.cyan} />
                                    <Text style={styles.menuItemText}>Notifications</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={COLORS.text.tertiary} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HelpSupport')}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="mail-outline" size={20} color={COLORS.accent.purple} />
                                    <Text style={styles.menuItemText}>Help & Support</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={COLORS.text.tertiary} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem} onPress={logout}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="log-out-outline" size={20} color={COLORS.status.error} />
                                    <Text style={[styles.menuItemText, { color: COLORS.status.error }]}>Logout</Text>
                                </View>
                            </TouchableOpacity>
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
                )}
            </ScrollView>

            {/* Edit ID Name Modal */}
            < Modal
                animationType="slide"
                transparent={true}
                visible={showEditModal}
                onRequestClose={() => {
                    blurActiveElement();
                    setShowEditModal(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Change ID Name</Text>
                            <TouchableOpacity onPress={() => {
                                blurActiveElement();
                                setShowEditModal(false);
                            }}>
                                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalDescription}>
                            Choose a new unique ID Name. This will be displayed on the leaderboard and in chat.
                        </Text>

                        {(!user?.idName || user.idName?.trim().toLowerCase() === user?.username?.trim().toLowerCase()) ? (
                            <View style={[styles.costBadge, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]}>
                                <Text style={[styles.costText, { color: COLORS.status.success }]}>1st Time: FREE!</Text>
                                <Ionicons name="sparkles" size={16} color={COLORS.status.success} />
                            </View>
                        ) : (
                            <View style={styles.costBadge}>
                                <Text style={styles.costText}>Cost: 50 Tokens</Text>
                                <Ionicons name="wallet-outline" size={16} color={COLORS.accent.lime} />
                            </View>
                        )}

                        <TextInput
                            style={styles.input}
                            value={newIdName}
                            onChangeText={setNewIdName}
                            placeholder="Enter new ID Name"
                            placeholderTextColor={COLORS.text.tertiary}
                            autoCapitalize="none"
                            maxLength={15}
                        />
                        <Text style={styles.charCount}>
                            {newIdName.length}/15
                        </Text>

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

            {/* Avatar Selection Modal */}
            <Modal
                visible={showAvatarModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    blurActiveElement();
                    setShowAvatarModal(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Avatar</Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoryScroll}
                            contentContainerStyle={styles.categoryContainer}
                        >
                            {(Array.isArray(AVATAR_CATEGORIES) ? AVATAR_CATEGORIES : []).map(category => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryTab,
                                        activeCategory === category && styles.activeTab
                                    ]}
                                    onPress={() => setActiveCategory(category)}
                                >
                                    <Text style={[
                                        styles.categoryTabText,
                                        activeCategory === category && styles.activeTabText
                                    ]}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <ScrollView style={styles.presetsScrollView}>
                            <View style={styles.presetsGrid}>
                                {activeCategory === 'Badges' ? (
                                    (Array.isArray(BADGE_AVATARS) ? BADGE_AVATARS : []).map((badge) => {
                                        const unlocked = isBadgeUnlocked(badge);
                                        const isEquipped = user?.selectedBadge === badge.id;

                                        return (
                                            <TouchableOpacity
                                                key={badge.id}
                                                style={[
                                                    styles.badgeAvatarItem,
                                                    !unlocked && styles.lockedBadgeItem
                                                ]}
                                                onPress={() => {
                                                    if (unlocked) {
                                                        handleEquipBadge(badge);
                                                    } else {
                                                        showAlert('Locked', badge.description);
                                                    }
                                                }}
                                            >
                                                <View style={[!unlocked && styles.grayscaleContainer]}>
                                                    <UserAvatar
                                                        size={60}
                                                        profilePicture={badge}
                                                        style={styles.badgeSelectionAvatar}
                                                    />

                                                    {isEquipped && (
                                                        <View style={styles.equippedBadgeOverlay}>
                                                            <Ionicons name="checkmark-circle" size={18} color={COLORS.status.success} />
                                                        </View>
                                                    )}

                                                    {!unlocked && (
                                                        <View style={styles.lockBadgeOverlay}>
                                                            <Ionicons name="lock-closed" size={12} color="#fff" />
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={[
                                                    styles.badgeAvatarName,
                                                    !unlocked && styles.lockedBadgeText,
                                                    isEquipped && styles.activeTabText
                                                ]}>
                                                    {badge.name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })
                                ) : PRESET_AVATARS[activeCategory]?.length > 0 ? (
                                    (Array.isArray(PRESET_AVATARS[activeCategory]) ? PRESET_AVATARS[activeCategory] : []).map((preset, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.presetItem}
                                            onPress={() => handleUpdateAvatar(preset)}
                                        >
                                            <UserAvatar
                                                size={65}
                                                profilePicture={preset}
                                                style={styles.presetImage}
                                            />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.emptyCategory}>
                                        <Ionicons name="Hourglass-outline" size={32} color={COLORS.text.tertiary} />
                                        <Text style={styles.emptyCategoryText}>Coming Soon!</Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>


                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                blurActiveElement();
                                setShowAvatarModal(false);
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
    },
    content: {
        padding: SPACING.base,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: SPACING.md,
    },
    largeAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.md,
    },
    largeAvatarText: {
        fontSize: 40,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
    },
    editIconBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.accent.cyan,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.background.primary,
    },
    usernameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    profileUsername: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    editNameButton: {
        padding: 4,
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(0, 212, 255, 0.2)',
    },
    joinedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    joinedText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.tertiary,
    },
    dotSeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.text.tertiary,
        opacity: 0.5,
    },
    rankBadgeText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.accent.cyan,
    },

    sectionHeading: {
        fontSize: 12,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.tertiary,
        letterSpacing: 1.5,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.xs,
    },

    quickStatsContainer: {
        marginBottom: SPACING.xl,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridBox: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: COLORS.background.secondary,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
    },
    gridIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    gridLabel: {
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.secondary,
        textTransform: 'uppercase',
    },
    gridValue: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
    },

    badgesSection: {
        marginBottom: SPACING.xl,
    },
    badgesScroll: {
        paddingVertical: 4,
    },
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
        gap: 6,
    },
    badgeEmoji: {
        fontSize: 16,
    },
    badgeLabel: {
        fontSize: 12,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },

    referralRewardsContainer: {
        marginBottom: SPACING.xl,
    },
    referralInnerCard: {
        backgroundColor: COLORS.background.secondary,
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.2)',
        alignItems: 'center',
    },
    referralQuote: {
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.text.primary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
        lineHeight: 24,
    },
    codeHighlight: {
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.accent.cyan,
    },
    referralActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.md,
        gap: 8,
    },
    shareBtn: {
        backgroundColor: COLORS.accent.cyan,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.inverse,
    },

    settingsMenu: {
        marginBottom: SPACING.xxl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemText: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.text.primary,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    modalDescription: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginBottom: 20,
        lineHeight: 20,
    },
    costBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(195, 255, 0, 0.1)',
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 20,
    },
    costText: {
        color: COLORS.accent.lime,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: 12,
    },
    input: {
        backgroundColor: COLORS.background.secondary,
        borderRadius: 8,
        padding: 12,
        color: COLORS.text.primary,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
    },
    saveButton: {
        backgroundColor: COLORS.accent.cyan,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    retryButtonText: {
        color: COLORS.text.inverse,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    presetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        paddingBottom: 10,
    },
    presetsScrollView: {
        maxHeight: 300,
        marginBottom: 20,
    },
    presetItem: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    presetImage: {
        width: '100%',
        height: '100%',
    },
    categoryScroll: {
        marginBottom: 20,
        flexGrow: 0,
    },
    categoryContainer: {
        paddingHorizontal: 5,
        gap: 10,
    },
    categoryTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activeTab: {
        backgroundColor: COLORS.accent.cyan,
        borderColor: COLORS.accent.cyan,
    },
    categoryTabText: {
        color: COLORS.text.secondary,
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.text.inverse,
    },
    emptyCategory: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        width: '100%',
    },
    emptyCategoryText: {
        color: COLORS.text.tertiary,
        marginTop: 10,
        fontSize: 14,
    },
    galleryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
    },
    galleryButtonText: {
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    deleteButton: {
        alignSelf: 'center',
        marginTop: 20,
    },
    deleteButtonText: {
        color: COLORS.status.error,
        fontSize: 12,
        fontWeight: TYPOGRAPHY.weights.bold,
        opacity: 0.6,
    },
    // Badge Avatar Styles
    badgeAvatarItem: {
        width: 85,
        alignItems: 'center',
        marginBottom: 15,
        gap: 6,
    },
    badgeSelectionAvatar: {
        marginBottom: 5,
    },
    grayscaleContainer: {
        opacity: 0.6,
    },
    lockBadgeOverlay: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: COLORS.status.error,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.background.card,
        zIndex: 10,
    },
    equippedBadgeOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.background.card,
        borderRadius: 12,
        zIndex: 10,
    },
    badgeAvatarName: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.text.primary,
        textAlign: 'center',
    },
    lockedBadgeItem: {
        opacity: 0.8,
    },
    lockedBadgeText: {
        color: COLORS.text.tertiary,
    },
    charCount: {
        alignSelf: 'flex-end',
        color: COLORS.text.tertiary,
        fontSize: 12,
        marginTop: -15,
        marginBottom: 20,
        marginRight: 5,
    },
});

export default ProfileScreen;
