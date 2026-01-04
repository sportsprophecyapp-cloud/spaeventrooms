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
    const { sportId, sportName } = route.params || { sportId: 'all', sportName: 'All Games' };

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchEvents = async () => {
        try {
            const [eventsData, predictionsData] = await Promise.all([
                apiService.getEvents(),
                user ? apiService.getUserPredictions(user.uuid) : Promise.resolve([])
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
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
    };

    const [initialTeam, setInitialTeam] = useState(null);

    const handleGamePress = (event, selectedTeam = null) => {
        setSelectedEvent(event);
        setInitialTeam(selectedTeam);
        setModalVisible(true);
    };



    // Helper to check if event matches selected sport
    const matchesSport = (event, selectedSportId) => {
        if (selectedSportId === 'all') return true;

        const sport = event.sport?.toLowerCase() || '';
        const league = event.league?.toLowerCase() || '';
        const id = selectedSportId.toLowerCase();

        // Direct match
        if (sport === id || league === id) return true;

        // Mappings
        switch (id) {
            case 'nba':
                return sport === 'basketball' || league === 'nba';
            case 'nfl':
                return sport === 'football' || league === 'nfl';
            case 'nhl':
                return sport === 'hockey' || league === 'nhl';
            case 'mlb':
                return sport === 'baseball' || league === 'mlb';
            case 'soccer':
                return sport === 'soccer';
            case 'mma':
                return sport === 'mma' || sport === 'ufc';
            default:
                return false;
        }
    };

    // Filter events by selected sport
    const filteredEvents = events.filter(event => matchesSport(event, sportId));

    // Get upcoming events in next 24 hours
    const now = new Date();
    const futureWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingEvents = filteredEvents
        .filter(event => {
            const eventDate = new Date(event.commence_time || event.startTime);
            return eventDate >= now && eventDate <= futureWindow;
        })
        .sort((a, b) => {
            // Priority 1: Predicted games go to the bottom
            if (a.hasPredicted && !b.hasPredicted) return 1;
            if (!a.hasPredicted && b.hasPredicted) return -1;

            // Priority 2: Sort by time (ascending)
            const dateA = new Date(a.commence_time || a.startTime);
            const dateB = new Date(b.commence_time || b.startTime);
            return dateA - dateB;
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Back Button" testID="sport-back-button">
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{sportName}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Fixed Sponsor Banner */}
            <SponsorBanner style={styles.sponsorBannerContainer} />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent.cyan} />
                }
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Upcoming Games (Next 24 Hours)</Text>
                    <Text style={styles.gameCount}>{upcomingEvents.length} games</Text>
                </View>

                {loading ? (
                    <View style={styles.skeletonContainer}>
                        {[1, 2, 3].map(i => <GameCardSkeleton key={i} />)}
                    </View>
                ) : upcomingEvents.length > 0 ? (
                    upcomingEvents.map(event => (
                        <GameCard
                            key={event.id}
                            game={event}
                            onPress={() => handleGamePress(event)}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        {['mlb', 'soccer', 'mma'].includes(sportId.toLowerCase()) ? (
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
                )}
            </ScrollView>

            <PredictionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                event={selectedEvent}
                initialTeam={initialTeam}
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
        borderRadius: 0, // Reset radius for full width bar look
        borderWidth: 0,
        marginVertical: 0,
        backgroundColor: COLORS.background.secondary,
    },
    contactText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.xs,
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
