import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SponsorBanner from '../components/SponsorBanner';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import TooltipIconButton from '../components/TooltipIconButton';
import UserAvatar from '../components/UserAvatar';

const LeaderboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeframe, setTimeframe] = useState('all');
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        fetchLeaderboard();
    }, [timeframe]);

    const fetchLeaderboard = async () => {
        if (!refreshing) setLoading(true);
        try {
            const data = await apiService.getLeaderboard(timeframe);
            if (data && data.leaderboard) {
                setLeaderboardData(data.leaderboard);
                setUserStats(data.userStats);
                setConfig(data.config);
            } else if (Array.isArray(data)) {
                // Fallback for old API structure if any
                setLeaderboardData(data);
                setUserStats(null);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeaderboard();
    };

    const formatAccuracy = (acc) => {
        return `${Math.floor((acc || 0) * 100)}%`;
    };

    const renderConfidence = (tier) => {
        // High = 3 filled (Gold/Green), Medium = 2 filled (Cyan), Low = 1 filled (Grey)
        let color = COLORS.text.tertiary;
        let count = 1;

        if (tier === 'High') {
            color = '#fbbf24'; // Gold
            count = 3;
        } else if (tier === 'Medium') {
            color = COLORS.accent.cyan;
            count = 2;
        }

        return (
            <View style={{ flexDirection: 'row', gap: 2, marginLeft: 6 }}>
                {[1, 2, 3].map((i) => (
                    <View
                        key={i}
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: i <= count ? color : 'rgba(255,255,255,0.1)'
                        }}
                    />
                ))}
            </View>
        );
    };

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {['Weekly', 'Monthly', 'All-Time'].map((tab) => {
                const value = tab === 'All-Time' ? 'all' : tab.toLowerCase();
                const isActive = timeframe === value;
                return (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, isActive && styles.activeTab]}
                        onPress={() => setTimeframe(value)}
                    >
                        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderUserRankCard = () => {
        if (!user || !userStats) return null;

        return (
            <LinearGradient
                colors={['#A855F7', '#3B82F6']} // Purple to Blue
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.userRankCard}
            >
                <View style={styles.userRankLeft}>
                    <Text style={styles.userRankLabel}>YOUR RANK</Text>
                    <Text style={styles.userRankValue}>#{userStats.rank || '—'}</Text>
                    <Text style={styles.userRankPercentile}>Top {userStats.percentile || '50'}% of players</Text>
                </View>
                <View style={styles.userRankRight}>
                    <View style={styles.userRankStat}>
                        <Text style={styles.userRankStatValue}>{formatAccuracy(userStats.accuracy)}</Text>
                        <Text style={styles.userRankStatLabel}>Win Rate</Text>
                    </View>
                    <View style={styles.userRankStat}>
                        <Text style={styles.userRankStatValue}>{userStats.correctPredictions || 0}</Text>
                        <Text style={styles.userRankStatLabel}>Wins</Text>
                    </View>
                </View>
            </LinearGradient>
        );
    };

    const renderHeader = () => {
        // Dynamic Requirement Text
        let reqText = "Need 100 predictions to rank";
        if (timeframe === 'weekly') reqText = "Need 5 predictions this week to rank";
        if (timeframe === 'monthly') reqText = "Need 20 predictions this month to rank";

        return (
            <View style={styles.listHeader}>
                {renderUserRankCard()}

                <View style={styles.infoRow}>
                    <Text style={styles.listTitle}>Top Predictors</Text>
                    <TooltipIconButton
                        iconName="information-circle-outline"
                        size={20}
                        color={COLORS.text.secondary}
                        onPress={() => setShowInfo(true)}
                        tooltip="Ranking Info"
                        style={styles.infoButton}
                    />
                </View>
                {/* Persistent Requirement Banner */}
                <View style={styles.requirementBanner}>
                    <Ionicons name="school-outline" size={14} color={COLORS.accent.cyan} />
                    <Text style={styles.requirementText}>{reqText}</Text>
                </View>
                <SponsorBanner style={styles.sponsorBanner} />
            </View>
        );
    };

    const renderItem = ({ item }) => {
        const isTopThree = item.rank <= 3;
        const ItemWrapper = isTopThree ? LinearGradient : View;

        let colors = [];
        if (item.rank === 1) colors = ['#FCD34D', '#F59E0B']; // Gold
        else if (item.rank === 2) colors = ['#E5E7EB', '#9CA3AF']; // Silver
        else if (item.rank === 3) colors = ['#FDBA74', '#C2410C']; // Bronze

        const wrapperProps = isTopThree ? {
            colors: colors,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
            style: [styles.itemContainer, styles.topThreeItem]
        } : { style: styles.itemContainer };

        // Highlight current user if found in list
        const isMe = user?.uuid === item.id;
        if (isMe && !wrapperProps.style) {
            wrapperProps.style = [styles.itemContainer, styles.currentUserItem];
        } else if (isMe && !isTopThree) {
            wrapperProps.style.push(styles.currentUserItem);
        }

        const textColor = isTopThree ? '#FFF' : COLORS.text.primary;
        const rankColor = isTopThree ? '#FFF' : COLORS.text.secondary;

        return (
            <ItemWrapper {...wrapperProps}>
                <View style={styles.rankContainer}>
                    {item.rank <= 3 ? (
                        <Text style={[styles.rankEmoji]}>{item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}</Text>
                    ) : (
                        <Text style={[styles.rankText, isMe && styles.currentUserText]}>{item.rank}</Text>
                    )}
                </View>

                <View style={[styles.avatarContainer, { marginRight: 10 }]}>
                    <UserAvatar
                        size={isTopThree ? 48 : 32}
                        profilePicture={item.avatar}
                        selectedBadge={item.selectedBadge}
                        fallbackName={item.username}
                        borderColor={isTopThree ? '#FFF' : undefined}
                    />
                </View>

                <View style={styles.userContainer}>
                    <Text style={[styles.username, { color: textColor, fontWeight: isTopThree ? 'bold' : '600' }]}>
                        {isMe ? 'You' : item.username}
                    </Text>
                    <View style={styles.secondaryStats}>
                        <View style={[styles.statBadge, isTopThree && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <Text style={[styles.statLabel, isTopThree && { color: '#FFF' }]}>{item.correctPredictions}/{item.totalPredictions || '?'}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.scoreContainer, isMe && styles.currentUserScore]}>
                    <Text style={[styles.score, { color: textColor }]}>
                        {formatAccuracy(item.accuracy)}
                    </Text>
                    {!isTopThree && renderConfidence(item.confidenceTier)}
                </View>
            </ItemWrapper>
        );
    };

    if (loading && !refreshing && leaderboardData.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Leaderboard</Text>
                    <View style={{ width: 24 }} />
                </View>
                {renderTabs()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.accent.cyan} />
                    <Text style={styles.loadingText}>Loading leaderboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Gradient */}
            <View style={styles.header}>
                <TooltipIconButton
                    iconName="arrow-back"
                    size={24}
                    color={COLORS.text.primary}
                    onPress={() => navigation.goBack()}
                    tooltip="Go Back"
                    style={styles.backButton}
                />
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <View style={{ width: 24 }} />
            </View>

            {renderTabs()}

            {leaderboardData.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <SponsorBanner style={styles.sponsorBanner} />
                    <View style={styles.emptyContent}>
                        <Ionicons name="trophy-outline" size={64} color={COLORS.text.tertiary} />
                        <Text style={styles.emptyText}>No ranked players yet!</Text>
                        <Text style={styles.emptySubtext}>
                            {config ? `Need ${config.min} predictions to qualify.` : 'Be the first to qualify!'}
                        </Text>
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.ctaButtonText}>Make Your First Prediction</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={(Array.isArray(leaderboardData) ? leaderboardData : [])}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent.cyan} />
                    }
                />
            )}

            {/* Info Modal */}
            <Modal
                transparent={true}
                visible={showInfo}
                animationType="fade"
                onRequestClose={() => setShowInfo(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowInfo(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="information-circle" size={24} color={COLORS.accent.cyan} />
                            <Text style={styles.modalTitle}>Ranking System</Text>
                        </View>
                        <Text style={styles.modalText}>
                            Rankings are based on prediction accuracy and consistency.
                        </Text>

                        <View style={styles.confidenceLegend}>
                            <Text style={styles.legendTitle}>Confidence Tiers:</Text>
                            <View style={styles.legendItem}>
                                <View style={{ flexDirection: 'row', gap: 2 }}>
                                    {[1, 2, 3].map(i => <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fbbf24' }} />)}
                                </View>
                                <Text style={styles.legendText}>High Volume (Trusted)</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={{ flexDirection: 'row', gap: 2 }}>
                                    {[1, 2, 3].map(i => <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i <= 2 ? COLORS.accent.cyan : 'rgba(255,255,255,0.1)' }} />)}
                                </View>
                                <Text style={styles.legendText}>Medium Volume</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={{ flexDirection: 'row', gap: 2 }}>
                                    {[1, 2, 3].map(i => <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i <= 1 ? COLORS.text.tertiary : 'rgba(255,255,255,0.1)' }} />)}
                                </View>
                                <Text style={styles.legendText}>Low Volume (Just Qualified)</Text>
                            </View>
                        </View>

                        {config && (
                            <View style={styles.configBox}>
                                <Text style={styles.configTitle}>{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Requirements:</Text>
                                <Text style={styles.configText}>• Minimum {config.min} predictions to qualify</Text>
                                <Text style={styles.configText}>• Full weight at {config.target} predictions</Text>
                            </View>
                        )}
                        <TouchableOpacity onPress={() => setShowInfo(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

        </SafeAreaView>
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
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    listContent: {
        paddingHorizontal: SPACING.base,
        paddingBottom: 40,
    },
    listHeader: {
        marginBottom: SPACING.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
    },
    listTitle: {
        color: COLORS.text.secondary,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoButton: {
        padding: 4,
    },
    // User Rank Card
    userRankCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userRankLeft: {
        flex: 1,
    },
    userRankLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    userRankValue: {
        color: '#FFF',
        fontSize: 40,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    userRankPercentile: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
    },
    userRankRight: {
        alignItems: 'flex-end',
        gap: 12,
    },
    userRankStat: {
        alignItems: 'flex-end',
    },
    userRankStatValue: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userRankStatLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        padding: SPACING.base,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    currentUserItem: {
        borderColor: COLORS.accent.cyan,
        backgroundColor: 'rgba(0, 212, 255, 0.05)',
    },
    topThreeItem: {
        borderWidth: 0,
        paddingVertical: 20,
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        color: COLORS.text.secondary,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.md,
    },
    rankEmoji: {
        fontSize: 24,
    },
    userContainer: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    username: {
        fontSize: TYPOGRAPHY.sizes.base,
    },
    currentUserText: {
        color: COLORS.accent.cyan,
    },
    secondaryStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statBadge: {
        backgroundColor: COLORS.background.tertiary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statLabel: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    scoreContainer: {
        alignItems: 'flex-end',
        minWidth: 60,
    },
    score: {
        fontWeight: TYPOGRAPHY.weights.black,
        fontSize: TYPOGRAPHY.sizes.lg,
    },
    currentUserScore: {
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.text.secondary,
        marginTop: SPACING.base,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    emptyContainer: {
        flex: 1,
    },
    emptyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxxl,
    },
    emptyText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginTop: SPACING.lg,
    },
    emptySubtext: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.sm,
        marginTop: SPACING.sm,
    },
    sponsorBanner: {
        marginBottom: SPACING.md,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
        gap: SPACING.sm,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    activeTab: {
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        borderColor: COLORS.accent.cyan,
    },
    tabText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    activeTabText: {
        color: COLORS.accent.cyan,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    eligibilityText: {
        color: COLORS.status.warning,
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalContent: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        gap: SPACING.sm,
    },
    modalTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    modalText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.base,
        lineHeight: 22,
        marginBottom: SPACING.sm,
    },
    configBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.md,
    },
    configTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.xs,
    },
    configText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        marginBottom: 2,
    },
    closeButton: {
        marginTop: SPACING.lg,
        backgroundColor: COLORS.accent.cyan,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    closeButtonText: {
        color: COLORS.text.inverse,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    // New Styles
    confidenceLegend: {
        marginBottom: SPACING.md,
        gap: 8,
    },
    legendTitle: {
        color: COLORS.text.secondary,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.sm,
        marginBottom: 4,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    legendText: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    ctaButton: {
        marginTop: SPACING.xl,
        backgroundColor: COLORS.accent.cyan,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
    },
    ctaButtonText: {
        color: COLORS.text.inverse,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.base,
    },
    requirementBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(6, 182, 212, 0.1)', // Light Cyan
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(6, 182, 212, 0.2)',
    },
    requirementText: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.medium,
    }
});

export default LeaderboardScreen;
