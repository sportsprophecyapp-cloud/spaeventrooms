import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from 'react-native';
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

            {/* LARGE Announcement Banner - NFL/NHL/NBA Open */}
            <LinearGradient
                colors={['#dc2626', '#b91c1c', '#991b1b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.largeAnnouncementBanner}
            >
                <View style={styles.largeAnnouncementContent}>
                    <View style={styles.largeAnnouncementHeader}>
                        <Ionicons name="megaphone" size={32} color={COLORS.text.primary} />
                        <Text style={styles.largeAnnouncementBadge}>LIVE NOW</Text>
                    </View>
                    <Text style={styles.largeAnnouncementTitle}>
                        NFL, NHL & NBA PREDICTIONS ARE OPEN!
                    </Text>
                    <Text style={styles.largeAnnouncementSubtitle}>
                        100% FREE • Win REAL Prizes • Sponsored by Our Partners
                    </Text>
                    <View style={styles.largeAnnouncementFooter}>
                        <View style={styles.largeAnnouncementSportTag}>
                            <Text style={styles.sportTagText}>🏈 NFL</Text>
                        </View>
                        <View style={styles.largeAnnouncementSportTag}>
                            <Text style={styles.sportTagText}>🏒 NHL</Text>
                        </View>
                        <View style={styles.largeAnnouncementSportTag}>
                            <Text style={styles.sportTagText}>🏀 NBA</Text>
                        </View>
                    </View>
                    <Text style={styles.largeAnnouncementCta}>
                        Good luck everyone! 🍀
                    </Text>
                </View>
            </LinearGradient>

            {/* Beta Testers Draw Banner */}
            <TouchableOpacity onPress={() => navigation.navigate('WeeklyDraw')}>
                <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.betaBanner}
                >
                    <Ionicons name="rocket" size={16} color={COLORS.text.primary} />
                    <Text style={styles.betaText}>🎉 Beta Testers Draw - Jan 6th 2026!</Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Sport Category Tabs */}
            <SportCategoryTabs />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent.cyan} />
                }
            >


                {/* Announcements Section - Expanded */}
                <View style={styles.announcementSection}>
                    <Text style={styles.sectionTitle}>📢 Announcements</Text>

                    <LinearGradient
                        colors={['#064e3b', '#065f46']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.announcementCard}
                    >
                        <View style={styles.announcementIcon}>
                            <Ionicons name="rocket" size={24} color={COLORS.text.primary} />
                        </View>
                        <View style={styles.announcementContent}>
                            <Text style={styles.announcementTitle}>🚀 Beta Testers Draw!</Text>
                            <Text style={styles.announcementText}>
                                Jan 6th 2026: Exclusive draw for users predicting in December!
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.text.primary} />
                    </LinearGradient>

                    <TouchableOpacity onPress={() => navigation.navigate('Report')}>
                        <LinearGradient
                            colors={['#ea580c', '#c2410c']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.announcementCard, { marginTop: SPACING.md }]}
                        >
                            <View style={styles.announcementIcon}>
                                <Ionicons name="bug" size={24} color={COLORS.text.primary} />
                            </View>
                            <View style={styles.announcementContent}>
                                <Text style={styles.announcementTitle}>🐛 Report Error / Suggestion</Text>
                                <Text style={styles.announcementText}>
                                    Earn 5 ENTRIES into Beta Draw for used suggestions!
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.text.primary} />
                        </LinearGradient>
                    </TouchableOpacity>





                    <TouchableOpacity onPress={() => navigation.navigate('League')}>
                        <LinearGradient
                            colors={['#7c3aed', '#6d28d9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.announcementCard, { marginTop: SPACING.md }]}
                        >
                            <View style={styles.announcementIcon}>
                                <Ionicons name="trophy" size={24} color={COLORS.text.primary} />
                            </View>
                            <View style={styles.announcementContent}>
                                <Text style={styles.announcementTitle}>🏆 Private Leagues are Live!</Text>
                                <Text style={styles.announcementText}>
                                    Create your own league, invite friends, and compete for the pot!
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.text.primary} />
                        </LinearGradient>
                    </TouchableOpacity>

                    <LinearGradient
                        colors={['#059669', '#10b981']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.announcementCard, { marginTop: SPACING.md }]}
                    >
                        <View style={styles.announcementIcon}>
                            <Ionicons name="gift" size={24} color={COLORS.text.primary} />
                        </View>
                        <View style={styles.announcementContent}>
                            <Text style={styles.announcementTitle}>🎁 Double Tokens Weekend!</Text>
                            <Text style={styles.announcementText}>
                                Earn 2x tokens on all correct predictions this weekend!
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.text.primary} />
                    </LinearGradient>
                </View>

                {/* Sponsor Section - Expanded */}
                <View style={styles.sponsorSection}>
                    <Text style={styles.sectionTitle}>🤝 Our Sponsors</Text>

                    <LinearGradient
                        colors={COLORS.gradients.dark}
                        style={styles.sponsorBanner}
                    >
                        <Text style={styles.sponsorLabel}>FEATURED SPONSOR</Text>
                        <Text style={styles.sponsorTitle}>QUANTUM SPORTS GEAR</Text>
                        <Text style={styles.sponsorDescription}>
                            Get 20% off premium sports equipment with code PROPHECY20
                        </Text>
                        <TouchableOpacity
                            style={styles.sponsorButton}
                            onPress={() => Linking.openURL('mailto:Contact@sportsprophecyapp.com')}
                            accessibilityLabel="Shop Sponsor: Quantum Sports Gear"
                            testID="home-sponsor-quantum"
                        >
                            <LinearGradient
                                colors={COLORS.gradients.lime}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.sponsorButtonGradient}
                            >
                                <Text style={styles.sponsorButtonText}>SHOP NOW</Text>
                                <Ionicons name="arrow-forward" size={16} color={COLORS.text.inverse} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>

                    <LinearGradient
                        colors={['#1e293b', '#334155']}
                        style={[styles.sponsorBanner, { marginTop: SPACING.md }]}
                    >
                        <Text style={styles.sponsorLabel}>PARTNER</Text>
                        <Text style={styles.sponsorTitle}>ELITE BETTING ACADEMY</Text>
                        <Text style={styles.sponsorDescription}>
                            Learn pro betting strategies. Free course for new members!
                        </Text>
                        <TouchableOpacity
                            style={styles.sponsorButton}
                            onPress={() => Linking.openURL('mailto:Contact@sportsprophecyapp.com')}
                            accessibilityLabel="Learn More: Elite Betting Academy"
                            testID="home-sponsor-academy"
                        >
                            <LinearGradient
                                colors={COLORS.gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.sponsorButtonGradient}
                            >
                                <Text style={styles.sponsorButtonText}>LEARN MORE</Text>
                                <Ionicons name="arrow-forward" size={16} color={COLORS.text.primary} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>

                    <LinearGradient
                        colors={['#1e293b', '#334155']}
                        style={[styles.sponsorBanner, { marginTop: SPACING.md }]}
                    >
                        <Text style={styles.sponsorLabel}>ADVERTISE HERE</Text>
                        <Text style={styles.sponsorTitle}>YOUR BRAND HERE</Text>
                        <Text style={styles.sponsorDescription}>
                            Reach thousands of sports fans. Contact us today to secure this spot!
                        </Text>
                        <TouchableOpacity
                            style={styles.sponsorButton}
                            onPress={() => Linking.openURL('mailto:Contact@sportsprophecyapp.com')}
                            accessibilityLabel="Contact Us for Sponsorship"
                            testID="home-sponsor-contact"
                        >
                            <LinearGradient
                                colors={['#dc2626', '#ef4444']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.sponsorButtonGradient}
                            >
                                <Text style={styles.sponsorButtonText}>CONTACT US</Text>
                                <Ionicons name="mail" size={16} color={COLORS.text.primary} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

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
    announcementSection: {
        marginBottom: SPACING.xl,
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
        marginBottom: SPACING.xl,
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
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.xs,
    },
    sponsorButtonText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 1,
    },
    quickAccessSection: {
        marginBottom: SPACING.xl,
    },
    quickAccessGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginTop: SPACING.md,
    },
    quickAccessCard: {
        width: '48%',
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    quickAccessGradient: {
        padding: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: BORDER_RADIUS.lg,
    },
    quickAccessText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginTop: SPACING.sm,
        textAlign: 'center',
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
    betaBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.base,
        marginHorizontal: SPACING.base,
        marginVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.xs,
    },
    betaText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        letterSpacing: 0.5,
    },
    largeAnnouncementBanner: {
        marginHorizontal: SPACING.base,
        marginVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        ...SHADOWS.lg,
        borderWidth: 2,
        borderColor: '#fca5a5',
    },
    largeAnnouncementContent: {
        alignItems: 'center',
    },
    largeAnnouncementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    largeAnnouncementBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        letterSpacing: 1.5,
    },
    largeAnnouncementTitle: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
        letterSpacing: 0.5,
        lineHeight: 32,
    },
    largeAnnouncementSubtitle: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.text.primary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
        opacity: 0.95,
        letterSpacing: 0.3,
    },
    largeAnnouncementFooter: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    largeAnnouncementSportTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    sportTagText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    largeAnnouncementCta: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        textAlign: 'center',
        opacity: 0.9,
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
    },
});

export default HomeScreen;
