import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * DailyRewardModal Component
 * Beautiful animated modal for displaying daily login rewards
 */
const DailyRewardModal = ({ visible, onClose, rewardData }) => {
    const scaleAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: Platform.OS !== 'web',
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible]);

    if (!rewardData) return null;

    const { tokens = 0, crowns = 0, streak = 0, isStreakBonus = false } = rewardData;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient
                        colors={COLORS.gradients.gold}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    >
                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>

                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <Ionicons name="gift" size={64} color={COLORS.text.inverse} />
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>
                            {isStreakBonus ? '🔥 STREAK BONUS!' : '🎉 DAILY REWARD!'}
                        </Text>

                        {/* Subtitle */}
                        <Text style={styles.subtitle}>
                            {isStreakBonus
                                ? `${streak}-Day Login Streak!`
                                : 'Welcome back!'}
                        </Text>

                        {/* Rewards Display */}
                        <View style={styles.rewardsContainer}>
                            {tokens > 0 && (
                                <View style={styles.rewardItem}>
                                    <Ionicons name="wallet" size={40} color={COLORS.text.inverse} />
                                    <Text style={styles.rewardAmount}>+{tokens}</Text>
                                    <Text style={styles.rewardLabel}>Tokens</Text>
                                </View>
                            )}
                            {crowns > 0 && (
                                <View style={styles.rewardItem}>
                                    <Ionicons name="trophy" size={40} color={COLORS.text.inverse} />
                                    <Text style={styles.rewardAmount}>+{crowns}</Text>
                                    <Text style={styles.rewardLabel}>Crowns</Text>
                                </View>
                            )}
                        </View>

                        {/* Streak Info */}
                        {streak > 0 && (
                            <View style={styles.streakInfoContainer}>
                                <View style={styles.streakCounterRow}>
                                    <View style={styles.streakBadge}>
                                        <Ionicons name="flame" size={20} color={COLORS.text.inverse} />
                                        <Text style={styles.streakText}>
                                            {streak} Day Streak
                                        </Text>
                                    </View>
                                    <View style={styles.weeklyProgressBadge}>
                                        <Text style={styles.weeklyProgressText}>
                                            Day {((streak - 1) % 7) + 1}/7
                                        </Text>
                                    </View>
                                </View>

                                {/* Progress Dots */}
                                <View style={styles.dotsContainer}>
                                    {[1, 2, 3, 4, 5, 6, 7].map((dot) => {
                                        const currentDay = ((streak - 1) % 7) + 1;
                                        const isCompleted = dot <= currentDay;
                                        const isToday = dot === currentDay;

                                        return (
                                            <View
                                                key={dot}
                                                style={[
                                                    styles.dot,
                                                    isCompleted && styles.completedDot,
                                                    isToday && styles.todayDot
                                                ]}
                                            >
                                                {isToday ? (
                                                    <Ionicons name="star" size={10} color={COLORS.text.inverse} />
                                                ) : isCompleted ? (
                                                    <Ionicons name="checkmark" size={10} color={COLORS.text.inverse} />
                                                ) : null}
                                            </View>
                                        );
                                    })}
                                </View>
                                <Text style={styles.weeklyHint}>
                                    {((streak - 1) % 7) + 1 === 7
                                        ? "Weekly Bonus Claimed! 🔥"
                                        : `${7 - (((streak - 1) % 7) + 1)} days until your next Weekly Bonus!`}
                                </Text>
                            </View>
                        )}

                        {/* Claim Button */}
                        <TouchableOpacity style={styles.claimButton} onPress={onClose}>
                            <LinearGradient
                                colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.5)']}
                                style={styles.claimGradient}
                            >
                                <Text style={styles.claimText}>CLAIM REWARD</Text>
                                <Ionicons name="checkmark-circle" size={24} color={COLORS.text.primary} />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Next Reward Hint */}
                        <Text style={styles.hintText}>
                            {isStreakBonus
                                ? 'Keep your streak going!'
                                : `Come back tomorrow for more rewards!`}
                        </Text>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.lg,
    },
    gradient: {
        padding: SPACING.xxl,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        zIndex: 10,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.xxxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
        textAlign: 'center',
        marginBottom: SPACING.xs,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.inverse,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        opacity: 0.9,
    },
    rewardsContainer: {
        flexDirection: 'row',
        gap: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    rewardItem: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        minWidth: 120,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    rewardAmount: {
        fontSize: TYPOGRAPHY.sizes.xxxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
        marginTop: SPACING.sm,
    },
    rewardLabel: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.inverse,
        marginTop: SPACING.xs,
        opacity: 0.9,
    },
    streakInfoContainer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    streakCounterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
    },
    weeklyProgressBadge: {
        backgroundColor: COLORS.accent.lime,
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    weeklyProgressText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.xs,
    },
    dot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    completedDot: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderColor: COLORS.text.inverse,
    },
    todayDot: {
        backgroundColor: COLORS.accent.cyan,
        borderColor: COLORS.text.inverse,
        transform: [{ scale: 1.1 }],
    },
    streakText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.inverse,
    },
    weeklyHint: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.inverse,
        textAlign: 'center',
        opacity: 0.9,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    claimButton: {
        width: '100%',
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        marginBottom: SPACING.base,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    claimGradient: {
        paddingVertical: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    claimText: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        letterSpacing: 1,
    },
    hintText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.inverse,
        textAlign: 'center',
        opacity: 0.8,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
});

export default DailyRewardModal;
