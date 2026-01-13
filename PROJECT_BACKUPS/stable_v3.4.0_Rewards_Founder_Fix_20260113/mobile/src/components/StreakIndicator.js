import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StreakIndicator = ({ streak = 0 }) => {
    if (streak <= 0) return null;

    return (
        <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
                <View style={styles.streakHeaderLeft}>
                    <Ionicons name="flash" size={20} color="#FB923C" />
                    <Text style={styles.streakText}>
                        {streak}-Day Streak!
                    </Text>
                </View>
                <Text style={styles.streakEmoji}>🔥</Text>
            </View>
            <View style={styles.streakProgress}>
                {[...Array(7)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.streakDot,
                            i < streak && styles.streakDotActive,
                        ]}
                    />
                ))}
            </View>
            <Text style={styles.streakSubtext}>Login today to keep it going!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    streakCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        // Add backdrop filter if supported, otherwise simple transparency
    },
    streakHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    streakHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    streakText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    streakEmoji: {
        fontSize: 24,
    },
    streakProgress: {
        flexDirection: 'row',
        gap: 4,
        marginVertical: 12,
    },
    streakDot: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 4,
    },
    streakDotActive: {
        backgroundColor: '#FB923C',
    },
    streakSubtext: {
        fontSize: 12,
        color: '#FFF',
        opacity: 0.9,
    },
});

export default StreakIndicator;
