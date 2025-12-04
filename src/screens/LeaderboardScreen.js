import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';

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
            setLeaderboardData(data.leaderboard || []);
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
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    listContent: {
        padding: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    topThreeItem: {
        borderWidth: 2,
        borderColor: 'rgba(56, 189, 248, 0.3)',
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        color: '#94a3b8',
        fontWeight: 'bold',
        fontSize: 16,
    },
    userContainer: {
        flex: 1,
        marginLeft: 10,
    },
    username: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    tokens: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '500',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    score: {
        color: '#38bdf8',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#94a3b8',
        marginTop: 15,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtext: {
        color: '#64748b',
        fontSize: 14,
        marginTop: 8,
    },
});

export default LeaderboardScreen;
