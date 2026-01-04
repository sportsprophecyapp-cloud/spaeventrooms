import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const HowToPlayScreen = () => {
    const navigation = useNavigation();
    const { loginAsGuest, user } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleStartPlaying = async () => {
        // If already logged in, just go to Main
        if (user) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
            return;
        }

        setIsLoading(true);
        try {
            await loginAsGuest();
            // Explicit navigation since we removed auto-redirect in App.js
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } catch (error) {
            console.error('Failed to start playing:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>How to Play</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Legal Banner */}
                <View style={styles.complianceBanner}>
                    <Text style={styles.complianceBannerTitle}>
                        ✓ Legal & Compliant
                    </Text>
                    <Text style={styles.complianceBannerText}>
                        Sports Prophecy is a skill-based prediction platform. No purchase
                        necessary. No gambling. No risk. Prizes awarded through sweepstakes
                        drawings administered by Sports Prophecy LLC. Odds vary based on
                        number of eligible entries.
                    </Text>
                </View>

                {/* Getting Started */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🚀 Getting Started</Text>

                    <View style={styles.stepCard}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Create Your Account</Text>
                            <Text style={styles.stepDescription}>
                                Sign up with your email to get started. New users receive:
                            </Text>
                            <View style={styles.rewardRow}>
                                <Ionicons name="wallet-outline" size={16} color={COLORS.accent.lime} />
                                <Text style={styles.rewardText}>50 Tokens</Text>
                            </View>
                            <View style={styles.rewardRow}>
                                <Ionicons name="trophy" size={16} color="#FFD700" />
                                <Text style={styles.rewardText}>5 Crowns</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.stepCard}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Browse Games</Text>
                            <Text style={styles.stepDescription}>
                                View upcoming games across NFL, NBA, NHL, MLB, EPL, and MLS. Filter by sport or browse all games.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepCard}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Make Predictions</Text>
                            <Text style={styles.stepDescription}>
                                Click "Make Prediction" on any game. Select the winning team and optionally predict the exact score.
                            </Text>
                            <View style={styles.costBadge}>
                                <Ionicons name="wallet-outline" size={14} color={COLORS.accent.lime} />
                                <Text style={styles.costText}>Cost: 1 Token</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.stepCard}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Earn Rewards</Text>
                            <Text style={styles.stepDescription}>
                                When your prediction is correct, you earn:
                            </Text>
                            <View style={styles.rewardRow}>
                                <Ionicons name="checkmark-circle" size={16} color={COLORS.status.success} />
                                <Text style={styles.rewardText}>Correct Winner: +3 Tokens, +1 Crown</Text>
                            </View>
                            <View style={styles.rewardRow}>
                                <Ionicons name="star" size={16} color="#FFD700" />
                                <Text style={styles.rewardText}>Exact Score: +1 Bonus Crown</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.stepCard}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>5</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Enter Prize Draws</Text>
                            <Text style={styles.stepDescription}>
                                Use your crowns to enter weekly prize draws for a chance to win prizes from our sponsors!
                            </Text>
                            <View style={styles.costBadge}>
                                <Ionicons name="trophy" size={14} color="#FFD700" />
                                <Text style={styles.costText}>Cost: 1 Crown per entry</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Reward System */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💰 Reward System</Text>

                    <LinearGradient
                        colors={['rgba(195, 255, 0, 0.1)', 'rgba(195, 255, 0, 0.05)']}
                        style={styles.infoCard}
                    >
                        <View style={styles.infoHeader}>
                            <Ionicons name="wallet-outline" size={24} color={COLORS.accent.lime} />
                            <Text style={styles.infoTitle}>Tokens</Text>
                        </View>
                        <Text style={styles.infoDescription}>
                            Tokens are used to make predictions. Earn more by winning predictions and logging in daily.
                        </Text>
                        <View style={styles.infoList}>
                            <Text style={styles.infoItem}>• New users: 50 tokens</Text>
                            <Text style={styles.infoItem}>• Daily login: +5 tokens</Text>
                            <Text style={styles.infoItem}>• Correct prediction: +3 tokens</Text>
                            <Text style={styles.infoItem}>• Prediction cost: -1 token</Text>
                        </View>
                    </LinearGradient>

                    <LinearGradient
                        colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 215, 0, 0.05)']}
                        style={styles.infoCard}
                    >
                        <View style={styles.infoHeader}>
                            <Ionicons name="trophy" size={24} color="#FFD700" />
                            <Text style={styles.infoTitle}>Crowns</Text>
                        </View>
                        <Text style={styles.infoDescription}>
                            Crowns are premium currency used to enter prize draws. Earn them by winning predictions!
                        </Text>
                        <View style={styles.infoList}>
                            <Text style={styles.infoItem}>• New users: 5 crowns</Text>
                            <Text style={styles.infoItem}>• Correct prediction: +1 crown</Text>
                            <Text style={styles.infoItem}>• Exact score: +1 bonus crown</Text>
                            <Text style={styles.infoItem}>• 7-day login streak: +10 tokens, +5 crowns</Text>
                            <Text style={styles.infoItem}>• Prize draw entry: -1 crown</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Daily Login Bonus */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Daily Login Bonus</Text>
                    <LinearGradient
                        colors={COLORS.gradients.primary}
                        style={styles.bonusCard}
                    >
                        <Text style={styles.bonusTitle}>100% Free to Play!</Text>
                        <Text style={styles.bonusDescription}>
                            No deposits, no gambling, no risk. Earn rewards from our sponsors by making accurate predictions. Login daily for bonus tokens and build your streak for crown rewards!
                        </Text>
                        <View style={styles.streakInfo}>
                            <Ionicons name="flame" size={20} color={COLORS.text.inverse} />
                            <Text style={styles.streakText}>7-Day Streak = +10 Tokens & +5 Crowns</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Tips */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
                    <View style={styles.tipCard}>
                        <Ionicons name="bulb" size={20} color={COLORS.accent.cyan} />
                        <Text style={styles.tipText}>
                            You can only predict on each game once - choose wisely!
                        </Text>
                    </View>
                    <View style={styles.tipCard}>
                        <Ionicons name="bulb" size={20} color={COLORS.accent.cyan} />
                        <Text style={styles.tipText}>
                            Predicted scores must match your selected winner - the app validates this for you.
                        </Text>
                    </View>
                    <View style={styles.tipCard}>
                        <Ionicons name="bulb" size={20} color={COLORS.accent.cyan} />
                        <Text style={styles.tipText}>
                            Prize draw entries require two clicks to prevent accidental entries.
                        </Text>
                    </View>
                    <View style={styles.tipCard}>
                        <Ionicons name="bulb" size={20} color={COLORS.accent.cyan} />
                        <Text style={styles.tipText}>
                            Check the leaderboard to see how you rank against other players!
                        </Text>
                    </View>
                </View>

                {/* Get Started Button */}
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleStartPlaying}
                    disabled={isLoading}
                >
                    <LinearGradient
                        colors={COLORS.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.startGradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={COLORS.text.inverse} />
                        ) : (
                            <>
                                <Text style={styles.startText}>START PLAYING</Text>
                                <Ionicons name="arrow-forward" size={20} color={COLORS.text.inverse} />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
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
    content: {
        padding: SPACING.base,
    },
    videoSection: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.md,
    },
    video: {
        width: 280,
        height: 158, // 16:9 ratio of 280
        alignSelf: 'center',
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: '#000',
        marginBottom: SPACING.sm,
    },

    section: {
        marginBottom: SPACING.xl,
    },
    stepCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.accent.cyan,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    stepNumberText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.xs,
    },
    stepDescription: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        lineHeight: 20,
        marginBottom: SPACING.sm,
    },
    rewardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginTop: SPACING.xs,
    },
    rewardText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    costBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background.primary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
        alignSelf: 'flex-start',
        gap: SPACING.xs,
        marginTop: SPACING.sm,
    },
    costText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    infoCard: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    infoTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    infoDescription: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        lineHeight: 20,
        marginBottom: SPACING.sm,
    },
    infoList: {
        gap: SPACING.xs,
    },
    infoItem: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        lineHeight: 20,
    },
    bonusCard: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
    },
    bonusTitle: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.black,
        marginBottom: SPACING.sm,
    },
    bonusDescription: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.sm,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: SPACING.md,
    },
    streakInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    streakText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.base,
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.accent.cyan,
    },
    tipText: {
        flex: 1,
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        lineHeight: 20,
    },
    startButton: {
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        marginTop: SPACING.base,
        marginBottom: SPACING.xl,
        ...SHADOWS.cyan,
    },
    startGradient: {
        paddingVertical: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    startText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 1,
    },
    complianceBanner: {
        backgroundColor: '#F3F4F6',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    complianceBannerTitle: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: 'bold',
        color: '#059669', // Green color
        marginBottom: 4,
    },
    complianceBannerText: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
    },
});

export default HowToPlayScreen;
