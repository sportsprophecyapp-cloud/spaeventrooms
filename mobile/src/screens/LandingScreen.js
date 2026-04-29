import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import AppleSignInButton from '../components/AppleSignInButton';

import WinnerSpotlight from '../components/WinnerSpotlight';

import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import FirstTimeUserView from '../components/FirstTimeUserView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_VERSION } from '../constants/version';


const { width, height } = Dimensions.get('window');
const { Platform } = require('react-native');


const LandingScreen = ({ navigation }) => {
    const { loginAsGuest } = useAuth();
    const [stats, setStats] = React.useState({ users: 0, predictions: 0 });
    const [featuredWinner, setFeaturedWinner] = React.useState(null);
    const [authMode, setAuthMode] = React.useState('login'); // Default to login in the section
    const [isFirstTime, setIsFirstTime] = React.useState(null); // null (loading), true, false
    const scrollRef = React.useRef(null);
    const authSectionY = React.useRef(0);


    React.useEffect(() => {
        // Fetch real stats
        apiService.getPublicStats()
            .then(data => {
                setStats({
                    users: data.users || 1000,
                    predictions: data.predictions || 5000
                });
            })
            .catch(err => {
                // Use defaults if fetch fails
            });

        // Fetch Featured Winner
        apiService.getFeaturedWinner()
            .then(winner => {
                if (winner) setFeaturedWinner(winner);
            })
            .catch(err => console.log('No featured winner found or error', err));

        // Check for onboarding status
        const checkOnboarding = async () => {
            try {
                const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
                setIsFirstTime(hasSeen !== 'true');
            } catch (e) {
                console.error('Failed to check onboarding', e);
                setIsFirstTime(false);
            }
        };
        checkOnboarding();
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
            <ImageBackground
                source={require('../../assets/landing_bg.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['rgba(10, 22, 40, 0.85)', 'rgba(10, 22, 40, 0.95)']}
                    style={styles.gradientOverlay}
                />
            </ImageBackground>

            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >

                    {/* Hero Section */}

                    <View style={styles.heroSection}>

                        <View style={styles.taglineContainer}>
                            <Text style={styles.topTagline}>FREE & ENTERTAINING</Text>
                        </View>
                        <Text style={styles.heroTitleMain}>
                            Events Arena
                        </Text>

                        <View style={styles.forecastContainer}>
                            <Ionicons name="cash-outline" size={28} color={COLORS.accent.gold} style={{ marginRight: 8 }} />
                            <Text style={styles.forecastText}>FORECAST</Text>
                            <Ionicons name="trophy" size={28} color={COLORS.accent.gold} style={{ marginLeft: 8 }} />
                        </View>

                        <Text style={styles.forecastSubtext}>GAME OUTCOMES</Text>

                        <Text style={styles.heroSubtitle}>
                            EARN TOKENS & CROWNS | SPONSOR PRIZE DRAWS
                        </Text>

                        {/* Recent Winner Spotlight */}
                        <WinnerSpotlight winner={featuredWinner} />

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{formatNumber(stats.users)}</Text>
                                <Text style={styles.statLabel}>Active Users</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>OPEN</Text>
                                <Text style={styles.statLabel}>Prize Draws</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{formatNumber(stats.predictions)}</Text>
                                <Text style={styles.statLabel}>Predictions</Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => {
                                    setAuthMode('register');
                                    scrollRef.current?.scrollTo({ y: authSectionY.current, animated: true });
                                }}
                                accessibilityLabel="Sign Up Free Button"
                                testID="landing-signup-button"
                            >
                                <LinearGradient
                                    colors={COLORS.gradients.gold}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientButton}
                                >
                                    <Text style={[styles.primaryButtonText, { color: COLORS.text.inverse }]}>SIGN UP FREE</Text>
                                    <Ionicons name="arrow-forward" size={20} color={COLORS.text.inverse} />
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => {
                                    setAuthMode('login');
                                    scrollRef.current?.scrollTo({ y: authSectionY.current, animated: true });
                                }}
                                accessibilityLabel="Login Button"
                                testID="landing-login-button"
                            >
                                <Text style={styles.secondaryButtonText}>LOGIN</Text>
                            </TouchableOpacity>


                            <View style={styles.socialButtons}>
                                <GoogleSignInButton variant="standard" />
                                <AppleSignInButton />
                            </View>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={loginAsGuest}
                                accessibilityLabel="Play Now Button"
                                testID="landing-play-now-button"
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent.lime }} />
                                    <Text style={styles.secondaryButtonText}>PLAY NOW AS GUEST</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Features Section */}
                    <View style={styles.featuresSection}>
                        <Text style={styles.sectionTitle}>Why Events Arena?</Text>

                        <View style={styles.featureRow}>
                            <View style={styles.featureCard}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 212, 255, 0.15)' }]}>
                                    <Ionicons name="trophy" size={32} color={COLORS.accent.cyan} />
                                </View>
                                <Text style={styles.featureTitle}>Get Sponsor Rewards</Text>
                                <Text style={styles.featureDesc}>Daily, weekly & seasonal rewards</Text>
                            </View>

                            <View style={styles.featureCard}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                                    <Ionicons name="flash" size={32} color={COLORS.accent.purple} />
                                </View>
                                <Text style={styles.featureTitle}>100% Free</Text>
                                <Text style={styles.featureDesc}>No deposits, no purchases, no risk</Text>
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

                        <View style={styles.stepsGrid}>
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
                                    <Text style={styles.stepTitle}>Claim Rewards</Text>
                                    <Text style={styles.stepDesc}>Earn points and claim prizes</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Integrated Auth Section */}
                    <View
                        style={styles.authSection}
                        onLayout={(event) => {
                            authSectionY.current = event.nativeEvent.layout.y;
                        }}
                    >
                        <Text style={styles.sectionTitle} accessibilityRole="header">
                            {authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
                        </Text>
                        <Text style={styles.sectionSubtitle}>
                            {authMode === 'login'
                                ? 'Sign in to manage your predictions and rewards'
                                : 'Join thousands of fans and start winning today'}
                        </Text>

                        {authMode === 'login' ? (
                            <LoginScreen
                                isEmbedded={true}
                                onToggleMode={() => setAuthMode('register')}
                                navigation={navigation}
                            />
                        ) : (
                            <RegisterScreen
                                isEmbedded={true}
                                onToggleMode={() => setAuthMode('login')}
                                navigation={navigation}
                            />
                        )}
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.footerLinks}>
                            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                                <Text style={styles.footerLink}>Privacy Policy</Text>
                            </TouchableOpacity>
                            <Text style={styles.footerText}>  •  </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
                                <Text style={styles.footerLink}>Terms of Service</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.copyright}>© 2025 Events Arena. All rights reserved.</Text>
                        <Text style={styles.versionDisplay}>v{APP_VERSION}</Text>
                    </View>

                    {/* Trust Section: Founder's Letter */}
                    <View style={styles.letterContainer}>
                        <View style={styles.letterBody}>
                            <View style={styles.letterHeader}>
                                <Text style={styles.companyName}>JUST ME MEDIA</Text>
                                <Text style={styles.letterDate}>EST. 2025</Text>
                            </View>

                            <Text style={styles.letterText}>
                                "I built <Text style={{ fontWeight: 'bold', color: COLORS.accent.gold }}>Events Arena</Text> to give fans and sponsors a platform where both can equally benefit.
                                {"\n\n"}
                                I wanted to create more than just a game—I'm building a large-scale ecosystem of entertainment that rewards sports knowledge without financial risk.
                                {"\n\n"}
                                As a solo developer, your feedback during this beta is everything to me. This is a journey to build a community where everyone wins."
                            </Text>

                            <View style={styles.letterFooter}>
                                <Text style={styles.letterSignature}>William</Text>
                                <Text style={styles.letterTitle}>Founder, Just Me Media</Text>
                            </View>
                        </View>
                    </View>

                    {/* Final Legal Summary */}
                    <View style={styles.legalSummary}>
                        <Ionicons name="shield-checkmark" size={16} color={COLORS.text.muted} />
                        <Text style={styles.legalSummaryText}>
                            100% Free to Play • No Deposits • No Purchases • Skill-Based Only
                        </Text>
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* First Time User Onboarding Overlay */}
            {isFirstTime === true && (
                <View style={[StyleSheet.absoluteFill, { zIndex: 2000 }]}>
                    <FirstTimeUserView
                        navigation={navigation}
                        onComplete={() => setIsFirstTime(false)}
                    />
                </View>
            )}
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
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        color: COLORS.text.inverse,
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
    taglineContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    topTagline: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.inverse,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    heroTitleMain: {
        fontSize: width < 380 ? 40 : 56,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.accent.gold,
        textAlign: 'center',
        marginBottom: SPACING.sm,
        lineHeight: width < 380 ? 44 : 60,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    forecastContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
    },
    forecastText: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
        fontStyle: 'italic',
        letterSpacing: 1,
    },
    forecastSubtext: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
        fontStyle: 'italic',
        marginBottom: SPACING.md,
        letterSpacing: 1,
    },
    heroSubtitle: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.accent.gold,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.md,
        letterSpacing: 1,
        textTransform: 'uppercase',
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
        borderColor: COLORS.accent.gold,
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
        color: COLORS.accent.gold,
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
    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    footerLink: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    copyright: {
        color: COLORS.text.muted,
        fontSize: TYPOGRAPHY.sizes.xs,
        marginBottom: SPACING.xs,
    },
    versionDisplay: {
        color: COLORS.text.muted,
        fontSize: 10,
        opacity: 0.8,
        marginBottom: SPACING.md,
    },
    letterContainer: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    letterBody: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        padding: 30,
        // No box-shadow offset in RN without complex views, so using standard shadows
        shadowColor: COLORS.accent.gold,
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 0,
        elevation: 2,
    },
    letterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 20,
        paddingBottom: 10,
    },
    companyName: {
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: '900',
        color: COLORS.accent.gold,
    },
    letterDate: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.4)',
    },
    letterText: {
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontStyle: 'italic',
        fontSize: 15,
        lineHeight: 24,
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: 20,
    },
    letterFooter: {
        marginTop: 10,
    },
    letterSignature: {
        // Fallback for handwriting font if not loaded
        fontSize: 28,
        color: COLORS.accent.gold,
        fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive',
        marginTop: 10,
    },
    letterTitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        textTransform: 'uppercase',
        marginTop: 5,
    },
    legalSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        padding: SPACING.md,
        backgroundColor: COLORS.background.secondary,
        marginBottom: SPACING.xxxl,
    },
    legalSummaryText: {
        fontSize: 10,
        color: COLORS.text.muted,
        fontWeight: TYPOGRAPHY.weights.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    stepsGrid: {
        gap: SPACING.md,
    },
    authSection: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xxxl,
        backgroundColor: COLORS.background.secondary,
        marginHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
        marginVertical: SPACING.xxl,
        ...SHADOWS.md,
    },
    sectionSubtitle: {
        fontSize: TYPOGRAPHY.sizes.md,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.md,
    },
    socialButtons: {
        width: '100%',
        gap: SPACING.md,
        marginTop: SPACING.xs,
    },
});

export default LandingScreen;
