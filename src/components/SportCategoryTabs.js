import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SPORTS } from '../constants/theme';

import { useNavigation } from '@react-navigation/native';

const SportCategoryTabs = () => {
    const navigation = useNavigation();

    const getSportIcon = (sportId) => {
        const iconMap = {
            all: 'apps',
            nhl: 'hockey-puck',
            nfl: 'football',
            mlb: 'baseball',
            nba: 'basketball',
            soccer: 'football-outline',
            mma: 'hand-right-outline',
        };
        return iconMap[sportId] || 'trophy';
    };

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
                    <TouchableOpacity
                        key={sport.id}
                        onPress={() => handlePress(sport)}
                        style={styles.tabButton}
                        accessibilityLabel={`Sport Tab: ${sport.name}`}
                        testID={`sport-tab-${sport.id}`}
                    >
                        <LinearGradient
                            colors={['rgba(30, 41, 59, 0.8)', 'rgba(30, 41, 59, 0.4)']}
                            style={styles.tabInactive}
                        >
                            <Ionicons
                                name={getSportIcon(sport.id)}
                                size={18}
                                color={COLORS.text.secondary}
                            />
                            <Text style={styles.tabText}>{sport.name}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
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
        gap: SPACING.sm,
    },
    tabButton: {
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
    },
    tabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        gap: SPACING.xs,
    },
    tabInactive: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        gap: SPACING.xs,
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    tabTextSelected: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    tabText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
});

export default SportCategoryTabs;
