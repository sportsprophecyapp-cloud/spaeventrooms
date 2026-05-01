import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getTeamLogo } from '../utils/teamLogos';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;
const CARD_HEIGHT = height * 0.65;

const ArenaCard = ({ game, dragX, sponsor, cardType = 'winner', cardTitle = '🏟️ MATCH WINNER', leftLabel = 'PICK HOME', rightLabel = 'PICK AWAY' }) => {
    if (!game) return null;

    // Hero Glow logic matching web parity using Reanimated
    const glowStyle = useAnimatedStyle(() => {
        const homeOpacity = interpolate(
            dragX.value,
            [20, 150],
            [0, 0.4],
            Extrapolate.CLAMP
        );
        const awayOpacity = interpolate(
            dragX.value,
            [-150, -20],
            [0.4, 0],
            Extrapolate.CLAMP
        );

        return {
            backgroundColor: dragX.value > 0 
                ? `rgba(56, 189, 248, ${homeOpacity})` 
                : `rgba(219, 39, 119, ${awayOpacity})`,
        };
    });

    const homeIndicatorStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            dragX.value,
            [50, 120],
            [0, 1],
            Extrapolate.CLAMP
        );
        return { opacity };
    });

    const awayIndicatorStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            dragX.value,
            [-120, -50],
            [1, 0],
            Extrapolate.CLAMP
        );
        return { opacity };
    });

    const timeDisplay = game.startTime 
        ? new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'LIVE';

    return (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={['#1e293b', '#0f172a']}
                style={styles.cardFrame}
            >
                {/* Hero Glow Overlay */}
                <Animated.View style={[styles.glowOverlay, glowStyle]} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{cardTitle}</Text>
                    </View>
                    <Text style={styles.timeText}>{timeDisplay}</Text>
                </View>

                {/* Teams Section */}
                <View style={styles.teamsContainer}>
                    {/* Home Team */}
                    <View style={styles.teamBox}>
                        <View style={styles.logoWrapper}>
                            {getTeamLogo(game.homeTeam) ? (
                                <Image 
                                    source={{ uri: getTeamLogo(game.homeTeam) }} 
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.placeholderLogo}>
                                    <Text style={styles.placeholderText}>{game.homeTeam?.charAt(0)}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.teamName} numberOfLines={2}>{game.homeTeam}</Text>
                    </View>

                    {/* VS */}
                    <View style={styles.vsContainer}>
                        <Text style={styles.vsText}>VS</Text>
                        <View style={styles.vsLine} />
                    </View>

                    {/* Away Team */}
                    <View style={styles.teamBox}>
                        <View style={styles.logoWrapper}>
                            {getTeamLogo(game.awayTeam) ? (
                                <Image 
                                    source={{ uri: getTeamLogo(game.awayTeam) }} 
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.placeholderLogo}>
                                    <Text style={styles.placeholderText}>{game.awayTeam?.charAt(0)}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.teamName} numberOfLines={2}>{game.awayTeam}</Text>
                    </View>
                </View>

                {/* Footer / Sponsor */}
                <View style={styles.footer}>
                    {sponsor ? (
                        <View style={styles.sponsorContent}>
                            <Text style={styles.poweredBy}>POWERED BY</Text>
                            <Image 
                                source={{ uri: sponsor.logo_url }} 
                                style={styles.sponsorLogo} 
                                resizeMode="contain"
                            />
                        </View>
                    ) : (
                        <Text style={styles.premiumText}>Events Arena Premium</Text>
                    )}
                </View>

                {/* Swipe Indicators */}
                <Animated.View style={[styles.indicatorRight, homeIndicatorStyle]}>
                    <Ionicons name="checkmark-circle" size={32} color={COLORS.accent.cyan} />
                    <Text style={styles.indicatorText}>{leftLabel}</Text>
                </Animated.View>
                
                <Animated.View style={[styles.indicatorLeft, awayIndicatorStyle]}>
                    <Ionicons name="checkmark-circle" size={32} color="#DB2777" />
                    <Text style={styles.indicatorText}>{rightLabel}</Text>
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.card,
    },
    cardFrame: {
        flex: 1,
        padding: SPACING.lg,
        justifyContent: 'space-between',
    },
    glowOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    badgeContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    badgeText: {
        color: COLORS.text.secondary,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 1,
    },
    timeText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: SPACING.xl,
    },
    teamBox: {
        flex: 1,
        alignItems: 'center',
    },
    logoWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    logo: {
        width: '70%',
        height: '70%',
    },
    placeholderLogo: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: COLORS.text.primary,
        fontSize: 32,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    teamName: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.black,
        textAlign: 'center',
    },
    vsContainer: {
        paddingHorizontal: SPACING.sm,
        alignItems: 'center',
    },
    vsText: {
        color: COLORS.text.tertiary,
        fontSize: 18,
        fontWeight: TYPOGRAPHY.weights.black,
        fontStyle: 'italic',
    },
    vsLine: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginTop: SPACING.xs,
    },
    footer: {
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    premiumText: {
        color: COLORS.text.tertiary,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.semibold,
        letterSpacing: 2,
    },
    sponsorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    poweredBy: {
        color: COLORS.text.tertiary,
        fontSize: 8,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    sponsorLogo: {
        width: 60,
        height: 20,
    },
    indicatorRight: {
        position: 'absolute',
        top: '40%',
        right: 20,
        alignItems: 'center',
        transform: [{ rotate: '-15deg' }],
    },
    indicatorLeft: {
        position: 'absolute',
        top: '40%',
        left: 20,
        alignItems: 'center',
        transform: [{ rotate: '15deg' }],
    },
    indicatorText: {
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.weights.black,
        fontSize: 14,
        marginTop: 4,
    },
});

export default ArenaCard;
