import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

export default function LiveTicker() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef(null);

    useEffect(() => {
        fetchTickerData();
        const interval = setInterval(fetchTickerData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const fetchTickerData = async () => {
        try {
            const data = await apiService.getPulse('ticker');
            if (data && Array.isArray(data)) {
                setMatches(data);
            }
        } catch (error) {
            console.error('Error fetching ticker data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMatch = ({ item }) => {
        const isLive = item.status?.toLowerCase() === 'live' || item.status?.toLowerCase() === 'in_progress';
        const isFinished = item.status?.toLowerCase() === 'finished' || item.status?.toLowerCase() === 'ft';
        
        const getSportIcon = (sport) => {
            switch(sport?.toLowerCase()) {
                case 'nhl': return 'hockey-puck';
                case 'soccer': return 'football-outline';
                default: return 'trophy-outline';
            }
        };

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name={getSportIcon(item.sport)} size={12} color={COLORS.accent.cyan} />
                    <Text style={[styles.statusText, isLive && styles.liveText]}>
                        {isLive ? '● LIVE' : item.status?.toUpperCase() || 'UPCOMING'}
                    </Text>
                </View>

                <View style={styles.teamsContainer}>
                    <View style={styles.teamRow}>
                        <Text style={styles.teamName} numberOfLines={1}>{item.home_team}</Text>
                        <Text style={styles.score}>{item.home_score ?? '-'}</Text>
                    </View>
                    <View style={styles.teamRow}>
                        <Text style={styles.teamName} numberOfLines={1}>{item.away_team}</Text>
                        <Text style={styles.score}>{item.away_score ?? '-'}</Text>
                    </View>
                </View>

                {!isFinished && !isLive && item.commence_time && (
                    <Text style={styles.timeText}>
                        {new Date(item.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                )}
            </View>
        );
    };

    if (loading && matches.length === 0) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={COLORS.accent.cyan} />
            </View>
        );
    }

    if (matches.length === 0) return null;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={matches}
                renderItem={renderMatch}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                snapToInterval={CARD_WIDTH + SPACING.sm}
                decelerationRate="fast"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 100,
        backgroundColor: 'rgba(10, 22, 40, 0.5)',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.primary,
        paddingVertical: SPACING.sm,
    },
    loaderContainer: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: SPACING.base,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        marginRight: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusText: {
        color: COLORS.text.secondary,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    liveText: {
        color: COLORS.status.error,
    },
    teamsContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    teamRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 1,
    },
    teamName: {
        color: COLORS.text.primary,
        fontSize: 11,
        fontWeight: TYPOGRAPHY.weights.medium,
        flex: 1,
        marginRight: 8,
    },
    score: {
        color: COLORS.accent.gold,
        fontSize: 12,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    timeText: {
        color: COLORS.text.tertiary,
        fontSize: 9,
        textAlign: 'right',
        marginTop: 2,
    },
});
