import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getTeamLogo } from '../utils/teamLogos';

const GameCard = ({ game, onPress, style }) => {
    // Format date/time
    const formatTimeUntil = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = date - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h`;

        // If passed or very close
        if (diff < 0) return 'Live/Final';
        return 'Soon';
    };

    // Helper for team avatar background
    const getAvatarColor = (teamName) => {
        // Simple hash or random color logic could go here, 
        // for now returning a fixed color or logic based on name length
        return '#8B5CF6'; // Default Purple
    };

    const TeamAvatar = ({ teamName, color }) => {
        const logoUrl = getTeamLogo(teamName);

        return (
            <View style={[styles.teamAvatar, { backgroundColor: logoUrl ? 'transparent' : color }]}>
                {logoUrl ? (
                    <Image
                        source={{ uri: logoUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                    />
                ) : (
                    <Text style={styles.teamAvatarText}>
                        {teamName?.substring(0, 3).toUpperCase()}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.gameCard, style]}>
            {/* Game Header */}
            <LinearGradient
                colors={['#1F2937', '#111827']}
                style={styles.gameHeader}
            >
                <View style={styles.gameHeaderLeft}>
                    <Ionicons name="calendar" size={16} color="#FFF" />
                    <Text style={styles.gameHeaderText}>
                        {game.sport_key?.toUpperCase() || game.sport?.toUpperCase() || 'GAME'}
                    </Text>
                </View>
                <View style={styles.gameHeaderRight}>
                    <Ionicons name="time" size={16} color="#FFF" />
                    <Text style={styles.gameHeaderText}>
                        {formatTimeUntil(game.commence_time || game.startTime)}
                    </Text>
                </View>
            </LinearGradient>

            {/* Teams */}
            <View style={styles.teamsContainer}>
                <View style={styles.team}>
                    <TeamAvatar teamName={game.home_team || game.homeTeam} color="#8B5CF6" />
                    <View style={styles.teamInfo}>
                        <Text style={styles.teamName} numberOfLines={2}>
                            {game.home_team || game.homeTeam}
                        </Text>
                        <Text style={styles.teamLabel}>Home</Text>
                    </View>
                </View>

                <Text style={styles.vsText}>VS</Text>

                <View style={[styles.team, styles.teamRight]}>
                    <View style={styles.teamInfo}>
                        <Text style={[styles.teamName, styles.teamNameRight]} numberOfLines={2}>
                            {game.away_team || game.awayTeam}
                        </Text>
                        <Text style={[styles.teamLabel, styles.teamLabelRight]}>Away</Text>
                    </View>
                    <TeamAvatar teamName={game.away_team || game.awayTeam} color="#EF4444" />
                </View>
            </View>

            {/* Predict Button */}
            <TouchableOpacity
                style={styles.predictButton}
                onPress={game.hasPredicted ? null : onPress}
                disabled={game.hasPredicted}
            >
                <LinearGradient
                    colors={game.hasPredicted ? ['#10B981', '#059669'] : ['#2563EB', '#9333EA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.predictButtonGradient}
                >
                    <Text style={styles.predictButtonText}>
                        {game.hasPredicted ? 'PREDICTED' : 'Make Prediction'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Cost Info */}
            <View style={styles.costInfo}>
                <View style={styles.costItem}>
                    <Ionicons name="logo-bitcoin" size={16} color="#F59E0B" />
                    <Text style={styles.costText}>Cost: 1 Token</Text>
                </View>
                <View style={styles.costItem}>
                    <Ionicons name="trophy" size={16} color="#F59E0B" />
                    <Text style={styles.costText}>Win: +1 Crown</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    gameCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    gameHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    gameHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    gameHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    gameHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    teamsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    team: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    teamRight: {
        justifyContent: 'flex-end',
    },
    teamAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    teamAvatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    teamInfo: {
        flex: 1,
    },
    teamName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    teamNameRight: {
        textAlign: 'right',
    },
    teamLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    teamLabelRight: {
        textAlign: 'right',
    },
    vsText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D1D5DB',
        marginHorizontal: 16,
    },
    predictButton: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    predictButtonGradient: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    predictButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    costInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    costItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    costText: {
        fontSize: 14,
        color: '#6B7280',
    },
});

export default GameCard;
