import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const SocialProofCard = ({ type = 'winner', user, amount, message, game }) => {
    const isWinner = type === 'winner';

    // Winner Colors (Green/Emerald Theme)
    const bgColors = isWinner
        ? ['#EcFdf5', '#D1FaE5'] // Green-50 to Green-100
        : ['#F0Fdf4', '#Dcfce7'];

    const borderColor = isWinner ? '#4Ade80' : '#86EfAc'; // Green-400
    const iconColor = '#16A34A'; // Green-600
    const textColor = '#14532D'; // Green-900

    return (
        <View style={[styles.container, { borderColor }]}>
            <LinearGradient
                colors={bgColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <View style={styles.contentRow}>
                    {/* Avatar Circle */}
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.charAt(0) || 'U'}
                        </Text>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: textColor }]}>
                            <Text style={{ fontWeight: '900' }}>{user}</Text>
                            {isWinner ? ` just won $${amount}!` : ` just predicted perfectly!`}
                        </Text>
                        <Text style={styles.subtitle}>
                            {message || (isWinner ? 'Perfect score prediction' : `on ${game} game`)}
                        </Text>
                    </View>

                    <View style={styles.iconContainer}>
                        <Ionicons name="trophy" size={24} color={iconColor} />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        borderLeftWidth: 4,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        // Add border colors dynamically or modify here if static
        borderTopColor: '#E5E7EB',
        borderRightColor: '#E5E7EB',
        borderBottomColor: '#E5E7EB',
    },
    gradient: {
        padding: SPACING.md,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#22C55E', // Green-500
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: '#15803D', // Green-700
        opacity: 0.9,
    },
    iconContainer: {
        padding: 4,
    },
});

export default SocialProofCard;
