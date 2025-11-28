import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GameCard from '../components/GameCard';
import SportCategoryTabs from '../components/SportCategoryTabs';
import PredictionModal from '../components/PredictionModal';
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
            const data = await apiService.getEvents();
            setEvents(data || []);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

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

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>SPORTS</Text>
                    <Text style={styles.headerSubtitle}>PROPHECY</Text>
                </View>
                <View style={styles.headerIcons}>
                    <View style={styles.tokenBadge}>
                        <Ionicons name="wallet-outline" size={16} color={COLORS.accent.lime} />
                        <Text style={styles.tokenText}>{user?.tokens || 100}</Text>
                    </View>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={24} color={COLORS.text.primary} />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Sport Category Tabs */}
            <SportCategoryTabs
                selectedSport={selectedSport}
                onSelectSport={setSelectedSport}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent.cyan} />
                }
            >
                {/* Announcements Section */}
                <View style={styles.announcementSection}>
                    <LinearGradient
                        colors={[COLORS.accent.purple, COLORS.accent.purpleLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.announcementCard}
                    >
                        <View style={styles.announcementIcon}>
                            <Ionicons name="megaphone" size={24} color={COLORS.text.primary} />
                        </View>
                        <View style={styles.announcementContent}>
                            <Text style={styles.announcementTitle}>🎉 Weekly Draw Tonight!</Text>
                            <Text style={styles.announcementText}>
                                Win up to $1,000 in prizes. Make predictions to enter!
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.text.primary} />
                    </LinearGradient>
                </View>

                {/* Sponsor Ad Banner */}
                <View style={styles.sponsorSection}>
                    <LinearGradient
                        colors={COLORS.gradients.dark}
                        style={styles.sponsorBanner}
                    >
                        <Text style={styles.sponsorLabel}>SPONSORED</Text>
                        <Text style={styles.sponsorTitle}>QUANTUM SPORTS GEAR</Text>
                        <Text style={styles.sponsorDescription}>
                            Get 20% off premium sports equipment
                        </Text>
                        <TouchableOpacity style={styles.sponsorButton}>
                            <LinearGradient
                                colors={COLORS.gradients.lime}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.sponsorButtonGradient}
                            >
                                <Text style={styles.sponsorButtonText}>SHOP NOW</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* Games Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {selectedSport === 'all' ? 'All Games' : selectedSport.toUpperCase()} - Next 48 Hours
                        </Text>
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
                            <Text style={styles.emptyText}>No games in the next 48 hours</Text>
                            <Text style={styles.emptySubtext}>
                                {selectedSport === 'all'
                                    ? 'Check back later for upcoming matches'
                                    : `Try selecting a different sport`}
                            </Text>
                        </View>
                    )}
                </View>

            </ScrollView>

            <PredictionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                event={selectedEvent}
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
    announcementSection: {
        marginBottom: SPACING.base,
    },
    announcementCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.base,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.md,
        ...SHADOWS.lg,
    },
    announcementIcon: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    announcementContent: {
        flex: 1,
    },
    announcementTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.xs,
    },
    announcementText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        opacity: 0.9,
    },
    sponsorSection: {
        marginBottom: SPACING.lg,
    },
    sponsorBanner: {
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border.primary,
        alignItems: 'center',
    },
    sponsorLabel: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.tertiary,
        fontWeight: TYPOGRAPHY.weights.bold,
        letterSpacing: 1,
        marginBottom: SPACING.xs,
    },
    sponsorTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    sponsorDescription: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.base,
        textAlign: 'center',
    },
    sponsorButton: {
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        width: '100%',
    },
    sponsorButtonGradient: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    sponsorButtonText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 1,
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

export default HomeScreen;
