import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PrizeDrawBanner = ({ draw, onPress, style }) => {
    if (!draw) return null;

    const formatTimeUntil = (date) => {
        const diff = new Date(date) - new Date();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h`;
        return 'Soon';
    };

    return (
        <View style={[styles.prizeDrawBanner, style]}>
            <LinearGradient
                colors={['#FCD34D', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.prizeDrawGradient}
            >
                <View style={styles.prizeDrawContent}>
                    <View style={styles.prizeDrawInfo}>
                        <View style={styles.prizeDrawTitleRow}>
                            <Ionicons name="gift" size={20} color="#FFF" />
                            <Text style={styles.prizeDrawTitle}>{draw.title}</Text>
                        </View>
                        <Text style={styles.prizeDrawSponsor}>
                            Sponsored by {draw.sponsor}
                        </Text>
                        <View style={styles.prizeDrawStats}>
                            <View style={styles.prizeDrawStat}>
                                <Ionicons name="time" size={16} color="#FFF" />
                                <Text style={styles.prizeDrawStatText}>
                                    Ends {formatTimeUntil(draw.end_date)}
                                </Text>
                            </View>
                            <View style={styles.prizeDrawStat}>
                                <Ionicons name="people" size={16} color="#FFF" />
                                <Text style={styles.prizeDrawStatText}>
                                    {draw.total_entries || 0} entries
                                </Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.enterButton}
                        onPress={onPress}
                    >
                        <Text style={styles.enterButtonText}>Enter Now</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    prizeDrawBanner: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    prizeDrawGradient: {
        padding: 16,
    },
    prizeDrawContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    prizeDrawInfo: {
        flex: 1,
    },
    prizeDrawTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    prizeDrawTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    prizeDrawSponsor: {
        fontSize: 14,
        color: '#FFF',
        opacity: 0.9,
        marginBottom: 12,
    },
    prizeDrawStats: {
        flexDirection: 'row',
        gap: 16,
    },
    prizeDrawStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    prizeDrawStatText: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '600',
    },
    enterButton: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginLeft: 16,
    },
    enterButtonText: {
        color: '#F59E0B',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default PrizeDrawBanner;
