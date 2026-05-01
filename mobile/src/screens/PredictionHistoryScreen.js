import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl, ActivityIndicator, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const PredictionHistoryScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'won', 'lost', 'pending'
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest), 'asc' (oldest)

    useEffect(() => {
        fetchPredictions();
    }, [user]);

    const fetchPredictions = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const userPredictions = await apiService.getUserPredictions(user.uuid);
            setPredictions(userPredictions || []);
        } catch (error) {
            console.error('Error fetching predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPredictions();
        setRefreshing(false);
    };

    const filteredPredictions = React.useMemo(() => {
        let result = [...predictions];

        if (activeFilter === 'won') {
            result = result.filter(p => p.resolved && (p.result?.won || p.won));
        } else if (activeFilter === 'lost') {
            result = result.filter(p => p.resolved && !(p.result?.won || p.won));
        } else if (activeFilter === 'pending') {
            result = result.filter(p => !p.resolved);
        }

        result.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [predictions, activeFilter, sortOrder]);

    const handleSharePrediction = async (pred) => {
        const isWon = pred.resolved && (pred.result?.won || pred.won);
        const statusText = pred.resolved ? (isWon ? 'WINNER! 🏆' : 'CLOSE CALL!') : 'PICKED!';
        const shareMessage = `🎯 I'm picking the ${pred.predictedWinner} on Events Arena! ${statusText}\n\nJoin my squad and earn crowns: https://www.sportsprophecyapp.com?ref=${user?.referralCode}`;
        
        try {
            await Share.share({
                message: shareMessage,
                title: 'Events Arena Prediction'
            });
        } catch (error) {
            console.error('Error sharing prediction:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Prediction History</Text>
                <TouchableOpacity
                    onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    style={styles.sortButton}
                >
                    <Ionicons name={sortOrder === 'desc' ? "funnel" : "funnel-outline"} size={20} color={COLORS.accent.cyan} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                    {['all', 'won', 'lost', 'pending'].map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                activeFilter === filter && styles.activeFilterChip
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter && styles.activeFilterText
                            ]}>
                                {filter.charAt(0).toUpperCase() + (filter || '').slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent.cyan} />
                }
            >
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.accent.cyan} style={{ marginTop: 50 }} />
                ) : filteredPredictions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="football-outline" size={64} color={COLORS.text.tertiary} />
                        <Text style={styles.emptyText}>No predictions found</Text>
                        <Text style={styles.emptySubtext}>Your game history will appear here.</Text>
                    </View>
                ) : (
                    (Array.isArray(filteredPredictions) ? filteredPredictions : []).map((pred) => (
                        <View key={pred.id || pred._id} style={styles.predictionCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.eventLabel}>{pred.eventName || 'Game Prediction'}</Text>
                                <Text style={styles.timestamp}>{new Date(pred.timestamp).toLocaleDateString()}</Text>
                            </View>

                            <View style={styles.cardBody}>
                                <View style={styles.selectionInfo}>
                                    <Text style={styles.selectionLabel}>Picked:</Text>
                                    <Text style={styles.selectionValue}>{pred.predictedWinner}</Text>
                                </View>

                                <View style={styles.statusSection}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        {pred.resolved ? (
                                            (pred.result?.won || pred.won) ? (
                                                <View style={[styles.statusBadge, styles.wonBadge]}>
                                                    <Ionicons name="checkmark-circle" size={14} color="#fff" />
                                                    <Text style={styles.statusText}>WON</Text>
                                                </View>
                                            ) : (
                                                <View style={[styles.statusBadge, styles.lostBadge]}>
                                                    <Ionicons name="close-circle" size={14} color="#fff" />
                                                    <Text style={styles.statusText}>LOST</Text>
                                                </View>
                                            )
                                        ) : (
                                            <View style={[styles.statusBadge, styles.pendingBadge]}>
                                                <Ionicons name="time" size={14} color="#fff" />
                                                <Text style={styles.statusText}>PENDING</Text>
                                            </View>
                                        )}
                                        
                                        <TouchableOpacity 
                                            style={styles.smallShareBtn} 
                                            onPress={() => handleSharePrediction(pred)}
                                        >
                                            <Ionicons name="share-social-outline" size={16} color={COLORS.accent.cyan} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    backButton: {
        padding: SPACING.xs,
    },
    sortButton: {
        padding: SPACING.xs,
    },
    filterBar: {
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.background.primary,
    },
    filterContainer: {
        paddingHorizontal: SPACING.base,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.background.secondary,
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
    },
    activeFilterChip: {
        backgroundColor: COLORS.accent.cyan,
        borderColor: COLORS.accent.cyan,
    },
    filterText: {
        color: COLORS.text.secondary,
        fontSize: 14,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    activeFilterText: {
        color: COLORS.text.inverse,
    },
    content: {
        padding: SPACING.base,
        paddingBottom: 40,
    },
    predictionCard: {
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
        ...SHADOWS.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    eventLabel: {
        fontSize: 14,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        flex: 1,
    },
    timestamp: {
        fontSize: 12,
        color: COLORS.text.tertiary,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectionInfo: {
        flex: 1,
    },
    selectionLabel: {
        fontSize: 10,
        color: COLORS.text.tertiary,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    selectionValue: {
        fontSize: 16,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.accent.lime,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    wonBadge: {
        backgroundColor: COLORS.status.success,
    },
    lostBadge: {
        backgroundColor: COLORS.status.error,
    },
    pendingBadge: {
        backgroundColor: COLORS.text.tertiary,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginTop: 8,
    },
    smallShareBtn: {
        padding: 6,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.2)',
    },
});

export default PredictionHistoryScreen;
