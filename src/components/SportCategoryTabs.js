import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SPORTS } from '../constants/theme';

import { useNavigation } from '@react-navigation/native';

const SportPill = ({ sport, onPress }) => {
    const [isPressed, setIsPressed] = useState(false);

    const getSportIcon = (sportId) => {
        const iconMap = {
            all: { name: 'apps', library: 'Ionicons' },
            nhl: { name: 'hockey-stick', library: 'MaterialCommunityIcons' },
            nfl: { name: 'football', library: 'Ionicons' },
            mlb: { name: 'baseball', library: 'MaterialCommunityIcons' },
            nba: { name: 'basketball', library: 'Ionicons' },
            soccer: { name: 'soccer', library: 'Ionicons' },
            mma: { name: 'hand-right-outline', library: 'Ionicons' },
        };
        return iconMap[sportId] || { name: 'trophy', library: 'Ionicons' };
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            style={styles.tabButton}
            accessibilityLabel={`Sport Tab: ${sport.name}`}
            testID={`sport-tab-${sport.id}`}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={
                    isPressed
                        ? [COLORS.accent.cyan, COLORS.accent.cyanDark]
                        : ['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.95)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.tabInactive,
                    isPressed && styles.tabPressed,
                ]}
            >
                {/* Glow effect overlay */}
                {isPressed && (
                    <View style={styles.glowOverlay} />
                )}

                {(() => {
                    const iconConfig = getSportIcon(sport.id);
                    const IconComponent = iconConfig.library === 'MaterialCommunityIcons'
                        ? MaterialCommunityIcons
                        : Ionicons;

                    return (
                        <IconComponent
                            name={iconConfig.name}
                            size={20}
                            color={isPressed ? COLORS.text.inverse : COLORS.accent.cyan}
                            style={styles.icon}
                        />
                    );
                })()}
                <Text style={[
                    styles.tabText,
                    isPressed && styles.tabTextPressed
                ]}>
                    {sport.name}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const SportCategoryTabs = () => {
    const navigation = useNavigation();

    const handlePress = (sport) => {
        navigation.navigate('Sport', { sportId: sport.id, sportName: sport.name });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {SPORTS.map((sport) => (
                    <SportPill
                        key={sport.id}
                        sport={sport}
                        onPress={() => handlePress(sport)}
                    />
                ))}
            </ScrollView>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
    },
    scrollContent: {
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        gap: SPACING.md,
    },
    tabButton: {
        borderRadius: BORDER_RADIUS.full,
        overflow: 'visible',
    },
    tabInactive: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1.5,
        borderColor: COLORS.accent.cyan + '40', // 25% opacity
        shadowColor: COLORS.accent.cyan,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    tabPressed: {
        borderColor: COLORS.accent.cyan,
        shadowColor: COLORS.accent.cyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 8,
        transform: [{ scale: 1.05 }],
    },
    glowOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
    },
    icon: {
        textShadowColor: COLORS.accent.cyan,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    tabText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.bold,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    tabTextPressed: {
        color: COLORS.text.inverse,
        textShadowColor: COLORS.accent.cyanDark,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },
});

export default SportCategoryTabs;

