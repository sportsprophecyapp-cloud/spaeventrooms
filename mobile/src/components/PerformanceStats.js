import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PerformanceStats = ({ stats }) => {
    return (
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Ionicons name="trending-up" size={24} color="#3B82F6" />
                <Text style={styles.statValue}>{stats?.winRate || 0}%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.statCard}>
                <Ionicons name="target" size={24} color="#8B5CF6" />
                <Text style={styles.statValue}>{stats?.weeklyPredictions || 0}</Text>
                <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statCard}>
                <Ionicons name="medal" size={24} color="#F59E0B" />
                <Text style={styles.statValue}>#{stats?.rank || '—'}</Text>
                <Text style={styles.statLabel}>Rank</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
});

export default PerformanceStats;
