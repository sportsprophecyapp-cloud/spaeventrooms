import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const LeagueScreen = () => {
    const navigation = useNavigation();
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('my_leagues'); // 'my_leagues', 'create', 'join'
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Create League State
    const [newLeagueName, setNewLeagueName] = useState('');
    const [entryFee, setEntryFee] = useState('50');
    const [creating, setCreating] = useState(false);

    // Join League State
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);

    // Selected League Detail State
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [leagueLeaderboard, setLeagueLeaderboard] = useState([]);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUserLeagues();
        }
    }, [user]);

    const fetchUserLeagues = async () => {
        try {
            setLoading(true);
            const data = await apiService.getUserLeagues(user.uuid);
            setLeagues(data || []);
        } catch (error) {
            console.error('Error fetching leagues:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserLeagues();
        setRefreshing(false);
    };

    const handleCreateLeague = async () => {
        if (!newLeagueName.trim()) {
            Alert.alert('Error', 'Please enter a league name');
            return;
        }
        const fee = parseInt(entryFee);
        if (isNaN(fee) || fee < 0) {
            Alert.alert('Error', 'Invalid entry fee');
            return;
        }

        if (user.tokens < fee) {
            Alert.alert('Insufficient Tokens', `You need ${fee} tokens to create this league.`);
            return;
        }

        try {
            setCreating(true);
            const result = await apiService.createLeague(user.uuid, newLeagueName, fee);
            Alert.alert('Success', `League "${result.league.name}" created! Code: ${result.league.code}`);
            setNewLeagueName('');
            setEntryFee('50');
            setActiveTab('my_leagues');
            await fetchUserLeagues();
            await refreshUser();
        } catch (error) {
            Alert.alert('Error', error.error || 'Failed to create league');
        } finally {
            setCreating(false);
        }
    };

    const handleJoinLeague = async () => {
        if (!joinCode.trim() || joinCode.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-character code');
            return;
        }

        try {
            setJoining(true);
            const result = await apiService.joinLeague(user.uuid, joinCode);
            Alert.alert('Success', `Joined league "${result.league.name}"!`);
            setJoinCode('');
            setActiveTab('my_leagues');
            await fetchUserLeagues();
            await refreshUser();
        } catch (error) {
            Alert.alert('Error', error.error || 'Failed to join league');
        } finally {
            setJoining(false);
        }
    };

    const openLeagueDetails = async (code) => {
        setDetailModalVisible(true);
        setLoadingDetails(true);
        try {
            const data = await apiService.getLeagueDetails(code);
            setSelectedLeague(data.league);
            setLeagueLeaderboard(data.leaderboard);
        } catch (error) {
            Alert.alert('Error', 'Failed to load league details');
            setDetailModalVisible(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const renderMyLeagues = () => (
        <ScrollView
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent.cyan} />}
        >
            {leagues.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="trophy-outline" size={64} color={COLORS.text.tertiary} />
                    <Text style={styles.emptyText}>You haven't joined any leagues yet.</Text>
                    <TouchableOpacity style={styles.ctaButton} onPress={() => setActiveTab('create')}>
                        <Text style={styles.ctaButtonText}>Create a League</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                (leagues || []).map((league) => (
                    <TouchableOpacity
                        key={league._id}
                        style={styles.leagueCard}
                        onPress={() => openLeagueDetails(league.code)}
                    >
                        <LinearGradient
                            colors={COLORS.gradients.card}
                            style={styles.leagueCardGradient}
                        >
                            <View style={styles.leagueHeader}>
                                <Text style={styles.leagueName}>{league.name}</Text>
                                <View style={styles.prizeBadge}>
                                    <Ionicons name="wallet" size={14} color={COLORS.accent.lime} />
                                    <Text style={styles.prizeText}>{league.prizePool}</Text>
                                </View>
                            </View>
                            <View style={styles.leagueFooter}>
                                <Text style={styles.leagueCode}>Code: {league.code}</Text>
                                <Text style={styles.memberCount}>
                                    <Ionicons name="people" size={14} color={COLORS.text.secondary} /> {league.participants.length}
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );

    const renderCreateLeague = () => (
        <ScrollView contentContainerStyle={styles.formContent}>
            <Text style={styles.formTitle}>Create Your League</Text>
            <Text style={styles.formSubtitle}>Host your own prediction contest. You set the rules.</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>League Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Office Pool 2025"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={newLeagueName}
                    onChangeText={setNewLeagueName}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Entry Fee (Tokens)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="50"
                    placeholderTextColor={COLORS.text.tertiary}
                    keyboardType="numeric"
                    value={entryFee}
                    onChangeText={setEntryFee}
                />
                <Text style={styles.helperText}>100% of fees go into the prize pool.</Text>
            </View>

            <View style={styles.costSummary}>
                <Text style={styles.costLabel}>Your Cost:</Text>
                <Text style={styles.costValue}>{entryFee || 0} Tokens</Text>
            </View>

            <TouchableOpacity
                style={[styles.actionButton, creating && styles.disabledButton]}
                onPress={handleCreateLeague}
                disabled={creating}
            >
                {creating ? <ActivityIndicator color={COLORS.text.inverse} /> : <Text style={styles.actionButtonText}>Create League</Text>}
            </TouchableOpacity>
        </ScrollView>
    );

    const renderJoinLeague = () => (
        <ScrollView contentContainerStyle={styles.formContent}>
            <Text style={styles.formTitle}>Join a League</Text>
            <Text style={styles.formSubtitle}>Enter the 6-character code shared by the league creator.</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>League Code</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. X7Y2Z9"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={joinCode}
                    onChangeText={(text) => setJoinCode(text.toUpperCase())}
                    maxLength={6}
                    autoCapitalize="characters"
                />
            </View>

            <TouchableOpacity
                style={[styles.actionButton, joining && styles.disabledButton]}
                onPress={handleJoinLeague}
                disabled={joining}
            >
                {joining ? <ActivityIndicator color={COLORS.text.inverse} /> : <Text style={styles.actionButtonText}>Join League</Text>}
            </TouchableOpacity>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Private Leagues</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'my_leagues' && styles.activeTab]}
                    onPress={() => setActiveTab('my_leagues')}
                >
                    <Text style={[styles.tabText, activeTab === 'my_leagues' && styles.activeTabText]}>My Leagues</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'create' && styles.activeTab]}
                    onPress={() => setActiveTab('create')}
                >
                    <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'join' && styles.activeTab]}
                    onPress={() => setActiveTab('join')}
                >
                    <Text style={[styles.tabText, activeTab === 'join' && styles.activeTabText]}>Join</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {activeTab === 'my_leagues' && renderMyLeagues()}
                {activeTab === 'create' && renderCreateLeague()}
                {activeTab === 'join' && renderJoinLeague()}
            </View>

            {/* League Detail Modal */}
            <Modal
                animationType="slide"
                visible={detailModalVisible}
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={COLORS.text.primary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{selectedLeague?.name || 'League Details'}</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {loadingDetails ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.accent.cyan} />
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            <View style={styles.detailCard}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Prize Pool</Text>
                                    <Text style={styles.detailValue}>{selectedLeague?.prizePool} Tokens</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Entry Fee</Text>
                                    <Text style={styles.detailValue}>{selectedLeague?.entryFee} Tokens</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Code</Text>
                                    <Text style={[styles.detailValue, { letterSpacing: 2 }]}>{selectedLeague?.code}</Text>
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Leaderboard</Text>
                            {(leagueLeaderboard || []).map((player, index) => (
                                <View key={player.uuid} style={styles.leaderboardRow}>
                                    <Text style={styles.rank}>#{index + 1}</Text>
                                    <View style={styles.playerInfo}>
                                        <Text style={styles.playerName}>{player.idName || player.username}</Text>
                                        <View style={styles.badges}>
                                            {player.badges?.includes('👑 Admin') && <Text>👑</Text>}
                                        </View>
                                    </View>
                                    <View style={styles.playerStats}>
                                        <Text style={styles.crowns}>{player.crowns} 👑</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </SafeAreaView>
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
        backgroundColor: COLORS.background.secondary,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    backButton: {
        padding: SPACING.xs,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.secondary,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.accent.cyan,
    },
    tabText: {
        color: COLORS.text.secondary,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    activeTabText: {
        color: COLORS.accent.cyan,
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: SPACING.lg,
    },
    formContent: {
        padding: SPACING.xl,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: SPACING.xxxl,
    },
    emptyText: {
        color: COLORS.text.secondary,
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
        fontSize: TYPOGRAPHY.sizes.base,
    },
    ctaButton: {
        backgroundColor: COLORS.accent.cyan,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    ctaButtonText: {
        color: COLORS.text.inverse,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    leagueCard: {
        marginBottom: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    leagueCardGradient: {
        padding: SPACING.lg,
    },
    leagueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    leagueName: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    prizeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(132, 204, 22, 0.2)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
    },
    prizeText: {
        color: COLORS.accent.lime,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    leagueFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leagueCode: {
        color: COLORS.text.tertiary,
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    memberCount: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    formTitle: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    formSubtitle: {
        color: COLORS.text.secondary,
        marginBottom: SPACING.xl,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    input: {
        backgroundColor: COLORS.background.secondary,
        color: COLORS.text.primary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border.primary,
        fontSize: TYPOGRAPHY.sizes.lg,
    },
    helperText: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.xs,
        marginTop: SPACING.xs,
    },
    costSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.xl,
    },
    costLabel: {
        color: COLORS.text.secondary,
    },
    costValue: {
        color: COLORS.accent.lime,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.lg,
    },
    actionButton: {
        backgroundColor: COLORS.accent.cyan,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    actionButtonText: {
        color: COLORS.text.inverse,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.lg,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.primary,
    },
    modalTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        padding: SPACING.lg,
    },
    detailCard: {
        backgroundColor: COLORS.background.secondary,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    detailLabel: {
        color: COLORS.text.secondary,
    },
    detailValue: {
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.md,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.secondary,
    },
    rank: {
        width: 30,
        color: COLORS.accent.cyan,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    playerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    playerName: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.base,
    },
    playerStats: {
        alignItems: 'flex-end',
    },
    crowns: {
        color: '#FFD700',
        fontWeight: TYPOGRAPHY.weights.bold,
    },
});

export default LeagueScreen;
