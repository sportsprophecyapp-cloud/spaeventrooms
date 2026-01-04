import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const NoPredictionsYet = ({ onMakePrediction }) => (
    <View style={styles.emptyState}>
        <Ionicons name="basketball-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyStateTitle}>No predictions yet</Text>
        <Text style={styles.emptyStateText}>
            Make your first prediction to start earning rewards!
        </Text>
        <TouchableOpacity style={styles.emptyStateCTA} onPress={onMakePrediction}>
            <Text style={styles.emptyStateCTAText}>Browse Games</Text>
        </TouchableOpacity>
    </View>
);

export const BrokenStreak = ({ streakLength, onContinue }) => (
    <View style={styles.streakBroken}>
        <Text style={styles.streakBrokenEmoji}>😔</Text>
        <Text style={styles.streakBrokenTitle}>
            Your {streakLength}-day streak ended
        </Text>
        <Text style={styles.streakBrokenText}>
            No worries! Start a new streak today and keep improving.
        </Text>
        <TouchableOpacity style={styles.streakBrokenCTA} onPress={onContinue}>
            <Text style={styles.streakBrokenCTAText}>Start New Streak</Text>
        </TouchableOpacity>
    </View>
);

export const PredictionLoss = ({ game, nextGame }) => (
    <View style={styles.lossState}>
        <Text style={styles.lossEmoji}>📊</Text>
        <Text style={styles.lossTitle}>Close one!</Text>
        <Text style={styles.lossText}>
            {game.homeTeam} won this time. Better luck next game!
        </Text>
        <View style={styles.encouragement}>
            <Text style={styles.encouragementText}>
                💡 You're still building your win rate. Keep predicting!
            </Text>
        </View>
        {nextGame && (
            <TouchableOpacity style={styles.nextGameCTA}>
                <Text style={styles.nextGameCTAText}>
                    Try Again: {nextGame.homeTeam} vs {nextGame.awayTeam}
                </Text>
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    emptyState: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginVertical: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyStateCTA: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#3B82F6',
        borderRadius: 8,
    },
    emptyStateCTAText: {
        color: '#FFF',
        fontWeight: '600',
    },
    streakBroken: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FEF2F2',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FECACA',
        marginVertical: 16,
        marginHorizontal: 16,
    },
    streakBrokenEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    streakBrokenTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#991B1B',
        marginBottom: 8,
        textAlign: 'center',
    },
    streakBrokenText: {
        fontSize: 14,
        color: '#7F1D1D',
        textAlign: 'center',
        marginBottom: 16,
    },
    streakBrokenCTA: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#EF4444',
        borderRadius: 8,
    },
    streakBrokenCTAText: {
        color: '#FFF',
        fontWeight: '600',
    },
    lossState: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        marginVertical: 16,
    },
    lossEmoji: {
        fontSize: 40,
        marginBottom: 12,
    },
    lossTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    lossText: {
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    encouragement: {
        backgroundColor: '#E0F2FE',
        padding: 12,
        borderRadius: 8,
        width: '100%',
        marginBottom: 16,
    },
    encouragementText: {
        color: '#0369A1',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    nextGameCTA: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    nextGameCTAText: {
        color: '#FFF',
        fontWeight: '600',
    },
});
