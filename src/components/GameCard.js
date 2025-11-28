import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const GameCard = ({ game, onPress }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        if (isToday) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        } else if (isTomorrow) {
            return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'live':
                return COLORS.status.error;
            case 'upcoming':
                return COLORS.accent.cyan;
            case 'final':
                return COLORS.text.tertiary;
            default:
                return COLORS.text.secondary;
        }
    };

    const isLive = game.status === 'live';

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <LinearGradient
                colors={COLORS.gradients.dark}
                style={styles.card}
            >
                {/* Status Badge */}
                {isLive && (
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                )}

                {/* Date/Time */}
                <Text style={styles.dateText}>{formatDate(game.commence_time)}</Text>

                {/* Teams */}
                <View style={styles.matchupContainer}>
                    {/* Home Team */}
                    <View style={styles.teamSection}>
                        <View style={styles.teamLogoContainer}>
                            <Text style={styles.teamLogoText}>{game.homeTeam?.charAt(0) || 'H'}</Text>
                        </View>
                        <Text style={styles.teamName} numberOfLines={2}>{game.homeTeam || 'Home Team'}</Text>
                    </View>

                    {/* VS */}
                    <View style={styles.vsContainer}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>

                    {/* Away Team */}
                    <View style={styles.teamSection}>
                        <View style={styles.teamLogoContainer}>
                            <Text style={styles.teamLogoText}>{game.awayTeam?.charAt(0) || 'A'}</Text>
                        </View>
                        <Text style={styles.teamName} numberOfLines={2}>{game.awayTeam || 'Away Team'}</Text>
                    </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity style={styles.predictButton} onPress={onPress}>
                    <LinearGradient
                        colors={COLORS.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.predictGradient}
                    >
                        <Text style={styles.predictText}>MAKE PREDICTION</Text>
                        <Ionicons name="arrow-forward" size={16} color={COLORS.text.inverse} />
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        marginBottom: SPACING.base,
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
        ...SHADOWS.md,
    },
    liveBadge: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.status.error,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
        gap: SPACING.xs,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.text.primary,
    },
    liveText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    dateText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        marginBottom: SPACING.md,
    },
    matchupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.base,
    },
    teamSection: {
        flex: 1,
        alignItems: 'center',
    },
    teamLogoContainer: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.background.card,
        borderWidth: 2,
        borderColor: COLORS.accent.cyan,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    teamLogoText: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.accent.cyan,
    },
    teamName: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
        textAlign: 'center',
    },
    vsContainer: {
        paddingHorizontal: SPACING.md,
    },
    vsText: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    predictButton: {
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
    },
    predictGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    predictText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 0.5,
    },
});

export default GameCard;
