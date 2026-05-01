import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;
const CARD_HEIGHT = height * 0.65;

const ArenaCardSkeleton = () => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.badge} />
                    <View style={styles.time} />
                </View>
                <View style={styles.teams}>
                    <View style={styles.team}>
                        <View style={styles.logo} />
                        <View style={styles.name} />
                    </View>
                    <View style={styles.vs} />
                    <View style={styles.team}>
                        <View style={styles.logo} />
                        <View style={styles.name} />
                    </View>
                </View>
                <View style={styles.footer} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.border.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    badge: {
        width: 100,
        height: 20,
        backgroundColor: COLORS.background.tertiary,
        borderRadius: 4,
    },
    time: {
        width: 60,
        height: 20,
        backgroundColor: COLORS.background.tertiary,
        borderRadius: 4,
    },
    teams: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    team: {
        alignItems: 'center',
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.background.tertiary,
        marginBottom: SPACING.md,
    },
    name: {
        width: 100,
        height: 20,
        backgroundColor: COLORS.background.tertiary,
        borderRadius: 4,
    },
    vs: {
        width: 30,
        height: 30,
        backgroundColor: COLORS.background.tertiary,
        borderRadius: 15,
    },
    footer: {
        height: 40,
        backgroundColor: COLORS.background.tertiary,
        borderRadius: BORDER_RADIUS.md,
    },
});

export default ArenaCardSkeleton;
