import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import UserAvatar from './UserAvatar';

const { width } = Dimensions.get('window');

const WinnerSpotlight = ({ winner }) => {
    if (!winner) return null;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.header}>
                    <Ionicons name="trophy" size={20} color={COLORS.accent.gold} />
                    <Text style={styles.headerTitle}>LATEST WINNER</Text>
                    <Ionicons name="trophy" size={20} color={COLORS.accent.gold} />
                </View>

                <View style={styles.content}>
                    <View style={styles.avatarWrapper}>
                        <UserAvatar
                            size={64}
                            profilePicture={winner.userAvatar}
                            fallbackName={winner.username}
                        />
                        <View style={styles.crownBadge}>
                            <Ionicons name="star" size={10} color="#FFF" />
                        </View>
                    </View>

                    <View style={styles.info}>
                        <Text style={styles.username}>{typeof winner.username === 'string' ? winner.username : String(winner.username || 'Winner')}</Text>
                        <Text style={styles.wonText}>WON: <Text style={styles.prize}>{typeof winner.prizeName === 'string' ? winner.prizeName : String(winner.prizeName || 'Prize')}</Text></Text>
                    </View>
                </View>

                <View style={styles.quoteContainer}>
                    <Ionicons name="chatquote" size={16} color={COLORS.accent.gold} style={styles.quoteIcon} />
                    <Text style={styles.quoteText}>"{typeof winner.quote === 'string' ? winner.quote : String(winner.quote || '')}"</Text>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: SPACING.md, // Match LandingScreen padding
        marginBottom: SPACING.xl,
        maxWidth: 500, // Constrain width on tablets/web
        alignSelf: 'center',
    },
    card: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.accent.gold,
        letterSpacing: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    avatarWrapper: {
        position: 'relative',
    },
    crownBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: COLORS.accent.gold,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.background.card,
    },
    info: {
        flex: 1,
    },
    username: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.inverse,
        marginBottom: 2,
    },
    wonText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    prize: {
        color: COLORS.accent.cyan,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    quoteContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
        backgroundColor: 'rgba(0,0,0,0.2)', // Slightly darker background for quote
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    quoteIcon: {
        marginTop: 2,
    },
    quoteText: {
        flex: 1,
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.inverse,
        fontStyle: 'italic',
        lineHeight: 20,
    },
});

export default WinnerSpotlight;
