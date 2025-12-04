import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
    const [stats, setStats] = React.useState({ users: 0, predictions: 0 });

    React.useEffect(() => {
        // Fetch real stats from backend
        fetch('https://sports-prophecy-backend.vercel.app/api/public/stats')
            .then(res => res.json())
            .then(data => {
                setStats({
                    users: data.users || 1000,
                    predictions: data.predictions || 5000
                });
            })
            .catch(err => {
                console.log('Failed to fetch stats, using defaults');
            });
    }, []);

    // Format numbers for display (e.g., 1234 -> 1.2K)
    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
        return `${num}+`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={[COLORS.background.primary, COLORS.background.secondary, COLORS.background.primary]}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>SPORTS <Text style={styles.logoAccent}>PROPHECY</Text></Text>
                        </View>
                    </View>

                    {/* Hero Section with Main Sponsor */}
                    <View style={styles.heroSection}>
                        {/* Main Sponsor Banner */}
                        <LinearGradient
                            colors={[COLORS.accent.purple, COLORS.accent.purpleLight]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.sponsorBanner}
                        >
                            <Text style={styles.sponsorLabel}>MAIN SPONSOR</Text>
                            <Text style={styles.sponsorName}>QUANTUM SPORTS</Text>
                            <Text style={styles.sponsorTagline}>Powering the Future of Predictions</Text>
                        </LinearGradient>

                        {/* Beta Announcement Banner */}
                        <LinearGradient
                            colors={['#10b981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.betaBanner}
                        >
                            <Ionicons name="rocket" size={20} color={COLORS.text.primary} />
                            <Text style={styles.betaText}>🎉 Open now for Beta Version!</Text>
                        </LinearGradient>

                        <Text style={styles.heroTitle}>
                            PREDICT. <Text style={styles.textCyan}>COMPETE.</Text> WIN.
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            100% Free! Sign up and get 60 tokens to start making predictions on your favorite sports
                        </Text>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{formatNumber(stats.users)}</Text>
                                <Text style={styles.statLabel}>Active Users</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>$100K+</Text>
                                <Text style={styles.statLabel}>Prizes Awarded</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{formatNumber(stats.predictions)}</Text>
                                <Text style={styles.statLabel}>Predictions</Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => navigation.navigate('Register')}
                                accessibilityLabel="Sign Up Free Button"
                                testID="landing-signup-button"
                            >
                                <LinearGradient
                                    colors={COLORS.gradients.primary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientButton}
                                >
                                    <Text style={styles.primaryButtonText}>SIGN UP FREE</Text>
                                    <Ionicons name="arrow-forward" size={20} color={COLORS.text.inverse} />
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => navigation.navigate('Login')}
                                accessibilityLabel="Login Button"
                                testID="landing-login-button"
                            >
                                <Text style={styles.secondaryButtonText}>LOGIN</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.browseButton}
                                onPress={() => navigation.navigate('Main')}
                                accessibilityLabel="Browse Without Login Button"
                                testID="landing-browse-button"
                            >
                                <Ionicons name="eye-outline" size={20} color={COLORS.text.secondary} />
                                <Text style={styles.browseButtonText}>Browse Without Login</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.howToPlayButton}
                                onPress={() => navigation.navigate('HowToPlay')}
                                accessibilityLabel="How to Play Button"
                                testID="landing-howtoplay-button"
                            >
                                <Ionicons name="help-circle-outline" size={20} color={COLORS.accent.cyan} />
                                <Text style={styles.howToPlayText}>How to Play</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Features Section */}
                    <View style={styles.featuresSection}>
                        <Text style={styles.sectionTitle}>Why Sports Prophecy?</Text>

                        <View style={styles.featureRow}>
                            <View style={styles.featureCard}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 212, 255, 0.15)' }]}>
                                    <Ionicons name="trophy" size={32} color={COLORS.accent.cyan} />
                                </View>
                                <Text style={styles.featureTitle}>Win Sponsor Prizes</Text>
                                <Text style={styles.featureDesc}>Daily, weekly & seasonal rewards</Text>
                            </View>

                            <View style={styles.featureCard}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                                    <Ionicons name="flash" size={32} color={COLORS.accent.purple} />
                                </View>
                                <Text style={styles.featureTitle}>100% Free</Text>
                                <Text style={styles.featureDesc}>No deposits, no gambling, no risk</Text>
                            </View>
                        </View>

                        <View style={styles.featureRow}>
                            <View style={styles.featureCard}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(195, 255, 0, 0.15)' }]}>
                                    <Ionicons name="football" size={32} color={COLORS.accent.lime} />
                                </View>
                                <Text style={styles.featureTitle}>All Sports</Text>
                                <Text style={styles.featureDesc}>NFL, NBA, NHL, MLB & more</Text>
                            </View>

                            <View style={styles.featureCard}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 212, 255, 0.15)' }]}>
                                    <Ionicons name="people" size={32} color={COLORS.accent.cyan} />
                                </View>
                                <Text style={styles.featureTitle}>Compete</Text>
                                <Text style={styles.featureDesc}>Climb the leaderboards</Text>
                            </View>
                        </View>
                    </View>

                    {/* How It Works */}
                    <View style={styles.howItWorksSection}>
                        <Text style={styles.sectionTitle}>How It Works</Text>

                        <View style={styles.stepCard}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Sign Up Free</Text>
                                <Text style={styles.stepDesc}>Create your account in seconds</Text>
                            </View>
                        </View>

                        <View style={styles.stepCard}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Make Predictions</Text>
                                <Text style={styles.stepDesc}>Pick winners for upcoming games</Text>
                            </View>
                        </View>

                        <View style={styles.stepCard}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Win Prizes</Text>
                                <Text style={styles.stepDesc}>Earn points and claim rewards</Text>
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Privacy Policy  •  Terms of Service</Text>
                        <Text style={styles.copyright}>© 2025 SportsProphecy. All rights reserved.</Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SPACING.xxxl,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
    },
    logoText: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        letterSpacing: 2,
    },
    logoAccent: {
        color: COLORS.accent.cyan,
    },
    heroSection: {
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
        marginBottom: SPACING.xxxl,
    },
    sponsorBanner: {
        width: '100%',
        paddingVertical: SPACING.xl,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        marginBottom: SPACING.xl,
        ...SHADOWS.lg,
    },
    sponsorLabel: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        letterSpacing: 2,
        marginBottom: SPACING.xs,
        opacity: 0.8,
    },
    sponsorName: {
        fontSize: TYPOGRAPHY.sizes.xxxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    sponsorTagline: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.primary,
        opacity: 0.9,
    },
    betaBanner: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.lg,
        marginBottom: SPACING.lg,
        gap: SPACING.sm,
        ...SHADOWS.md,
    },
    betaText: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        letterSpacing: 0.5,
    },
    heroTitle: {
        fontSize: TYPOGRAPHY.sizes.display,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        textAlign: 'center',
        marginBottom: SPACING.md,
        lineHeight: 48,
    },
    textCyan: {
        color: COLORS.accent.cyan,
    },
    heroSubtitle: {
        fontSize: TYPOGRAPHY.sizes.md,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.md,
        lineHeight: 24,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border.secondary,
    },
    statNumber: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.accent.cyan,
        marginBottom: SPACING.xs,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.secondary,
        textAlign: 'center',
    },
    actionButtons: {
        width: '100%',
        gap: SPACING.md,
    },
    primaryButton: {
        height: 56,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        ...SHADOWS.cyan,
    },
    secondaryButton: {
        height: 56,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.accent.cyan,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    primaryButtonText: {
        color: COLORS.text.inverse,
        fontWeight: TYPOGRAPHY.weights.black,
        fontSize: TYPOGRAPHY.sizes.md,
        letterSpacing: 1,
    },
    secondaryButtonText: {
        color: COLORS.accent.cyan,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.md,
        letterSpacing: 1,
    },
    howToPlayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.md,
    },
    howToPlayText: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    browseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'transparent',
    },
    browseButtonText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    featuresSection: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xxxl,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.lg,
    },
    featureRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    featureCard: {
        flex: 1,
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    featureTitle: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    featureDesc: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    howItWorksSection: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xxxl,
    },
    stepCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
        alignItems: 'center',
    },
    stepNumber: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.accent.cyan,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.base,
    },
    stepNumberText: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    stepDesc: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.tertiary,
        marginTop: SPACING.xl,
    },
    footerText: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.sm,
        marginBottom: SPACING.xs,
    },
    copyright: {
        color: COLORS.text.muted,
        fontSize: TYPOGRAPHY.sizes.xs,
    },
});

export default LandingScreen;
