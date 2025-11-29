import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LeaderboardScreen = ({ navigation }) => {
    // Mock data for now, or fetch from API if available
    const leaderboardData = [
        { id: '1', rank: 1, username: 'CryptoKing', crowns: 150, tokens: 5000 },
        { id: '2', rank: 2, username: 'SportsGuru', crowns: 120, tokens: 4200 },
        { id: '3', rank: 3, username: 'BetMaster', crowns: 95, tokens: 3800 },
        { id: '4', rank: 4, username: 'LuckyStrike', crowns: 80, tokens: 3100 },
        { id: '5', rank: 5, username: 'PredictionPro', crowns: 65, tokens: 2500 },
    ];

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
                    <Text style={styles.tokens}>{item.tokens} Tokens</Text>
                </View>

                <View style={styles.scoreContainer}>
                    <Text style={styles.score}>{item.crowns}</Text>
                    <MaterialCommunityIcons name="crown" size={16} color="#38bdf8" />
                </View>
            </ItemWrapper>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Back Button" testID="leaderboard-back-button">
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={leaderboardData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
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
    tokens: {
        color: '#64748b',
        fontSize: 12,
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
});

export default LeaderboardScreen;
