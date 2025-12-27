import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import GameCard from '../components/GameCard';
import GameCardSkeleton from '../components/GameCardSkeleton';
import PredictionModal from '../components/PredictionModal';
import SponsorBanner from '../components/SponsorBanner';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const SportScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useAuth();

    // 🛡️ FIX #1: Triple-layer parameter validation
    const params = route?.params || {};
    const { sportId = 'all', sportName = 'Upcoming Games' } = params;

    // Guard against missing route entirely
    if (!route || !route.params) {
        console.warn('[SportScreen] Route params missing, using defaults');
    }

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [initialTeam, setInitialTeam] = useState(null);

    /**
     * 🛡️ FIX #2: Bulletproof data fetching with comprehensive error handling
     */
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const userUuid = user?.uuid || null;

            // Fetch with explicit fallbacks
            const [eventsData, predictionsData] = await Promise.all([
                apiService.getEvents()
                    .catch(err => {
                        console.error('[SportScreen] getEvents failed:', err);
                        return [];
                    }),
                userUuid
                    ? apiService.getUserPredictions(userUuid)
                        .catch(err => {
                            console.error('[SportScreen] getUserPredictions failed:', err);
                            return [];
                        })
                    : Promise.resolve([])
            ]);

            // 🛡️ FIX #2a: Force arrays - handle null, undefined, objects, strings
            const safeEvents = Array.isArray(eventsData) ? eventsData : [];
            const safePredictions = Array.isArray(predictionsData) ? predictionsData : [];

            // 🛡️ FIX #2b: Safely extract prediction IDs with fallback
            const backendPredictedIds = (Array.isArray(safePredictions) ? safePredictions : [])
                .map(p => p?.eventId)
                .filter(Boolean); // Remove null/undefined

            // 🛡️ FIX #2c: Safe guest user check
            const isGuest = user?.isGuest === true;
            const localPredictedIds = (isGuest && Array.isArray(user?.predictedGames))
                ? user.predictedGames
                : [];

            const allPredictedIds = new Set([...backendPredictedIds, ...localPredictedIds]);

            // 🛡️ FIX #2d: Map with null checks on each event
            const eventsWithStatus = (Array.isArray(safeEvents) ? safeEvents : []).map(event => {
                if (!event || typeof event !== 'object') {
                    return null; // Skip malformed events
                }

                return {
                    ...event,
                    hasPredicted: allPredictedIds.has(event?.id || event?._id)
                };
            }).filter(Boolean); // Remove null entries

            setEvents(eventsWithStatus);
        } catch (error) {
            console.error('[SportScreen] Critical failure in fetchEvents:', error);
            setEvents([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // 🛡️ Dependency array guards
    useEffect(() => {
        // Only fetch if we have user uuid or are guest
        if (user && (user.uuid || user.isGuest)) {
            fetchEvents();
        }
    }, [user?.uuid]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
    };

    const handleGamePress = (event, selectedTeam = null) => {
        // 🛡️ Validate event before setting
        if (event && typeof event === 'object' && event.id) {
            setSelectedEvent(event);
            setInitialTeam(selectedTeam);
            setModalVisible(true);
        } else {
            console.warn('[SportScreen] Invalid event passed to handleGamePress');
        }
    };

    /**
     * 🛡️ FIX #3: Defensive sport matching with fallbacks
     */
    const matchesSport = (event, selectedSportId) => {
        // Guard against invalid inputs
        if (!event || typeof event !== 'object') return false;
        if (!selectedSportId) return true; // Default to 'all'

        const sport = (event.sport || '')?.toLowerCase() || '';
        const league = (event.league || '')?.toLowerCase() || '';
        const id = (selectedSportId || '').toLowerCase();

        if (id === 'all') return true;

        // Direct match
        if (sport === id || league === id) return true;

        // League mappings
        const mappings = {
            'nba': ['basketball', 'nba'],
            'nfl': ['football', 'nfl'],
            'nhl': ['hockey', 'nhl'],
            'mlb': ['baseball', 'mlb'],
            'soccer': ['soccer'],
            'mma': ['mma', 'ufc'],
        };

        const validSports = mappings[id] || [];
        return validSports.includes(sport) || validSports.includes(league);
    };

    /**
     * 🛡️ FIX #3a: Filtered events with triple-layer array safety
     */
    const filteredEvents = (Array.isArray(events) && events.length > 0)
        ? events
            .filter(event => event && typeof event === 'object') // Skip malformed
            .filter(event => matchesSport(event, sportId))
        : [];

    /**
     * 🛡️ FIX #3b: Upcoming events with defensive date handling
     */
    const getUpcomingEvents = () => {
        const now = new Date();
        const futureWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        return filteredEvents
            .filter(event => {
                // Guard against missing times
                const eventTime = event?.commence_time || event?.startTime;
                if (!eventTime) return false;

                try {
                    const eventDate = new Date(eventTime);
                    // Ensure valid date
                    if (isNaN(eventDate.getTime())) return false;

                    return eventDate >= now && eventDate <= futureWindow;
                } catch (e) {
                    console.warn('[SportScreen] Invalid event time:', eventTime);
                    return false;
                }
            })
            .sort((a, b) => {
                // Priority 1: Unpredicted games first
                if (a?.hasPredicted && !b?.hasPredicted) return 1;
                if (!a?.hasPredicted && b?.hasPredicted) return -1;

                // Priority 2: Sort by time (ascending)
                const timeA = a?.commence_time || a?.startTime;
                const timeB = b?.commence_time || b?.startTime;

                if (!timeA && !timeB) return 0;
                if (!timeA) return 1;
                if (!timeB) return -1;

                try {
                    const dateA = new Date(timeA);
                    const dateB = new Date(timeB);

                    // Guard against invalid dates
                    if (isNaN(dateA.getTime())) return 1;
                    if (isNaN(dateB.getTime())) return -1;

                    return dateA - dateB;
                } catch (e) {
                    console.warn('[SportScreen] Error sorting events by time');
                    return 0;
                }
            });
    };

    const upcomingEvents = getUpcomingEvents();

    /**
     * 🛡️ Get next unpredicted game safely
     */
    const getNextUnpredictedGame = async (ignoreId = null) => {
        // Guard against invalid inputs
        if (!Array.isArray(upcomingEvents) || upcomingEvents.length === 0) {
            return null;
        }

        const unpredictedGames = upcomingEvents.filter(event =>
            event &&
            event?.hasPredicted !== true &&
            event?.id !== ignoreId
        );

        if (unpredictedGames.length > 0) {
            const nextGame = unpredictedGames[0];
            if (nextGame && typeof nextGame === 'object') {
                setSelectedEvent(nextGame);
                return nextGame;
            }
        }

        return null;
    };

    /**
     * 🛡️ Safe render method for game list
     */
    const renderGameList = () => {
        // Loading state
        if (loading) {
            return (
                <View style={styles.skeletonContainer}>
                    {[1, 2, 3].map(i => (
                        <GameCardSkeleton key={`skeleton-${i}`} />
                    ))}
                </View>
            );
        }

        // Empty state
        if (!Array.isArray(upcomingEvents) || upcomingEvents.length === 0) {
            return (
                <View style={styles.emptyState}>
                    {['mlb', 'soccer', 'mma'].includes((sportId || '').toLowerCase()) ? (
                        <View style={styles.comingSoonCard}>
                            <LinearGradient
                                colors={['rgba(14, 165, 233, 0.1)', 'transparent']}
                                style={styles.comingSoonGradient}
                            >
                                <Ionicons name="time-outline" size={64} color={COLORS.accent.cyan} />
                                <View style={styles.comingSoonBadge}>
                                    <Text style={styles.comingSoonBadgeText}>V2.5 PREVIEW</Text>
                                </View>
                                <Text style={styles.comingSoonText}>{sportName} Coming Soon</Text>
                                <Text style={styles.emptySubtext}>
                                    Next-gen forecasting for {sportName} is in final testing.
                                </Text>
                                <TouchableOpacity
                                    style={styles.notifyButton}
                                    onPress={() => Linking.openURL('https://sportsprophecyapp.com')}
                                >
                                    <Text style={styles.notifyButtonText}>GET NOTIFIED</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    ) : (
                        <>
                            <Ionicons name="calendar-outline" size={48} color={COLORS.text.tertiary} />
                            <Text style={styles.emptyText}>No games available</Text>
                            <Text style={styles.emptySubtext}>
                                New games are added daily.
                            </Text>
                        </>
                    )}
                </View>
            );
        }

        // 🛡️ IRON-CLAD MAP: Triple-layer safety on games list
        return (Array.isArray(upcomingEvents) && upcomingEvents.length > 0) ? (
            (Array.isArray(upcomingEvents) ? upcomingEvents : []).map((event, index) => {
                // Layer 1: Validate event exists and is object
                if (!event || typeof event !== 'object') {
                    return null;
                }

                // Layer 2: Ensure event has an ID
                const eventId = event?.id || event?._id;
                if (!eventId) {
                    console.warn('[SportScreen] Event missing ID:', event);
                    return null;
                }

                // Layer 3: Safe key generation and render
                return (
                    <GameCard
                        key={eventId || `event-${index}`}
                        game={event}
                        onPress={(game, team) => handleGamePress(game, team)}
                    />
                );
            }).filter(Boolean) // Remove null entries
        ) : null;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    accessibilityLabel="Back Button"
                    testID="sport-back-button"
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{sportName || 'Games'}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Sponsor Banner */}
            <SponsorBanner style={styles.sponsorBannerContainer} />

            {/* 🛡️ Guard against undefined events array */}
            {!loading && (!Array.isArray(events) || events.length === 0) && upcomingEvents.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.accent.cyan} />
                </View>
            ) : null}

            {/* Scrollable Content */}
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.accent.cyan}
                    />
                }
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Upcoming Games (Next 24 Hours)</Text>
                    <Text style={styles.gameCount}>
                        {Array.isArray(upcomingEvents) ? upcomingEvents.length : 0} games
                    </Text>
                </View>

                {/* Safe render of game list */}
                {renderGameList()}
            </ScrollView>

            {/* Prediction Modal */}
            {selectedEvent && (
                <PredictionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    event={selectedEvent}
                    initialTeam={initialTeam}
                    onPredictionSuccess={fetchEvents}
                    onLoadNextGame={getNextUnpredictedGame}
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
        backgroundColor: COLORS.background.secondary,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    sponsorBannerContainer: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
        width: '100%',
        borderRadius: 0,
        borderWidth: 0,
        marginVertical: 0,
        backgroundColor: COLORS.background.secondary,
    },
    content: {
        padding: SPACING.base,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.base,
        marginTop: SPACING.sm,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    gameCount: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    skeletonContainer: {
        paddingVertical: SPACING.sm,
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
    comingSoonText: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginTop: SPACING.base,
    },
    emptySubtext: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.sm,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    comingSoonCard: {
        width: '100%',
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(14, 165, 233, 0.2)',
        marginTop: SPACING.lg,
    },
    comingSoonGradient: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: SPACING.xl,
    },
    comingSoonBadge: {
        backgroundColor: COLORS.accent.cyan,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    comingSoonBadgeText: {
        color: COLORS.text.inverse,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 1,
    },
    notifyButton: {
        marginTop: SPACING.xl,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.accent.cyan,
    },
    notifyButtonText: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        letterSpacing: 1,
    },
});

export default SportScreen;
