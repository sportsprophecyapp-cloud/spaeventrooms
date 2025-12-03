import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import GameCard from '../components/GameCard';
import PredictionModal from '../components/PredictionModal';
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
            const predictedEventIds = new Set(predictionsData.map(p => p.eventId));
            const eventsWithStatus = (eventsData || []).map(event => ({
                ...event,
                hasPredicted: predictedEventIds.has(event.id)
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

    const handleGamePress = (event) => {
        setSelectedEvent(event);
        setModalVisible(true);
    };

    const handleSponsorPress = () => {
        Linking.openURL('mailto:Contact@sportsprophecyapp.com?subject=Sponsorship Inquiry');
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

    const upcomingEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.commence_time || event.startTime);
        return eventDate >= now && eventDate <= futureWindow;
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
            <TouchableOpacity onPress={handleSponsorPress} activeOpacity={0.9}>
                <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sponsorBanner}
                >
                    <View style={styles.sponsorIconContainer}>
                        <Ionicons name="megaphone-outline" size={24} color={COLORS.accent.cyan} />
                    </View>
                    <View style={styles.sponsorContent}>
                        <Text style={styles.sponsorTitle}>YOUR PRODUCT HERE</Text>
                        <Text style={styles.sponsorText}>
                            Use Discount Code <Text style={styles.codeHighlight}>Prophecy15</Text>
                        </Text>
                    </View>
                    <View style={styles.sponsorAction}>
                        <Text style={styles.contactText}>Contact Us</Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.text.secondary} />
                    </View>
                </LinearGradient>
            </TouchableOpacity>

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
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.accent.cyan} />
                        <Text style={styles.loadingText}>Loading games...</Text>
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
                        <Ionicons name="calendar-outline" size={48} color={COLORS.text.tertiary} />
                        <Text style={styles.emptyText}>No upcoming games found</Text>
                        <Text style={styles.emptySubtext}>
                            Check back later for new matches
                        </Text>
                    </View>
                )}
            </ScrollView>

            <PredictionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                event={selectedEvent}
                onPredictionSuccess={fetchEvents}
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
    sponsorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
    },
    sponsorIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    sponsorContent: {
        flex: 1,
    },
    sponsorTitle: {
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.sm,
        marginBottom: 2,
    },
    sponsorText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.xs,
    },
    codeHighlight: {
        color: COLORS.accent.cyan,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    sponsorAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
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
});

export default SportScreen;
