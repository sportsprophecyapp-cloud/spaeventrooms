import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';
import SponsorBanner from '../components/SponsorBanner';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const AnnouncementsScreen = ({ navigation }) => {
    const [sponsors, setSponsors] = React.useState([]);

    React.useEffect(() => {
        fetchSponsors();
    }, []);

    const fetchSponsors = async () => {
        try {
            const data = await apiService.getActiveSponsors();
            setSponsors(data);
        } catch (error) {
            console.error('Failed to fetch sponsors', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ANNOUNCEMENTS</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Sponsor Section - Expanded */}
                <View style={styles.sponsorSection}>
                    <Text style={styles.sectionTitle}>🎁 Support The Sponsors - They Supply The Prizes!</Text>

                    {/* Dynamic Sponsors */}
                    {(Array.isArray(sponsors) ? sponsors : []).map((sponsor) => (
                        <SponsorBanner key={sponsor._id} sponsor={sponsor} style={{ marginTop: SPACING.md }} />
                    ))}

                    {/* Advertise Here Banner (Always valid) */}
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
                            onPress={() => navigation.navigate('Sponsor')}
                        >
                            <LinearGradient
                                colors={['#dc2626', '#ef4444']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.sponsorButtonGradient}
                            >
                                <Text style={styles.sponsorButtonText}>ADVERTISE NOW</Text>
                                <Ionicons name="arrow-forward" size={16} color={COLORS.text.primary} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

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

                {/* Announcements Section - Expanded */}
                <View style={styles.announcementSection}>
                    <Text style={styles.sectionTitle}>📢 Updates</Text>

                    <TouchableOpacity onPress={() => navigation.navigate('WeeklyDraw')}>
                        <LinearGradient
                            colors={['#dc2626', '#b91c1c']}
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
                    </TouchableOpacity>

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
                </View>



                {/* Bottom padding */}
                <View style={{ height: SPACING.xl }} />
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
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        letterSpacing: 1,
    },
    backButton: {
        padding: SPACING.xs,
        width: 40,
    },
    scrollContent: {
        padding: SPACING.base,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.md,
        marginTop: SPACING.lg,
    },
    betaBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.base,
        marginVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.xs,
        ...SHADOWS.md,
    },
    betaText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        letterSpacing: 0.5,
    },
    largeAnnouncementBanner: {
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
});

export default AnnouncementsScreen;
