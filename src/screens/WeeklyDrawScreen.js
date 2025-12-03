import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const SAMPLE_DRAWS = [
    {
        id: 4,
        sponsor: 'Sports Prophecy',
        prize: 'Beta Testers Draw',
        description: 'Exclusive draw for all registered users who make predictions in December. GOOD LUCK TO ALL!',
        entries: 0,
        cost: 1,
        colors: ['#064e3b', '#065f46'],
        accent: '#34d399',
        icon: 'rocket-launch-outline',
        daysLeft: 35, // Approx days until Jan 6th
        isReal: true
    },
    {
        id: 1,
        sponsor: 'Your Brand Here',
        prize: 'Sponsor This Draw',
        description: 'Sponsors donate a prize and this ad is yours. Contact us to feature your brand here!',
        entries: 0,
        cost: 0,
        colors: ['#1e293b', '#334155'],
        accent: '#94a3b8',
        icon: 'gift-outline',
        daysLeft: 7,
        isReal: false
    },
    {
        id: 2,
        sponsor: 'Your Brand Here',
        prize: 'Sponsor This Draw',
        description: 'Sponsors donate a prize and this ad is yours. Reach thousands of sports fans.',
        entries: 0,
        cost: 0,
        colors: ['#1e293b', '#334155'],
        accent: '#94a3b8',
        icon: 'bullhorn-outline',
        daysLeft: 14,
        isReal: false
    },
    {
        id: 3,
        sponsor: 'Your Brand Here',
        prize: 'Sponsor This Draw',
        description: 'Sponsors donate a prize and this ad is yours. High visibility placement available.',
        entries: 0,
        cost: 0,
        colors: ['#1e293b', '#334155'],
        accent: '#94a3b8',
        icon: 'star-outline',
        daysLeft: 21,
        isReal: false
    }
];

