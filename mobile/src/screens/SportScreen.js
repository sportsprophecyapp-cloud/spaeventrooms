import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import ArenaDeck from '../components/ArenaDeck';
import ArenaCardSkeleton from '../components/ArenaCardSkeleton'; // I'll create this or use a generic one
import PredictionShareCard from '../components/PredictionShareCard';
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
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [arenaCleared, setArenaCleared] = useState(false);
    const [showShareCard, setShowShareCard] = useState(false);
    const [lastGame, setLastGame] = useState(null);
    const [lastPick, setLastPick] = useState('');

    const fetchEvents = async () => {
        try {
            const [eventsData, predictionsData, sponsorsData] = await Promise.all([
                apiService.getEvents(),
                user ? apiService.getUserPredictions(user.uuid) : Promise.resolve([]),
                apiService.getActiveSponsors()
            ]);

            // Mark events that user has already predicted on
            const backendPredictedIds = (Array.isArray(predictionsData) ? predictionsData : []).map(p => p.eventId);
            const localPredictedIds = (user?.isGuest && user?.predictedGames) ? user.predictedGames : [];
            const allPredictedIds = new Set([...backendPredictedIds, ...localPredictedIds]);

            const eventsWithStatus = (Array.isArray(eventsData) ? eventsData : []).map(event => ({
                ...event,
                hasPredicted: allPredictedIds.has(event.id)
            }));

            setEvents(eventsWithStatus);
            setSponsors(Array.isArray(sponsorsData) ? sponsorsData : []);
            
            // Check if all games for this sport are already predicted
            const unpredictedCount = eventsWithStatus
                .filter(event => matchesSport(event, sportId))
                .filter(event => !event.hasPredicted).length;
                
            if (unpredictedCount === 0 && eventsWithStatus.length > 0) {
                setArenaCleared(true);
            } else {
                setArenaCleared(false);
            }
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

    const handlePredictionSuccess = (game, pick) => {
        setLastGame(game);
        setLastPick(pick);
        fetchEvents();
    };

    const handleArenaComplete = () => {
        setArenaCleared(true);
        // Find the last game played to show on the share card
        const unpredicted = upcomingEvents.filter(e => !e.hasPredicted);
        if (unpredicted.length > 0) {
            setLastGame(unpredicted[unpredicted.length - 1]);
        }
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

    // Get upcoming events
    const upcomingEvents = filteredEvents
        .filter(event => !event.hasPredicted)
        .sort((a, b) => {
            const dateA = new Date(a.commence_time || a.startTime);
            const dateB = new Date(b.commence_time || b.startTime);
            return dateA - dateB;
        });

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

            <View style={styles.deckContainer}>
                {loading ? (
                    <ArenaCardSkeleton />
                ) : arenaCleared ? (
                    <View style={styles.completionCard}>
                        <LinearGradient
                            colors={['#1e293b', '#0f172a']}
                            style={styles.completionGradient}
                        >
                            <View style={styles.confettiContainer}>
                                <Text style={styles.confettiIcon}>🎉</Text>
                                <Text style={styles.completionTitle}>Arena Cleared!</Text>
                                <Text style={styles.completionSubtext}>
                                    You've mastered all matches in the {sportName} Arena.
                                </Text>
                            </View>

                            <View style={styles.prizeSection}>
                                <Text style={styles.prizeLabel}>FEATURED PRIZE AVAILABLE</Text>
                                <View style={styles.prizeCard}>
                                    <Ionicons name="gift-outline" size={32} color={COLORS.accent.gold} />
                                    <View>
                                        <Text style={styles.prizeTitle}>Weekly Draw Entry</Text>
                                        <Text style={styles.prizeDesc}>Join for a chance to win exclusive rewards!</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.completionActions}>
                                <TouchableOpacity 
                                    style={styles.drawButton}
                                    onPress={() => navigation.navigate('WeeklyDraw')}
                                >
                                    <LinearGradient
                                        colors={COLORS.gradients.primary}
                                        style={styles.actionGradient}
                                    >
                                        <Ionicons name="ticket-outline" size={20} color={COLORS.text.dark} />
                                        <Text style={styles.actionButtonText}>GO TO DRAW ROOM</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.sharePicksButton}
                                    onPress={() => setShowShareCard(true)}
                                >
                                    <LinearGradient
                                        colors={COLORS.gradients.gold}
                                        style={styles.actionGradient}
                                    >
                                        <Ionicons name="share-social-outline" size={20} color={COLORS.text.dark} />
                                        <Text style={styles.actionButtonText}>SHARE YOUR PICKS</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.backLeaguesButton}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={styles.backLeaguesText}>← Back to Leagues</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                ) : upcomingEvents.length > 0 ? (
                    <ArenaDeck 
                        games={upcomingEvents}
                        sponsors={sponsors}
                        onComplete={handleArenaComplete}
                        onPredictionSuccess={handlePredictionSuccess}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color={COLORS.text.tertiary} />
                        <Text style={styles.emptyText}>Arena is quiet today...</Text>
                        <Text style={styles.emptySubtext}>New games are added daily. Check back soon!</Text>
                    </View>
                )}
            </View>

            {showShareCard && (
                <PredictionShareCard 
                    visible={showShareCard}
                    onClose={() => setShowShareCard(false)}
                    homeTeam={lastGame?.homeTeam || 'Home Team'}
                    awayTeam={lastGame?.awayTeam || 'Away Team'}
                    pick={lastPick || 'Winner'}
                    username={user?.username || 'Fan'}
                    referralCode={user?.referralCode || 'ARENA'}
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
    deckContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.text.secondary,
        marginTop: SPACING.md,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    completionCard: {
        flex: 1,
        padding: SPACING.lg,
    },
    completionGradient: {
        flex: 1,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    confettiContainer: {
        alignItems: 'center',
    },
    confettiIcon: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    completionTitle: {
        color: COLORS.text.primary,
        fontSize: 28,
        fontWeight: TYPOGRAPHY.weights.black,
        textAlign: 'center',
    },
    completionSubtext: {
        color: COLORS.text.secondary,
        fontSize: 14,
        textAlign: 'center',
        marginTop: SPACING.sm,
    },
    prizeSection: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    prizeLabel: {
        color: COLORS.accent.gold,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 1,
        marginBottom: SPACING.sm,
    },
    prizeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    prizeTitle: {
        color: COLORS.text.primary,
        fontSize: 16,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    prizeDesc: {
        color: COLORS.text.tertiary,
        fontSize: 12,
    },
    completionActions: {
        width: '100%',
        gap: SPACING.md,
    },
    drawButton: {
        height: 56,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    sharePicksButton: {
        height: 56,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    actionGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.md,
    },
    actionButtonText: {
        color: COLORS.text.dark,
        fontSize: 14,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 1,
    },
    backLeaguesButton: {
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    backLeaguesText: {
        color: COLORS.text.tertiary,
        fontSize: 14,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxxl,
    },
    emptyText: {
        color: COLORS.text.primary,
        fontSize: 18,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginTop: SPACING.md,
    },
    emptySubtext: {
        color: COLORS.text.secondary,
        fontSize: 14,
        textAlign: 'center',
        marginTop: SPACING.sm,
    },
});

export default SportScreen;
