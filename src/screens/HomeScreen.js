import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GameCard from '../components/GameCard';
import SportCategoryTabs from '../components/SportCategoryTabs';
import PredictionModal from '../components/PredictionModal';

import SponsorBanner from '../components/SponsorBanner';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const HomeScreen = ({ navigation }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSport, setSelectedSport] = useState('all');
    const { user } = useAuth();

    const fetchEvents = async () => {
        try {
            const [eventsData, predictionsData] = await Promise.all([
                apiService.getEvents(),
                (user && !user.isGuest) ? apiService.getUserPredictions(user.uuid) : Promise.resolve([])
            ]);

            // Mark events that user has already predicted on
            const backendPredictedIds = predictionsData.map(p => p.eventId);
            const localPredictedIds = (user?.isGuest && user?.predictedGames) ? user.predictedGames : [];
            const allPredictedIds = new Set([...backendPredictedIds, ...localPredictedIds]);

            const eventsWithStatus = (eventsData || []).map(event => ({
                ...event,
                hasPredicted: allPredictedIds.has(event.id)
            }));

            setEvents(eventsWithStatus);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user]); // Re-fetch when user changes

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
    };

    const handleGamePress = (event) => {
        setSelectedEvent(event);
        setModalVisible(true);
    };

    // Filter events by selected sport
    const filteredEvents = selectedSport === 'all'
        ? events
        : events.filter(event => event.sport?.toLowerCase() === selectedSport);

    // Get upcoming events in next 48 hours
    const now = new Date();
    const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const upcomingEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.commence_time || event.startTime);
        return eventDate >= now && eventDate <= fortyEightHoursLater;
    });

    const getNextUnpredictedGame = async (ignoreId = null) => {
        // Find the next game that hasn't been predicted on
        // Also exclude the game we just predicted on (ignoreId) to allow for immediate UI updates
        const unpredictedGames = upcomingEvents.filter(event =>
            !event.hasPredicted && event.id !== ignoreId
        );

        if (unpredictedGames.length > 0) {
            const nextGame = unpredictedGames[0];
            setSelectedEvent(nextGame);
            return nextGame;
        }

        return null; // No more unpredicted games
    };


    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>SPORTS</Text>
                    <Text style={styles.headerSubtitle}>PROPHECY</Text>
                </View>
                <View style={styles.headerIcons}>
                    <View style={styles.tokenBadge} accessibilityLabel="Token Balance" testID="home-token-badge">
                        <Ionicons name="wallet-outline" size={16} color={COLORS.accent.lime} />
                        <Text style={styles.tokenText}>{user?.tokens || 100}</Text>
                    </View>
                    <View style={styles.crownBadge} accessibilityLabel="Crown Balance" testID="home-crown-badge">
                        <Ionicons name="trophy" size={16} color="#FFD700" />
                        <Text style={styles.crownText}>{user?.crowns || 0}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Profile')}
                        accessibilityLabel="Notifications and Profile Button"
                        testID="home-notifications-button"
                    >
                        <Ionicons name="notifications-outline" size={24} color={COLORS.text.primary} />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Guest - Create Account Banner - MOVED TO TOP */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent.cyan} />
                }
            >
                {/* Sponsor Ad Sub-Header */}
                <SponsorBanner />

                {/* Guest - Create Account Banner - MOVED TO TOP */}
                {user?.isGuest && (
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <LinearGradient
                            colors={COLORS.gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.guestBanner}
                        >
                            <View style={styles.guestBannerContent}>
                                <View style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Ionicons name="person-add" size={28} color={COLORS.text.inverse} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.guestBannerTitle}>CREATE ACCOUNT</Text>
                                    <Text style={styles.guestBannerText}>Save your progress & win real prizes!</Text>
                                </View>
                                <Ionicons name="arrow-forward-circle" size={40} color={COLORS.text.inverse} />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Sport Category Tabs - MOVED UP */}
                <SportCategoryTabs />




                {/* Announcements Banner */}
                <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                    <LinearGradient
                        colors={['#dc2626', '#b91c1c']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.announcementBanner}
                    >
                        <View style={styles.announcementBannerContent}>
                            <View style={styles.announcementBannerIcon}>
                                <Ionicons name="megaphone" size={24} color={COLORS.text.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.announcementBannerTitle}>ANNOUNCEMENTS</Text>
                                <Text style={styles.announcementBannerText}>Check out the latest live updates & competitions!</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={COLORS.text.primary} />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>



                {/* Quick Access Section */}
                <View style={styles.quickAccessSection}>
                    <Text style={styles.sectionTitle}>⚡ Quick Access</Text>
                    <View style={styles.quickAccessGrid}>
                        <TouchableOpacity
                            style={styles.quickAccessCard}
                            onPress={() => navigation.navigate('Sport')}
                            accessibilityLabel="Quick Access: View Games"
                            testID="home-quick-access-games"
                        >
                            <LinearGradient
                                colors={['rgba(0, 212, 255, 0.2)', 'rgba(0, 212, 255, 0.05)']}
                                style={styles.quickAccessGradient}
                            >
                                <Ionicons name="calendar" size={32} color={COLORS.accent.cyan} />
                                <Text style={styles.quickAccessText}>View Games</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickAccessCard}
                            onPress={() => navigation.navigate('Leaderboard')}
                            accessibilityLabel="Quick Access: Leaderboard"
                            testID="home-quick-access-leaderboard"
                        >
                            <LinearGradient
                                colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)']}
                                style={styles.quickAccessGradient}
                            >
                                <Ionicons name="trophy" size={32} color={COLORS.accent.purple} />
                                <Text style={styles.quickAccessText}>Leaderboard</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickAccessCard}
                            onPress={() => navigation.navigate('WeeklyDraw')}
                            accessibilityLabel="Quick Access: Prize Draws"
                            testID="home-quick-access-draw"
                        >
                            <LinearGradient
                                colors={['rgba(195, 255, 0, 0.2)', 'rgba(195, 255, 0, 0.05)']}
                                style={styles.quickAccessGradient}
                            >
                                <Ionicons name="gift" size={32} color={COLORS.accent.lime} />
                                <Text style={styles.quickAccessText}>Prize Draws</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickAccessCard}
                            onPress={() => navigation.navigate('Chat')}
                            accessibilityLabel="Quick Access: Chat"
                            testID="home-quick-access-chat"
                        >
                            <LinearGradient
                                colors={['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.05)']}
                                style={styles.quickAccessGradient}
                            >
                                <Ionicons name="chatbubbles" size={32} color="#fbbf24" />
                                <Text style={styles.quickAccessText}>Chat</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>



            </ScrollView>

            <PredictionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                event={selectedEvent}
                onPredictionSuccess={fetchEvents}
                onLoadNextGame={getNextUnpredictedGame}
            />
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
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.base,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
        backgroundColor: COLORS.background.secondary,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.accent.cyan,
        letterSpacing: 2,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    tokenBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(195, 255, 0, 0.15)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(195, 255, 0, 0.3)',
        gap: SPACING.xs,
    },
    tokenText: {
        color: COLORS.accent.lime,
        fontWeight: TYPOGRAPHY.weights.black,
        fontSize: TYPOGRAPHY.sizes.base,
    },
    crownBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        gap: SPACING.xs,
    },
    crownText: {
        color: '#FFD700',
        fontWeight: TYPOGRAPHY.weights.black,
        fontSize: TYPOGRAPHY.sizes.base,
    },
    iconButton: {
        padding: SPACING.xs,
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.status.error,
    },
    scrollContent: {
        padding: SPACING.base,
    },
    announcementBanner: {
        marginHorizontal: SPACING.base,
        marginVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        ...SHADOWS.md,
    },
    announcementBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    announcementBannerIcon: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    announcementBannerTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.black,
        marginBottom: 2,
    },
    announcementBannerText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
        opacity: 0.9,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.base,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.md,
    },
    gameCount: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xxxl,
    },
    loadingText: {
        color: COLORS.text.secondary,
        marginTop: SPACING.md,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.xxxl,
    },
    emptyText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginTop: SPACING.base,
    },
    emptySubtext: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.sm,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    guestBanner: {
        marginHorizontal: SPACING.base,
        marginVertical: SPACING.md, // Increased vertical margin
        borderRadius: BORDER_RADIUS.xl, // Increased radius
        padding: SPACING.lg, // Increased padding
        ...SHADOWS.cyan, // Use cyan shadow
        borderWidth: 2, // Add border
        borderColor: COLORS.accent.lime, // Lime border for high visibility
        maxWidth: '100%',
        alignSelf: 'stretch',
    },
    guestBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    guestBannerTitle: {
        color: COLORS.text.inverse, // Black text on bright background
        fontSize: TYPOGRAPHY.sizes.xl, // Larger title
        fontWeight: TYPOGRAPHY.weights.black,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    guestBannerText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        opacity: 0.9,
        flexShrink: 1,
    },
    quickAccessSection: {
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.base,
    },
    quickAccessGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    quickAccessCard: {
        width: '47%',
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    quickAccessGradient: {
        padding: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        height: 100,
    },
    quickAccessText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        textAlign: 'center',
    },
});

export default HomeScreen;