const WeeklyDrawScreen = ({ navigation }) => {
    const { user, refreshUser, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalEntries: 0 });
    const [enteredDraws, setEnteredDraws] = useState([]);
    const [pendingConfirmation, setPendingConfirmation] = useState(null);

    useEffect(() => {
        const init = async () => {
            await refreshUser();
            fetchStats();
            loadEnteredDraws();
        };
        init();
    }, []);

    const loadEnteredDraws = async () => {
        if (!user) return;
        try {
            const savedDraws = await AsyncStorage.getItem(`user_entered_draws_${user.uuid}`);
            if (savedDraws) {
                setEnteredDraws(JSON.parse(savedDraws));
            }
        } catch (error) {
            console.error('Failed to load entered draws', error);
        }
    };

    const fetchStats = async () => {
        const data = await apiService.getWeeklyDrawStats();
        setStats(data);
    };

    const handleEnterDraw = async (drawId, cost) => {
        console.log('handleEnterDraw called!', { drawId, cost, pendingConfirmation, userCrowns: user?.crowns });

        // First click: Set pending confirmation
        if (pendingConfirmation !== drawId) {
            console.log('Setting pending confirmation for draw:', drawId);
            setPendingConfirmation(drawId);
            return;
        }

        // Second click: Proceed with entry
        console.log('Proceeding with entry for draw:', drawId);
        if (!user || user.crowns < cost) {
            console.log('Insufficient crowns!', { userCrowns: user?.crowns, cost });
            Alert.alert('Insufficient Crowns', `You need at least ${cost} crowns to enter this draw.`);
            setPendingConfirmation(null);
            return;
        }

        setLoading(true);
        try {
            console.log('Submitting draw entry...');
            // In a real app, we'd pass the drawId to the API
            const response = await apiService.enterWeeklyDraw(user.uuid);

            // Save entered state locally
            const newEnteredDraws = [...enteredDraws, drawId];
            setEnteredDraws(newEnteredDraws);
            await AsyncStorage.setItem(`user_entered_draws_${user.uuid}`, JSON.stringify(newEnteredDraws));

            // Update user crowns immediately from response
            if (response.crowns !== undefined) {
                await updateUser({ crowns: response.crowns });
            } else {
                await refreshUser(); // Fallback
            }

            await fetchStats(); // Update total entries
            setPendingConfirmation(null);
            console.log('Draw entry successful!');
            Alert.alert('Success', 'You have entered the prize draw!');
        } catch (error) {
            console.error('Draw entry failed:', error);
            Alert.alert('Error', error.error || 'Failed to enter draw');
            setPendingConfirmation(null);
        } finally {
            setLoading(false);
        }
    };

    const getDateString = (daysToAdd) => {
        const date = new Date();
        date.setDate(date.getDate() + daysToAdd);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Back Button" testID="weekly-draw-back-button">
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>Prize Draws</Text>
                    <Text style={styles.versionText}>v2025.12.02-DB-FIX</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.balanceHeader}>
                    <Text style={styles.balanceLabel}>Your Balance:</Text>
                    <View style={styles.balanceValue}>
                        <Text style={styles.balanceText}>{user?.crowns || 0}</Text>
                        <MaterialCommunityIcons name="crown" size={20} color="#38bdf8" />
                    </View>
                </View>

                {/* Total Entries Stat Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statsIconContainer}>
                        <Ionicons name="people" size={28} color="#38bdf8" />
                    </View>
                    <View style={styles.statsContent}>
                        <Text style={styles.statsLabel}>Total Entries</Text>
                        <Text style={styles.statsValue}>{stats.totalEntries.toLocaleString()}</Text>
                    </View>
                    <View style={styles.statsBadge}>
                        <Ionicons name="trending-up" size={16} color="#34d399" />
                    </View>
                </View>

                {SAMPLE_DRAWS.map((draw) => {
                    const isEntered = enteredDraws.includes(draw.id);
                    const isPending = pendingConfirmation === draw.id;
                    return (
                        <View key={draw.id} style={[styles.drawCard, isEntered && styles.enteredCard]}>
                            {/* Sponsor Banner */}
                            <LinearGradient
                                colors={draw.colors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.sponsorBanner}
                            >
                                <View style={styles.sponsorInfo}>
                                    <Text style={[styles.sponsorLabel, { color: draw.accent }]}>SPONSORED BY</Text>
                                    <Text style={styles.sponsorName}>{draw.sponsor}</Text>
                                </View>
                                <View style={[styles.drawDateBadge, { borderColor: draw.accent }]}>
                                    <Text style={[styles.drawDateText, { color: draw.accent }]}>
                                        Draws {getDateString(draw.daysLeft)}
                                    </Text>
                                </View>
                            </LinearGradient>

                            <View style={styles.cardContent}>
                                <View style={styles.prizeHeader}>
                                    <View style={[styles.iconContainer, { backgroundColor: `${draw.accent} 20` }]}>
                                        <MaterialCommunityIcons name={draw.icon} size={32} color={draw.accent} />
                                    </View>
                                    <View style={styles.prizeInfo}>
                                        <Text style={styles.prizeTitle}>{draw.prize}</Text>

                                    </View>
                                </View>

                                <Text style={styles.prizeDescription}>{draw.description}</Text>

                                <View style={styles.actionRow}>
                                    <View style={styles.costContainer}>
                                        <Text style={styles.costLabel}>Cost:</Text>
                                        <Text style={styles.costValue}>{draw.cost}</Text>
                                        <MaterialCommunityIcons name="crown" size={16} color="#38bdf8" />
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => {
                                            if (draw.isReal) {
                                                handleEnterDraw(draw.id, draw.cost);
                                            } else {
                                                navigation.navigate('Sponsor');
                                            }
                                        }}
                                        disabled={loading || (draw.isReal && user?.crowns < draw.cost)}
                                        style={styles.enterButtonWrapper}
                                        accessibilityLabel={!draw.isReal ? "Become a Sponsor" : isEntered ? `Enter Again: ${draw.prize}` : isPending ? `Confirm Entry: ${draw.prize}` : `Enter Draw: ${draw.prize}`}
                                        testID={`draw-action-button-${draw.id}`}
                                    >
                                        <LinearGradient
                                            colors={
                                                !draw.isReal
                                                    ? ['#334155', '#475569'] // Sponsor button colors
                                                    : isPending
                                                        ? ['#f59e0b', '#d97706']
                                                        : (loading || user?.crowns < draw.cost)
                                                            ? ['#334155', '#334155']
                                                            : ['#00d4ff', '#2979ff']
                                            }
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.enterButton}
                                        >
                                            {!draw.isReal ? (
                                                <Text style={styles.enterButtonText}>Become a Sponsor</Text>
                                            ) : isPending ? (
                                                <>
                                                    <Text style={styles.enterButtonText}>Confirm Entry</Text>
                                                    <Ionicons name="alert-circle" size={20} color="#fff" />
                                                </>
                                            ) : isEntered ? (
                                                <>
                                                    <Text style={styles.enterButtonText}>Enter Again (+1)</Text>
                                                    <Ionicons name="add-circle" size={20} color="#fff" />
                                                </>
                                            ) : (
                                                <Text style={styles.enterButtonText}>Enter Draw</Text>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                })}
                <View style={{ height: 40 }} />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#0f172a',
        zIndex: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    versionText: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
    },
    balanceLabel: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '600',
    },
    balanceValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    balanceText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(56, 189, 248, 0.08)',
        padding: 18,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.2)',
        gap: 15,
    },
    statsIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContent: {
        flex: 1,
    },
    statsLabel: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsValue: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    statsBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    enteredCard: {
        borderColor: '#10b981',
        borderWidth: 2,
    },
    sponsorBanner: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sponsorLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 2,
    },
    sponsorName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    drawDateBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    drawDateText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardContent: {
        padding: 20,
    },
    prizeHeader: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 15,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    prizeInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    prizeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },

    prizeDescription: {
        fontSize: 14,
        color: '#94a3b8',
        lineHeight: 20,
        marginBottom: 20,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    costContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    costLabel: {
        color: '#64748b',
        fontSize: 14,
    },
    costValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    enterButtonWrapper: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    enterButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    enterButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default WeeklyDrawScreen;
