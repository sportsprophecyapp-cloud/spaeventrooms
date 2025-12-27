import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getTeamLogo } from '../utils/teamLogos';

const GameCard = ({ game, onPress, style }) => {
    // 🛡️ THE AIRBAG: If game is null, render a skeleton-like view to prevent crash
    if (!game) return <View style={[styles.gameCard, { height: 150, backgroundColor: '#1e293b' }]} />;

    // 🛡️ Format date/time with strict safety
    const formatTimeUntil = (dateString) => {
        if (!dateString) return 'Soon';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Soon'; // Guard against "Invalid Date"

        const now = new Date();
        const diff = date - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h`;
        return diff < 0 ? 'Live/Final' : 'Soon';
    };

    const handleSelectTeam = async (teamName) => {
        if (game.hasPredicted) return;

        // Haptic Feedback
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Trigger parent onPress with the selected team
        if (onPress) {
            onPress(game, teamName);
        }
    };

    const TeamAvatar = ({ teamName, isSelected }) => {
        const logoUrl = getTeamLogo(teamName);

        return (
            <View style={[
                styles.teamAvatar,
                { backgroundColor: logoUrl ? 'transparent' : COLORS.background.tertiary },
                isSelected && styles.selectedAvatar
            ]}>
                {logoUrl ? (
                    <Image
                        source={{ uri: logoUrl }}
                        style={{ width: '85%', height: '85%' }}
                        resizeMode="contain"
                    />
                ) : (
                    <Text style={styles.teamAvatarText}>
                        {teamName?.substring(0, 3).toUpperCase()}
                    </Text>
                )}
            </View>
        );
    };

    // 🛡️ Prop Protection
    const homeTeam = game.home_team || game.homeTeam || 'TBD';
    const awayTeam = game.away_team || game.awayTeam || 'TBD';
    const sportLabel = (game.sport_key || game.sport || 'GAME').toUpperCase();

    return (
        <View style={[styles.gameCard, style, game.hasPredicted && styles.predictedCardShadow]}>
            {/* Game Header */}
            <LinearGradient
                // 🛡️ Force-Safe colors array
                colors={COLORS?.gradients?.dark?.length >= 2 ? COLORS.gradients.dark : ['#0f172a', '#1e293b']}
                style={styles.gameHeader}
            >
                <View style={styles.gameHeaderLeft}>
                    <Text style={styles.gameHeaderText}>
                        {sportLabel}
                    </Text>
                    <View style={styles.headerBadge}>
                        <Ionicons name="time-outline" size={12} color={COLORS.text.secondary} />
                        <Text style={styles.headerBadgeText}>
                            {formatTimeUntil(game.commence_time || game.startTime)}
                        </Text>
                    </View>
                </View>

                {/* Relocated Cost/Win Info */}
                <View style={styles.gameHeaderRight}>
                    <View style={styles.rewardInfo}>
                        <Ionicons name="flash" size={12} color={COLORS.accent.lime} />
                        <Text style={styles.rewardText}>1</Text>
                    </View>
                    <View style={styles.rewardInfo}>
                        <Ionicons name="trophy" size={12} color={COLORS.accent.gold} />
                        <Text style={styles.rewardText}>+1</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Teams Interactive Grid */}
            <View style={styles.teamsContainer}>
                <TouchableOpacity
                    style={[
                        styles.teamTouchArea,
                        game.prediction === homeTeam && styles.selectedTeamArea
                    ]}
                    onPress={() => handleSelectTeam(homeTeam)}
                    disabled={!!game.hasPredicted} // 🛡️ Force boolean
                    activeOpacity={0.7}
                >
                    <TeamAvatar teamName={homeTeam} isSelected={game.prediction === homeTeam} />
                    <Text style={[
                        styles.teamName,
                        game.prediction === homeTeam && styles.selectedTeamName
                    ]} numberOfLines={2}>
                        {homeTeam}
                    </Text>
                    <Text style={styles.teamLabel}>Home</Text>
                </TouchableOpacity>

                <View style={styles.vsContainer}>
                    <View style={styles.vsLine} />
                    <Text style={styles.vsText}>VS</Text>
                    <View style={styles.vsLine} />
                </View>

                <TouchableOpacity
                    style={[
                        styles.teamTouchArea,
                        game.prediction === awayTeam && styles.selectedTeamArea
                    ]}
                    onPress={() => handleSelectTeam(awayTeam)}
                    disabled={!!game.hasPredicted} // 🛡️ Force boolean
                    activeOpacity={0.7}
                >
                    <TeamAvatar teamName={awayTeam} isSelected={game.prediction === awayTeam} />
                    <Text style={[
                        styles.teamName,
                        game.prediction === awayTeam && styles.selectedTeamName
                    ]} numberOfLines={2}>
                        {awayTeam}
                    </Text>
                    <Text style={styles.teamLabel}>Away</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Status Strip */}
            <View style={[
                styles.statusStrip,
                game.hasPredicted ? styles.statusStripSuccess : styles.statusStripWarning
            ]}>
                {game.hasPredicted ? (
                    <>
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.status.success} />
                        <Text style={styles.statusStripTextSuccess}>PROBABILITY CAST</Text>
                    </>
                ) : (
                    <>
                        <Ionicons name="hand-pointer-outline" size={14} color={COLORS.accent.gold} />
                        <Text style={styles.statusStripTextWarning}>TAP A TEAM TO FORECAST</Text>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    gameCard: {
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.base,
        borderWidth: 1,
        borderColor: COLORS.border.primary,
        ...SHADOWS.card,
    },
    predictedCardShadow: {
        shadowColor: COLORS.status.success,
        shadowOpacity: 0.1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    gameHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
    },
    gameHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    gameHeaderText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.secondary,
        letterSpacing: 1,
    },
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    headerBadgeText: {
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.text.secondary,
    },
    gameHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    rewardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rewardText: {
        fontSize: 11,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    teamsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.base,
    },
    teamTouchArea: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedTeamArea: {
        backgroundColor: 'rgba(56, 189, 248, 0.08)',
        borderColor: COLORS.accent.cyan,
        ...SHADOWS.glow,
    },
    teamAvatar: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    selectedAvatar: {
        borderColor: COLORS.accent.cyan,
    },
    teamAvatarText: {
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.weights.black,
        fontSize: 14,
    },
    teamName: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        textAlign: 'center',
        marginBottom: 2,
    },
    selectedTeamName: {
        color: COLORS.accent.cyan,
    },
    teamLabel: {
        fontSize: 10,
        color: COLORS.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    vsContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vsLine: {
        width: 1,
        height: 10,
        backgroundColor: COLORS.border.tertiary,
        marginVertical: 4,
    },
    vsText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.tertiary,
    },
    statusStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        gap: 6,
    },
    statusStripWarning: {
        backgroundColor: 'rgba(250, 204, 21, 0.05)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(250, 204, 21, 0.1)',
    },
    statusStripSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(16, 185, 129, 0.1)',
    },
    statusStripTextWarning: {
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.accent.gold,
        letterSpacing: 1,
    },
    statusStripTextSuccess: {
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.status.success,
        letterSpacing: 1,
    },
});

export default GameCard;


