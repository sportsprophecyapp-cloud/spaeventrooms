import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SponsorBanner from '../components/SponsorBanner';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const LeaderboardScreen = ({ navigation }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const data = await apiService.getLeaderboard();
            // API returns an array on success, but the error handler returns { leaderboard: [] }
            if (Array.isArray(data)) {
                setLeaderboardData(data);
            } else {
                setLeaderboardData(data.leaderboard || []);
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
                        <Text style={styles.rankText}>{item.rank}</Text>
                    )}
                </View>

                <View style={styles.userContainer}>
                    <Text style={styles.username}>{item.username}</Text>
                    <View style={styles.secondaryStats}>
                        <MaterialCommunityIcons name="crown" size={14} color="#FFD700" />
                        <Text style={styles.tokens}>{item.crowns} Crowns</Text>
                    </View>
                </View>

                <View style={styles.scoreContainer}>
                    <Text style={styles.score}>{item.correctPredictions}</Text>
                    <Ionicons name="checkmark-circle" size={16} color="#38bdf8" />
                </View>
            </ItemWrapper>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Leaderboard</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#38bdf8" />
                    <Text style={styles.loadingText}>Loading leaderboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Back Button" testID="leaderboard-back-button">
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <View style={{ width: 24 }} />
            </View>

            <SponsorBanner style={styles.sponsorBanner} />

            {leaderboardData.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="trophy-outline" size={64} color="#64748b" />
                    <Text style={styles.emptyText}>No players yet!</Text>
                    <Text style={styles.emptySubtext}>Be the first to win a prediction!</Text>
                </View>
            ) : (
                <FlatList
                    data={leaderboardData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent.cyan} />
                    }
                />
            )}
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
        padding: SPACING.lg,
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
    topThreeItem: {
        borderWidth: 2,
        borderColor: COLORS.accent.cyan,
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
    secondaryStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    tokens: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.md,
    },
    score: {
        color: COLORS.accent.cyan,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.base,
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
        marginTop: SPACING.md,
        marginBottom: SPACING.xs,
        marginHorizontal: SPACING.lg,
    },
});

export default LeaderboardScreen;
