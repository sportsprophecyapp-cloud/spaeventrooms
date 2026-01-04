import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

const GameCardSkeleton = () => {
    const shimmerValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmerAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        shimmerAnimation.start();
        return () => shimmerAnimation.stop();
    }, []);

    const opacity = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.skeletonCard}>
            {/* Header Skeleton */}
            <View style={styles.headerSkeleton}>
                <Animated.View style={[styles.shimmerLine, { width: '40%', opacity }]} />
                <Animated.View style={[styles.shimmerLine, { width: '20%', opacity }]} />
            </View>

            {/* Content Skeleton */}
            <View style={styles.contentSkeleton}>
                <View style={styles.teamSkeleton}>
                    <Animated.View style={[styles.avatarSkeleton, { opacity }]} />
                    <Animated.View style={[styles.lineSkeleton, { width: '80%', opacity }]} />
                    <Animated.View style={[styles.lineSkeleton, { width: '50%', opacity }]} />
                </View>

                <View style={styles.vsSkeleton}>
                    <Animated.View style={[styles.lineSkeleton, { width: 20, height: 20, opacity }]} />
                </View>

                <View style={styles.teamSkeleton}>
                    <Animated.View style={[styles.avatarSkeleton, { opacity }]} />
                    <Animated.View style={[styles.lineSkeleton, { width: '80%', opacity }]} />
                    <Animated.View style={[styles.lineSkeleton, { width: '50%', opacity }]} />
                </View>
            </View>

            {/* Footer Skeleton */}
            <View style={styles.footerSkeleton}>
                <Animated.View style={[styles.shimmerLine, { width: '100%', height: 20, opacity }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    skeletonCard: {
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.base,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
    },
    headerSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: SPACING.base,
        backgroundColor: COLORS.background.tertiary,
        opacity: 0.5,
    },
    shimmerLine: {
        height: 12,
        backgroundColor: COLORS.text.tertiary,
        borderRadius: 4,
    },
    contentSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.base,
    },
    teamSkeleton: {
        flex: 1,
        alignItems: 'center',
    },
    avatarSkeleton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.text.tertiary,
        marginBottom: SPACING.sm,
    },
    lineSkeleton: {
        height: 10,
        backgroundColor: COLORS.text.tertiary,
        borderRadius: 4,
        marginBottom: 6,
    },
    vsSkeleton: {
        width: 40,
        alignItems: 'center',
    },
    footerSkeleton: {
        padding: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.tertiary,
    },
});

export default GameCardSkeleton;
