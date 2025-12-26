import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getTeamLogo } from '../utils/teamLogos';

const CONFIDENCE_OPTIONS = [
    {
        id: 'normal',
        label: 'Standard',
        tokenCost: 1,
        crownReward: 1,
        description: 'Standard prediction',
    },
    {
        id: 'confident',
        label: 'Confident',
        tokenCost: 2,
        crownReward: 3,
        description: '3x reward if correct',
    },
    {
        id: 'lock',
        label: 'Lock Pick 🔒',
        tokenCost: 5,
        crownReward: 10,
        description: '10x reward if correct!',
        badge: 'ADVANCED',
    },
];

const PredictionModal = ({ visible, onClose, event, onPredictionSuccess, onLoadNextGame }) => {
    const [selectedWinner, setSelectedWinner] = useState(null);
    const [confidenceLevel, setConfidenceLevel] = useState('normal');
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, updateUser } = useAuth();
    const [balance, setBalance] = useState({
        tokens: user?.tokens || 0,
        crowns: user?.crowns || 0
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Update balance from context when user changes
    useEffect(() => {
        if (user) {
            setBalance(prev => ({
                ...prev,
                tokens: user.tokens || prev.tokens,
                crowns: user.crowns || prev.crowns
            }));
        }
    }, [user]);

    // Fetch latest balance when modal opens
    useEffect(() => {
        if (visible && user) {
            fetchBalance();
        }
    }, [visible, user]);

    const fetchBalance = async () => {
        if (user?.uuid && !user.isGuest) {
            try {
                const userBalance = await apiService.getUserBalance(user.uuid);
                if (userBalance && (userBalance.tokens !== undefined)) {
                    setBalance(userBalance);
                }
            } catch (err) {
                // Failed to fetch latest balance, use context
            }
        }
    };

    // Reset state when modal opens or event changes
    useEffect(() => {
        if (visible && event) {
            setSelectedWinner(null);
            setConfidenceLevel('normal');
            setHomeScore('');
            setAwayScore('');
        }
    }, [visible, event]);

    if (!event) return null;

    if (!event) return null;

    const selectedOption = CONFIDENCE_OPTIONS.find(o => o.id === confidenceLevel);
    const PREDICTION_COST = selectedOption ? selectedOption.tokenCost : 1;
    const hasEnoughTokens = balance.tokens >= PREDICTION_COST;

    const handleSubmit = async () => {
        // if (user.isGuest) {
        //     Alert.alert(
        //         'Sign Up Required',
        //         'You must create an account to make predictions and win prizes!',
        //         [
        //             { text: 'Cancel', style: 'cancel' },
        //             { text: 'Sign Up', onPress: () => onClose() } // Ideally navigate to Register, but modal close + separate nav is simpler for now, or we can assume user knows how to logout/signup
        //         ]
        //     );
        //     return;
        // }

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
            if (user.isGuest) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Deduct token locally and add to predicted games
                const currentPredictedGames = user.predictedGames || [];
                updateUser({
                    tokens: user.tokens - PREDICTION_COST,
                    predictedGames: [...currentPredictedGames, event.id]
                });
                setBalance(prev => ({ ...prev, tokens: prev.tokens - PREDICTION_COST }));

                setSuccess(true);

                setTimeout(async () => { // Async for consistency with main flow
                    // Do NOT call onPredictionSuccess for guests here.
                    // The updateUser call triggers a user change, which triggers useEffect in parent screens to refresh events.
                    // Calling it here explicitly causes a race condition with a stale user object.

                    // Try to load next game
                    if (onLoadNextGame) {
                        const nextEvent = await onLoadNextGame(event.id); // Pass current ID to ignore
                        if (nextEvent) {
                            // Reset state for next game
                            setSuccess(false);
                            setSelectedWinner(null);
                            setHomeScore('');
                            setAwayScore('');
                            setError(null);
                            return;
                        }
                    }

                    onClose();
                    setSuccess(false);
                    setSelectedWinner(null);
                    setHomeScore('');
                    setAwayScore('');
                }, 500);
                return;
            }

            const result = await apiService.submitPrediction({
                userId: user.uuid,
                eventId: event.id,
                predictedWinner: selectedWinner,
                predictedScores: [homeScoreNum, awayScoreNum],
                predictedWinner: selectedWinner,
                predictedScores: [homeScoreNum, awayScoreNum],
                eventType: 'matchup',
                confidenceLevel: confidenceLevel,
            });

            // Update balance from response or manual decrement
            const newTokens = (result.balance?.tokens !== undefined)
                ? result.balance.tokens
                : (user.tokens - PREDICTION_COST);

            const newCrowns = (result.balance?.crowns !== undefined)
                ? result.balance.crowns
                : user.crowns;

            // Update global user state to ensure header/other screens reflect change
            await updateUser({ tokens: newTokens, crowns: newCrowns });

            // Update local state
            setBalance({ tokens: newTokens, crowns: newCrowns });

            setSuccess(true);

            // Auto-load next game or close after delay
            setTimeout(async () => {
                // Refresh events first
                if (onPredictionSuccess) onPredictionSuccess();

                // Try to load next game
                if (onLoadNextGame) {
                    const nextEvent = await onLoadNextGame(event.id); // Pass current ID to ignore
                    if (nextEvent) {
                        // Reset state for next game
                        setSuccess(false);
                        setSelectedWinner(null);
                        setHomeScore('');
                        setAwayScore('');
                        setError(null);
                        // Modal stays open with new event
                        return;
                    }
                }

                // No next game, close modal
                onClose();
                setSuccess(false);
                setSelectedWinner(null);
                setHomeScore('');
                setAwayScore('');
            }, 500);

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
                                    <Text style={styles.costText}>{PREDICTION_COST} Tokens</Text>
                                </View>
                            </View>
                        </View>

                        {/* Confidence Selector */}
                        <Text style={styles.sectionTitle}>Confidence Level</Text>
                        <View style={styles.confidenceSelector}>
                            {CONFIDENCE_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.confidenceOption,
                                        confidenceLevel === option.id && styles.confidenceOptionSelected,
                                    ]}
                                    onPress={() => setConfidenceLevel(option.id)}
                                >
                                    <View style={styles.confidenceHeader}>
                                        <Text style={[styles.confidenceLabel, confidenceLevel === option.id && styles.confidenceLabelSelected]}>
                                            {option.label}
                                        </Text>
                                        {option.badge && (
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{option.badge}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.confidenceDesc, confidenceLevel === option.id && styles.confidenceDescSelected]}>
                                        {option.description}
                                    </Text>
                                    <View style={styles.confidenceCost}>
                                        <Text style={[styles.costLabelSmall, confidenceLevel === option.id && styles.costLabelSmallSelected]}>
                                            Cost: {option.tokenCost}
                                        </Text>
                                        <Text style={[styles.rewardLabelSmall, confidenceLevel === option.id && styles.rewardLabelSmallSelected]}>
                                            Win: {option.crownReward}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
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

                        {/* Matchup Card - Interactive for Selection */}
                        <Text style={styles.sectionTitle}>Tap Team to Select Winner</Text>
                        <View style={styles.matchupCard}>
                            <TouchableOpacity
                                style={[
                                    styles.teamContainer,
                                    selectedWinner && selectedWinner !== event.homeTeam && styles.teamUnselected
                                ]}
                                onPress={() => setSelectedWinner(event.homeTeam)}
                                accessibilityLabel={`Select ${event.homeTeam} as Winner`}
                                testID="prediction-select-home"
                            >
                                <View style={[
                                    styles.logoContainer,
                                    selectedWinner === event.homeTeam && styles.logoSelected
                                ]}>
                                    {getTeamLogo(event.homeTeam) ? (
                                        <Image
                                            source={{ uri: getTeamLogo(event.homeTeam) }}
                                            style={styles.logoImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <Text style={styles.logoText}>{event.homeTeam?.charAt(0) || 'H'}</Text>
                                    )}
                                    {selectedWinner === event.homeTeam && (
                                        <View style={styles.checkBadge}>
                                            <Ionicons name="checkmark" size={16} color={COLORS.text.inverse} />
                                        </View>
                                    )}
                                </View>
                                <Text style={[
                                    styles.teamName,
                                    selectedWinner === event.homeTeam && styles.teamNameSelected
                                ]} numberOfLines={2}>{event.homeTeam || 'Home Team'}</Text>
                            </TouchableOpacity>

                            <View style={styles.vsContainer}>
                                <Text style={styles.vsText}>VS</Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.teamContainer,
                                    selectedWinner && selectedWinner !== event.awayTeam && styles.teamUnselected
                                ]}
                                onPress={() => setSelectedWinner(event.awayTeam)}
                                accessibilityLabel={`Select ${event.awayTeam} as Winner`}
                                testID="prediction-select-away"
                            >
                                <View style={[
                                    styles.logoContainer,
                                    selectedWinner === event.awayTeam && styles.logoSelected
                                ]}>
                                    {getTeamLogo(event.awayTeam) ? (
                                        <Image
                                            source={{ uri: getTeamLogo(event.awayTeam) }}
                                            style={styles.logoImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <Text style={styles.logoText}>{event.awayTeam?.charAt(0) || 'A'}</Text>
                                    )}
                                    {selectedWinner === event.awayTeam && (
                                        <View style={styles.checkBadge}>
                                            <Ionicons name="checkmark" size={16} color={COLORS.text.inverse} />
                                        </View>
                                    )}
                                </View>
                                <Text style={[
                                    styles.teamName,
                                    selectedWinner === event.awayTeam && styles.teamNameSelected
                                ]} numberOfLines={2}>{event.awayTeam || 'Away Team'}</Text>
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

                    </ScrollView>

                    {/* Fixed Footer with Submit Button */}
                    <View style={styles.footerContainer}>
                        {/* Error Message - Inline above button if needed */}
                        {error && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color={COLORS.status.error} />
                                <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, success && styles.submitButtonSuccess]}
                            onPress={handleSubmit}
                            disabled={loading || !selectedWinner || !hasEnoughTokens || success}
                            accessibilityLabel="Submit Prediction"
                            testID="prediction-submit-button"
                        >
                            <LinearGradient
                                colors={success ? [COLORS.status.success, COLORS.status.success] : (!selectedWinner || !hasEnoughTokens) ? COLORS.gradients.disabled : ['#2979FF', '#00B0FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.text.inverse} />
                                ) : success ? (
                                    <>
                                        <Text style={styles.submitText}>PREDICTION SAVED</Text>
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

                        <Text style={{ textAlign: 'center', color: COLORS.text.tertiary, fontSize: 10, marginTop: 4 }}>
                            Predictions are skill-based and free.
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.background.overlay,
        justifyContent: 'flex-start', // Align to top to fill screen
    },
    modalContainer: {
        flex: 1, // Fill available space
        backgroundColor: COLORS.background.primary,
        // Remove top radius for full screen look, or keep if desired. User complained about wasted space, implying full coverage.
        // borderTopLeftRadius: BORDER_RADIUS.xxl, 
        // borderTopRightRadius: BORDER_RADIUS.xxl,
        padding: SPACING.lg,
        paddingTop: 40, // Add top padding for status bar/safe area
    },
    // ...
    submitGradient: {
        colors: ['#2979FF', '#00B0FF'], // Bright Blue Gradient
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        paddingVertical: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    submitText: {
        color: '#FFFFFF', // White text on blue
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 1,
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
        overflow: 'hidden',
    },
    logoImage: {
        width: '80%',
        height: '80%',
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
    // Interactive Team Selection Styles
    logoSelected: {
        borderColor: COLORS.accent.cyan,
        backgroundColor: 'rgba(0, 212, 255, 0.15)', // Light cyan background
        borderWidth: 3,
        ...SHADOWS.cyan, // Add glow effect
    },
    teamUnselected: {
        opacity: 0.5, // Dim unselected team
    },
    teamNameSelected: {
        color: COLORS.accent.cyan,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    checkBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.accent.cyan,
        borderRadius: BORDER_RADIUS.full,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.background.card,
    },
    // Existing styles below...
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
        overflow: 'hidden',
    },
    miniLogoImage: {
        width: '70%',
        height: '70%',
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
        color: '#FFFFFF', // White text on blue
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
        padding: SPACING.base,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.sm,
        marginTop: SPACING.md,
        marginBottom: SPACING.xs,
    },
    errorText: {
        color: COLORS.status.error,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        flex: 1,
    },
    // Confidence Selector Styles
    confidenceSelector: {
        gap: SPACING.sm,
        marginBottom: SPACING.xl,
    },
    confidenceOption: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.base,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    confidenceOptionSelected: {
        borderColor: COLORS.accent.cyan,
        backgroundColor: 'rgba(0, 212, 255, 0.05)',
        ...SHADOWS.cyan,
    },
    confidenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    confidenceLabel: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    confidenceLabelSelected: {
        color: COLORS.accent.cyan,
    },
    badge: {
        backgroundColor: COLORS.accent.cyan,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: COLORS.text.inverse,
        fontSize: 10,
        fontWeight: 'bold',
    },
    confidenceDesc: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        marginBottom: 8,
    },
    confidenceDescSelected: {
        color: COLORS.text.primary,
    },
    confidenceCost: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    costLabelSmall: {
        fontSize: 12,
        color: COLORS.text.tertiary,
    },
    costLabelSmallSelected: {
        color: COLORS.text.secondary,
    },
    rewardLabelSmall: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FCD34D',
    },
    rewardLabelSmallSelected: {
        color: '#F59E0B',
    },
    submitButtonSuccess: {
        ...SHADOWS.none,
    },
    footerContainer: {
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.tertiary,
        backgroundColor: COLORS.background.primary,
    },
});

export default PredictionModal;
