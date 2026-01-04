import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

// Placeholder draws for sponsors
const PLACEHOLDER_DRAWS = [
    {
        id: 'placeholder_1',
        sponsor: 'Your Brand Here',
        prize: 'Sponsor This Draw #1',
        prizeDetails: { description: 'Sponsors donate a prize and this ad is yours. Contact us!' },
        cost: 0,
        colors: COLORS.gradients.dark,
        accent: '#94a3b8',
        icon: 'gift-outline',
        daysLeft: 7,
        isReal: false
    },
    {
        id: 'placeholder_2',
        sponsor: 'Your Brand Here',
        prize: 'Sponsor This Draw #2',
        prizeDetails: { description: 'Sponsors donate a prize and this ad is yours. Contact us!' },
        cost: 0,
        colors: COLORS.gradients.dark,
        accent: '#94a3b8',
        icon: 'gift-outline',
        daysLeft: 7,
        isReal: false
    }
];

const WeeklyDrawScreen = ({ navigation }) => {
    const { user, refreshUser, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalEntries: 0 });
    const [enteredDraws, setEnteredDraws] = useState([]);
    const [pendingConfirmation, setPendingConfirmation] = useState(null);
    const [activeDraws, setActiveDraws] = useState([]);

    useEffect(() => {
        const init = async () => {
            await refreshUser();
            fetchStats();
            fetchPrizes();
            loadEnteredDraws();
        };
        init();
    }, []);

    const fetchPrizes = async () => {
        try {
            const prizes = await apiService.getActivePrizeSponsors();
            // Transform API data to UI format
            const formattedPrizes = prizes.map(p => ({
                id: p._id,
                sponsor: p.sponsorName,
                prize: p.prizeDetails?.description || 'Prize Draw', // Use sponsor's prize description
                prizeDetails: p.prizeDetails, // { description, value }
                cost: 1, // Default cost
                colors: ['#064e3b', '#065f46'], // Green theme for real prizes
                accent: '#34d399',
                icon: 'trophy-outline',
                daysLeft: Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
                isReal: true,
                bannerUrl: p.bannerUrl // Include banner URL from API
            }));
            setActiveDraws(formattedPrizes);
        } catch (error) {
            console.error('Failed to fetch prizes:', error);
        }
    };

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
        try {
            const data = await apiService.getWeeklyDrawStats();
            setStats(data);
        } catch (e) { /* Silent fail */ }
    };

    const handleEnterDraw = async (drawId, cost) => {
        if (user?.isGuest) {
            Alert.alert(
                'Join the Club!',
                'Please create an account to participate in prize draws and join our community.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Create Account', onPress: () => navigation.navigate('Register') }
                ]
            );
            return;
        }

        if (pendingConfirmation !== drawId) {
            setPendingConfirmation(drawId);
            return;
        }

        if (!user || user.crowns < cost) {
            Alert.alert('Insufficient Crowns', `You need at least ${cost} crowns to enter this draw.`);
            setPendingConfirmation(null);
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.enterWeeklyDraw(user.uuid);
            const newEnteredDraws = [...enteredDraws, drawId];
            setEnteredDraws(newEnteredDraws);
            await AsyncStorage.setItem(`user_entered_draws_${user.uuid}`, JSON.stringify(newEnteredDraws));

            if (response.crowns !== undefined) await updateUser({ crowns: response.crowns });
            else await refreshUser();

            await fetchStats();
            setPendingConfirmation(null);
            Alert.alert('Success', 'You have entered the prize draw!');
        } catch (error) {
            Alert.alert('Error', error.error || 'Failed to enter draw');
            setPendingConfirmation(null);
        } finally {
            setLoading(false);
        }
    };

    const handleFreeEntry = () => {
        Alert.alert(
            'Free Entry Request',
            'To enter without using crowns, please email "Free Entry Request" to support@sportsprophecy.com with your username. Limit 1 per week.\n\nNO PURCHASE NECESSARY.',
            [{ text: 'OK' }]
        );
    };

    const formattedDate = (days) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Display: Real Approved Ads first, then ALWAYS 2 Placeholder Slots
    const displayDraws = [
        ...activeDraws,
        ...PLACEHOLDER_DRAWS
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Back Button" testID="weekly-draw-back-button">
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>Prize Draws</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.balanceHeader}>
                    <Text style={styles.balanceLabel}>Your Balance:</Text>
                    <View style={styles.balanceValue}>
                        <Text style={styles.balanceText}>{user?.crowns || 0}</Text>
                        <MaterialCommunityIcons name="crown" size={20} color={COLORS.accent.cyan} />
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

                {displayDraws.map((draw) => {
                    const isEntered = enteredDraws.includes(draw.id);
                    const isPending = pendingConfirmation === draw.id;
                    return (
                        <View key={draw.id} style={[styles.drawCard, isEntered && styles.enteredCard]}>
                            {/* Sponsor Banner */}
                            {draw.bannerUrl ? (
                                <View style={styles.sponsorBannerContainer}>
                                    <Image
                                        source={{ uri: draw.bannerUrl }}
                                        style={styles.sponsorBannerImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            ) : (
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
                                            Draws {formattedDate(draw.daysLeft)}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            )}

                            <View style={styles.cardContent}>
                                {/* Sponsor Info Row (only show for real sponsors with banners) */}
                                {draw.bannerUrl && (
                                    <View style={styles.sponsorInfoRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.sponsorLabelSmall}>SPONSORED BY</Text>
                                            <Text style={styles.sponsorNameSmall}>{draw.sponsor}</Text>
                                        </View>
                                        <View style={styles.drawDateBadgeSmall}>
                                            <Text style={styles.drawDateTextSmall}>
                                                Draws {formattedDate(draw.daysLeft)}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                <View style={styles.prizeHeader}>
                                    <View style={[styles.iconContainer, { backgroundColor: `${draw.accent}20` }]}>
                                        <MaterialCommunityIcons name={draw.icon} size={32} color={draw.accent} />
                                    </View>
                                    <View style={styles.prizeInfo}>
                                        <Text style={styles.prizeTitle}>{draw.prize}</Text>
                                        {draw.prizeDetails?.value && (
                                            <Text style={styles.prizeValue}>${draw.prizeDetails.value}</Text>
                                        )}
                                    </View>
                                </View>

                                <Text style={styles.prizeDescription}>{draw.prizeDetails.description}</Text>

                                <View style={styles.actionRow}>
                                    <View style={styles.costContainer}>
                                        <Text style={styles.costLabel}>Cost:</Text>
                                        <Text style={styles.costValue}>{draw.cost}</Text>
                                        <MaterialCommunityIcons name="crown" size={16} color={COLORS.accent.cyan} />
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
                                    >
                                        <LinearGradient
                                            colors={
                                                !draw.isReal
                                                    ? ['#f59e0b', '#d97706']
                                                    : (loading || user?.crowns < draw.cost)
                                                        ? COLORS.gradients.disabled
                                                        : COLORS.gradients.primary
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
                                                    <Ionicons name="alert-circle" size={20} color={COLORS.text.inverse} />
                                                </>
                                            ) : isEntered ? (
                                                <>
                                                    <Text style={styles.enterButtonText}>Enter Again (+1)</Text>
                                                    <Ionicons name="add-circle" size={20} color={COLORS.text.inverse} />
                                                </>
                                            ) : (
                                                <Text style={styles.enterButtonText}>Enter Draw</Text>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>

                                {draw.isReal && (
                                    <TouchableOpacity onPress={handleFreeEntry} style={{ marginTop: 15, alignSelf: 'center' }}>
                                        <Text style={{ color: COLORS.text.tertiary, fontSize: 10, textDecorationLine: 'underline' }}>
                                            No Purchase Necessary. Click for Free Entry Method.
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.text.tertiary, fontSize: 10, textAlign: 'center' }}>
                        Promotions are sponsored by third parties. Sponsors are solely responsible for fulfillment.
                        {'\n'}
                        Google Play and Apple are not sponsors of, nor affiliated with, these promotions.
                    </Text>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
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
        backgroundColor: COLORS.background.secondary,
        zIndex: 10,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    versionText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.tertiary,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        padding: SPACING.base,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
    },
    balanceLabel: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    balanceValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    balanceText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
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
        color: COLORS.text.secondary,
        fontSize: 13,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsValue: {
        color: COLORS.text.primary,
        fontSize: 28, // Keep large for emphasis
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    statsBadge: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawCard: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
    },
    enteredCard: {
        borderColor: COLORS.status.success,
        borderWidth: 2,
    },
    sponsorBanner: {
        padding: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sponsorBannerContainer: {
        position: 'relative',
        width: '100%',
        height: 120,
    },
    sponsorBannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay for text readability
    },
    sponsorLabel: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.bold,
        letterSpacing: 1,
        marginBottom: 2,
    },
    sponsorName: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    drawDateBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    drawDateText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    cardContent: {
        padding: SPACING.lg,
    },
    sponsorInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: SPACING.md,
        marginBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    sponsorLabelSmall: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.accent.cyan,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginBottom: 2,
    },
    sponsorNameSmall: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    drawDateBadgeSmall: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        borderWidth: 1,
        borderColor: COLORS.accent.cyan,
    },
    drawDateTextSmall: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.accent.cyan,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    prizeHeader: {
        flexDirection: 'row',
        gap: SPACING.base,
        marginBottom: SPACING.md,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    prizeInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    prizeTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    prizeValue: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.accent.cyan,
    },

    prizeDescription: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        lineHeight: 20,
        marginBottom: SPACING.lg,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.tertiary,
    },
    costContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    costLabel: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    costValue: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    enterButtonWrapper: {
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
    },
    enterButton: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    enterButtonText: {
        color: COLORS.text.inverse,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
});

export default WeeklyDrawScreen;
