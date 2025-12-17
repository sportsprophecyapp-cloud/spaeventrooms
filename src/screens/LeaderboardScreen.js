import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SponsorBanner from '../components/SponsorBanner';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

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

    const renderHeader = () => (
        <View style={styles.listHeader}>
            <View style={styles.infoRow}>
                <Text style={styles.listTitle}>Top Predictors</Text>
                <TouchableOpacity onPress={() => setShowInfo(true)} style={styles.infoButton}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.text.secondary} />
                </TouchableOpacity>
            </View>
            <SponsorBanner style={styles.sponsorBanner} />
        </View>
    );

    const renderItem = ({ item }) => {
        const isTopThree = item.rank <= 3;
        const ItemWrapper = isTopThree ? LinearGradient : View;
        const wrapperProps = isTopThree ? {
            colors: item.rank === 1
                ? ['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']
                : item.rank === 2
                    ? ['rgba(148, 163, 184, 0.15)', 'rgba(148, 163, 184, 0.05)']
                    : ['rgba(180, 83, 9, 0.15)', 'rgba(180, 83, 9, 0.05)'],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
            style: [styles.itemContainer, isTopThree && styles.topThreeItem]
        } : { style: styles.itemContainer };

        // Highlight current user
        const isMe = user?.uuid === item.id;
        if (isMe && !wrapperProps.style) {
            wrapperProps.style = [styles.itemContainer, styles.currentUserItem];
        } else if (isMe) {
            wrapperProps.style.push(styles.currentUserItem);
        }

        return (
            <ItemWrapper {...wrapperProps}>
                <View style={styles.rankContainer}>
                    {item.rank <= 3 ? (
                        <MaterialCommunityIcons
                            name="crown"
                            size={28}
                            color={item.rank === 1 ? '#fbbf24' : item.rank === 2 ? '#94a3b8' : '#b45309'}
                        />
                    ) : (
                        <Text style={[styles.rankText, isMe && styles.currentUserText]}>{item.rank}</Text>
                    )}
                </View>

                <View style={styles.userContainer}>
                    <Text style={[styles.username, isMe && styles.currentUserText]}>
                        {isMe ? 'You' : item.username}
                    </Text>
                    <View style={styles.secondaryStats}>
                        <View style={styles.statBadge}>
                            <Text style={styles.statLabel}>{item.correctPredictions}/{item.totalPredictions || '?'}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.scoreContainer, isMe && styles.currentUserScore]}>
                    <Text style={[styles.score, isMe && styles.currentUserText]}>
                        {formatAccuracy(item.accuracy)}
                    </Text>
                    {renderConfidence(item.confidenceTier)}
                </View>
            </ItemWrapper>
        );
    };

    // Determine if we need to show sticky user footer
    // Show if: User is logged in, User Stats exist, AND User is NOT in the visible leaderboard list
    const showStickyFooter = user && userStats && (!userStats.rank || !leaderboardData.find(u => u.id === user.uuid));

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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
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
                    data={leaderboardData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent.cyan} />
                    }
                />
            )}

            {/* Sticky User Footer */}
            {showStickyFooter && (
                <View style={styles.stickyFooter}>
                    <View style={styles.stickyContent}>
                        <View style={styles.rankContainer}>
                            <Text style={styles.rankText}>{userStats.rank || '-'}</Text>
                        </View>
                        <View style={styles.userContainer}>
                            <Text style={styles.username}>You</Text>
                            {userStats.notEligible ? (
                                <Text style={styles.eligibilityText}>
                                    Need {Math.max(0, (config?.min || 0) - (userStats.totalPredictions || 0))} more picks
                                </Text>
                            ) : (
                                <Text style={styles.statLabel}>
                                    {userStats.correctPredictions}/{userStats.totalPredictions}
                                </Text>
                            )}
                        </View>
                        <View style={styles.scoreContainer}>
                            <Text style={styles.score}>
                                {formatAccuracy(userStats.accuracy)}
                            </Text>
                            {renderConfidence(userStats.confidenceTier)}
                        </View>
                    </View>
                </View>
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
        paddingBottom: 100, // Space for sticky footer
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
        borderWidth: 1, // Reduced/Simplified
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
    userContainer: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    username: {
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.weights.bold,
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
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.weights.black,
        fontSize: TYPOGRAPHY.sizes.lg,
    },
    currentUserScore: {
        // logic handled in text color usually
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
    // Sticky Footer
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background.secondary,
        borderTopWidth: 1,
        borderTopColor: COLORS.accent.cyan,
        padding: SPACING.base,
        ...SHADOWS.lg,
    },
    stickyContent: {
        flexDirection: 'row',
        alignItems: 'center',
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
    }
});

export default LeaderboardScreen;
