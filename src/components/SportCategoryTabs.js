import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SPORTS } from '../constants/theme';

const SportCategoryTabs = ({ selectedSport, onSelectSport }) => {
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

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {SPORTS.map((sport) => {
                    const isSelected = selectedSport === sport.id;
                    return (
                        <TouchableOpacity
                            key={sport.id}
                            onPress={() => onSelectSport(sport.id)}
                            style={styles.tabButton}
                        >
                            {isSelected ? (
                                <LinearGradient
                                    colors={COLORS.gradients.primary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.tabGradient}
                                >
                                    <Ionicons
                                        name={getSportIcon(sport.id)}
                                        size={18}
                                        color={COLORS.text.inverse}
                                    />
                                    <Text style={styles.tabTextSelected}>{sport.name}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.tabInactive}>
                                    <Ionicons
                                        name={getSportIcon(sport.id)}
                                        size={18}
                                        color={COLORS.text.secondary}
                                    />
                                    <Text style={styles.tabText}>{sport.name}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
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
