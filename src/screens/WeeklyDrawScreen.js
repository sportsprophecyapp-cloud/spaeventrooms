import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const WeeklyDrawScreen = ({ navigation }) => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalEntries: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const data = await apiService.getWeeklyDrawStats();
        setStats(data);
    };

    const handleEnterDraw = async () => {
        if (!user || user.crowns < 1) {
            Alert.alert('Insufficient Crowns', 'You need at least 1 crown to enter the draw.');
            return;
        }

        setLoading(true);
        try {
            await apiService.enterWeeklyDraw(user.uuid);
            await refreshUser(); // Update crown count
            await fetchStats(); // Update total entries
            Alert.alert('Success', 'You have entered the weekly draw!');
        } catch (error) {
            Alert.alert('Error', error.error || 'Failed to enter draw');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Back Button" testID="weekly-draw-back-button">
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Weekly Draw</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.prizeCard}>
                    <MaterialCommunityIcons name="gift-outline" size={80} color="#fbbf24" />
                    <Text style={styles.prizeTitle}>Weekly Grand Prize</Text>
                    <Text style={styles.prizeDescription}>Win a signed jersey from your favorite team!</Text>
                    <Text style={styles.entriesText}>{stats.totalEntries} entries so far</Text>
                </View>

                <View style={styles.actionContainer}>
                    <View style={styles.costContainer}>
                        <Text style={styles.costLabel}>Entry Cost:</Text>
                        <View style={styles.costValue}>
                            <Text style={styles.costText}>1</Text>
                            <MaterialCommunityIcons name="crown" size={24} color="#38bdf8" />
                        </View>
                    </View>

                    <View style={styles.balanceContainer}>
                        <Text style={styles.balanceLabel}>Your Balance:</Text>
                        <View style={styles.costValue}>
                            <Text style={[styles.costText, user?.crowns < 1 && styles.insufficientFunds]}>
                                {user?.crowns || 0}
                            </Text>
                            <MaterialCommunityIcons name="crown" size={24} color="#38bdf8" />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleEnterDraw}
                        disabled={loading || user?.crowns < 1}
                        style={{ borderRadius: 12, overflow: 'hidden' }}
                        accessibilityLabel="Enter Draw"
                        testID="weekly-draw-enter-button"
                    >
                        <LinearGradient
                            colors={(loading || user?.crowns < 1) ? ['#334155', '#334155'] : ['#00d4ff', '#2979ff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.enterButton, (loading || user?.crowns < 1) && styles.disabledButton]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.enterButtonText}>Enter Draw</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    prizeCard: {
        alignItems: 'center',
        marginBottom: 50,
    },
    prizeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fbbf24',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    prizeDescription: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 20,
    },
    entriesText: {
        fontSize: 14,
        color: '#64748b',
        fontStyle: 'italic',
    },
    actionContainer: {
        width: '100%',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    costContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    balanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    costLabel: {
        fontSize: 16,
        color: '#94a3b8',
    },
    balanceLabel: {
        fontSize: 16,
        color: '#94a3b8',
    },
    costValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    costText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    insufficientFunds: {
        color: '#ef4444',
    },
    enterButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    disabledButton: {
        opacity: 0.5,
    },
    enterButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default WeeklyDrawScreen;
