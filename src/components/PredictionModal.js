import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const PredictionModal = ({ visible, onClose, event, onPredictionSuccess }) => {
    const [selectedWinner, setSelectedWinner] = useState(null);
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState({ tokens: 0, crowns: 0 });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { user } = useAuth();

    // Fetch user balance when modal opens
    useEffect(() => {
        if (visible && user) {
            fetchBalance();
        }
    }, [visible, user]);

    const fetchBalance = async () => {
        if (user?.uuid) {
            const userBalance = await apiService.getUserBalance(user.uuid);
            setBalance(userBalance);
        }
    };

    // Reset state when modal opens or event changes
    useEffect(() => {
        if (visible && event) {
            setSelectedWinner(null);
            setHomeScore('');
            setAwayScore('');
        }
    }, [visible, event]);

    if (!event) return null;

    const PREDICTION_COST = 1;
    const hasEnoughTokens = balance.tokens >= PREDICTION_COST;

    const handleSubmit = async () => {
        if (!selectedWinner) {
            setError('Please select a winner');
            return;
        }

        if (!hasEnoughTokens) {
            setError(`Insufficient tokens. Cost: ${PREDICTION_COST}, Balance: ${balance.tokens}`);
            return;
        }

        // Validate that scores match the selected winner (if scores are provided)
        const homeScoreNum = parseInt(homeScore) || 0;
        const awayScoreNum = parseInt(awayScore) || 0;

        // Only validate if both scores are entered
        if (homeScore && awayScore) {
            if (homeScoreNum > awayScoreNum && selectedWinner !== event.homeTeam) {
                setError(`Score contradiction: You selected ${selectedWinner} to win, but entered a score where ${event.homeTeam} wins ${homeScoreNum}-${awayScoreNum}`);
                return;
            }
            if (awayScoreNum > homeScoreNum && selectedWinner !== event.awayTeam) {
                setError(`Score contradiction: You selected ${selectedWinner} to win, but entered a score where ${event.awayTeam} wins ${awayScoreNum}-${homeScoreNum}`);
                return;
            }
            if (homeScoreNum === awayScoreNum) {
                setError('Scores cannot be tied. Please predict a winner with a different score.');
                return;
            }
        }

        setError(null);
        setLoading(true);
        try {
            const result = await apiService.submitPrediction({
                userId: user.uuid,
                eventId: event.id,
                predictedWinner: selectedWinner,
                predictedScores: [homeScoreNum, awayScoreNum],
                eventType: 'matchup'
            });

            // Update balance from response
            if (result.balance) {
                setBalance(result.balance);
            }

            setSuccess(true);

            // Close after delay
            setTimeout(() => {
                onClose();
                if (onPredictionSuccess) onPredictionSuccess();
                // Reset state
                setSuccess(false);
                setSelectedWinner(null);
                setHomeScore('');
                setAwayScore('');
            }, 1500);

        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to submit prediction';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Make Prediction</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close Modal" testID="prediction-modal-close">
                            <Ionicons name="close" size={28} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Balance Display */}
                    <View style={styles.balanceContainer}>
                        <View style={styles.balanceItem}>
                            <Ionicons name="wallet-outline" size={20} color={COLORS.accent.lime} />
                            <Text style={styles.balanceText}>{balance.tokens}</Text>
                            <Text style={styles.balanceLabel}>Tokens</Text>
                        </View>
                        <View style={styles.balanceDivider} />
                        <View style={styles.balanceItem}>
                            <Ionicons name="trophy" size={20} color="#FFD700" />
                            <Text style={styles.balanceText}>{balance.crowns}</Text>
                            <Text style={styles.balanceLabel}>Crowns</Text>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                        {/* Cost Info */}
                        <View style={styles.costCard}>
                            <View style={styles.costRow}>
                                <Text style={styles.costLabel}>Prediction Cost:</Text>
                                <View style={styles.costValue}>
                                    <Ionicons name="wallet-outline" size={16} color={COLORS.accent.lime} />
                                    <Text style={styles.costText}>{PREDICTION_COST} Token</Text>
                                </View>
                            </View>
                        </View>

                        {/* Rewards Info */}
                        <View style={styles.rewardsCard}>
                            <Text style={styles.rewardsTitle}>Potential Rewards</Text>
                            <View style={styles.rewardRow}>
                                <Ionicons name="checkmark-circle" size={18} color={COLORS.status.success} />
                                <Text style={styles.rewardLabel}>Correct Winner:</Text>
                                <View style={styles.rewardValues}>
                                    <View style={styles.rewardValue}>
                                        <Ionicons name="wallet-outline" size={14} color={COLORS.accent.lime} />
                                        <Text style={styles.rewardText}>3</Text>
                                    </View>
                                    <View style={styles.rewardValue}>
                                        <Ionicons name="trophy" size={14} color="#FFD700" />
                                        <Text style={styles.rewardText}>1</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.rewardRow}>
                                <Ionicons name="star" size={18} color="#FFD700" />
                                <Text style={styles.rewardLabel}>Exact Score:</Text>
                                <View style={styles.rewardValues}>
                                    <View style={styles.rewardValue}>
                                        <Ionicons name="trophy" size={14} color="#FFD700" />
                                        <Text style={styles.rewardText}>+1</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Matchup Card */}
                        <View style={styles.matchupCard}>
                            <View style={styles.teamContainer}>
                                <View style={styles.logoContainer}>
                                    <Text style={styles.logoText}>{event.homeTeam?.charAt(0) || 'H'}</Text>
                                </View>
                                <Text style={styles.teamName} numberOfLines={2}>{event.homeTeam || 'Home Team'}</Text>
                            </View>

                            <View style={styles.vsContainer}>
                                <Text style={styles.vsText}>VS</Text>
                            </View>

                            <View style={styles.teamContainer}>
                                <View style={styles.logoContainer}>
                                    <Text style={styles.logoText}>{event.awayTeam?.charAt(0) || 'A'}</Text>
                                </View>
                                <Text style={styles.teamName} numberOfLines={2}>{event.awayTeam || 'Away Team'}</Text>
                            </View>
                        </View>

                        {/* Who will win? */}
                        <Text style={styles.sectionTitle}>Who will win?</Text>
                        <View style={styles.winnerButtons}>
                            <TouchableOpacity
                                style={styles.winnerButton}
                                onPress={() => setSelectedWinner(event.homeTeam)}
                                accessibilityLabel={`Select ${event.homeTeam} as Winner`}
                                testID="prediction-select-home"
                            >
                                <LinearGradient
                                    colors={selectedWinner === event.homeTeam ? COLORS.gradients.primary : ['#2C2C2C', '#2C2C2C']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.winnerGradient}
                                >
                                    <View style={styles.miniLogo}>
                                        <Text style={styles.miniLogoText}>{event.homeTeam?.charAt(0) || 'H'}</Text>
                                    </View>
                                    <Text style={[
                                        styles.winnerButtonText,
                                        selectedWinner === event.homeTeam && styles.winnerButtonTextSelected
                                    ]}>
                                        {event.homeTeam || 'Home'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.winnerButton}
                                onPress={() => setSelectedWinner(event.awayTeam)}
                                accessibilityLabel={`Select ${event.awayTeam} as Winner`}
                                testID="prediction-select-away"
                            >
                                <LinearGradient
                                    colors={selectedWinner === event.awayTeam ? COLORS.gradients.primary : ['#2C2C2C', '#2C2C2C']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.winnerGradient}
                                >
                                    <View style={styles.miniLogo}>
                                        <Text style={styles.miniLogoText}>{event.awayTeam?.charAt(0) || 'A'}</Text>
                                    </View>
                                    <Text style={[
                                        styles.winnerButtonText,
                                        selectedWinner === event.awayTeam && styles.winnerButtonTextSelected
                                    ]}>
                                        {event.awayTeam || 'Away'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Predicted Score */}
                        <Text style={styles.sectionTitle}>Predicted Score (Optional)</Text>
                        <View style={styles.scoreContainer}>
                            <View style={styles.scoreBox}>
                                <Text style={styles.scoreLabel}>{event.homeTeam || 'Home'}</Text>
                                <TextInput
                                    style={styles.scoreInput}
                                    keyboardType="numeric"
                                    value={homeScore}
                                    onChangeText={setHomeScore}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.text.muted}
                                    maxLength={3}
                                    accessibilityLabel={`Score Input for ${event.homeTeam}`}
                                    testID="prediction-score-home"
                                />
                            </View>

                            <View style={styles.scoreDivider}>
                                <Text style={styles.scoreDividerText}>-</Text>
                            </View>

                            <View style={styles.scoreBox}>
                                <Text style={styles.scoreLabel}>{event.awayTeam || 'Away'}</Text>
                                <TextInput
                                    style={styles.scoreInput}
                                    keyboardType="numeric"
                                    value={awayScore}
                                    onChangeText={setAwayScore}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.text.muted}
                                    maxLength={3}
                                    accessibilityLabel={`Score Input for ${event.awayTeam}`}
                                    testID="prediction-score-away"
                                />
                            </View>
                        </View>

                        {/* Error Message */}
                        {error && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color={COLORS.status.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, success && styles.submitButtonSuccess]}
                            onPress={handleSubmit}
                            disabled={loading || !selectedWinner || !hasEnoughTokens || success}
                            accessibilityLabel="Submit Prediction"
                            testID="prediction-submit-button"
                        >
                            <LinearGradient
                                colors={success ? [COLORS.status.success, COLORS.status.success] : (!selectedWinner || !hasEnoughTokens) ? COLORS.gradients.disabled : COLORS.gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.text.inverse} />
                                ) : success ? (
                                    <>
                                        <Text style={styles.submitText}>PREDICTION SUBMITTED</Text>
                                        <Ionicons name="checkmark-circle" size={24} color={COLORS.text.inverse} />
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.submitText}>
                                            {!hasEnoughTokens ? 'INSUFFICIENT TOKENS' : 'SUBMIT PREDICTION'}
                                        </Text>
                                        {hasEnoughTokens && <Ionicons name="arrow-forward" size={20} color={COLORS.text.inverse} />}
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.background.overlay,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: COLORS.background.primary,
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
        padding: SPACING.lg,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        paddingBottom: SPACING.base,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    content: {
        flex: 1,
    },
    matchupCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
        borderWidth: 2,
        borderColor: COLORS.border.primary,
    },
    teamContainer: {
        alignItems: 'center',
        flex: 1,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.background.primary,
        borderWidth: 2,
        borderColor: COLORS.accent.cyan,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    logoText: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    teamName: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        textAlign: 'center',
    },
    vsContainer: {
        paddingHorizontal: SPACING.base,
    },
    vsText: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    sectionTitle: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginBottom: SPACING.md,
    },
    winnerButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    winnerButton: {
        flex: 1,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
    },
    winnerGradient: {
        padding: SPACING.base,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: SPACING.sm,
        minHeight: 60,
    },
    miniLogo: {
        width: 28,
        height: 28,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniLogoText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    winnerButtonText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    winnerButtonTextSelected: {
        color: COLORS.text.inverse,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        gap: SPACING.md,
    },
    scoreBox: {
        flex: 1,
    },
    scoreLabel: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.sm,
        marginBottom: SPACING.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        textAlign: 'center',
    },
    scoreInput: {
        backgroundColor: COLORS.background.card,
        height: 70,
        borderRadius: BORDER_RADIUS.md,
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.xxxl,
        fontWeight: TYPOGRAPHY.weights.black,
        textAlign: 'center',
        borderWidth: 2,
        borderColor: COLORS.border.secondary,
    },
    scoreDivider: {
        paddingTop: SPACING.xl,
    },
    scoreDividerText: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    submitButton: {
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        marginTop: SPACING.base,
        marginBottom: SPACING.lg,
        ...SHADOWS.cyan,
    },
    submitGradient: {
        paddingVertical: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    submitText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 1,
    },
    balanceContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.base,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
        justifyContent: 'space-around',
    },
    balanceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    balanceText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    balanceLabel: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    balanceDivider: {
        width: 1,
        backgroundColor: COLORS.border.secondary,
        marginHorizontal: SPACING.sm,
    },
    costCard: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.accent.cyan + '40',
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    costLabel: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    costValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    costText: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    rewardsCard: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.base,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.status.success + '40',
    },
    rewardsTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.sm,
    },
    rewardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginVertical: SPACING.xs,
    },
    rewardLabel: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.medium,
        flex: 1,
    },
    rewardValues: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    rewardValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.background.primary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    rewardText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.status.error + '20',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.md,
        gap: SPACING.sm,
    },
    errorText: {
        color: COLORS.status.error,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.medium,
        flex: 1,
    },
    submitButtonSuccess: {
        ...SHADOWS.none,
    },
});

export default PredictionModal;
