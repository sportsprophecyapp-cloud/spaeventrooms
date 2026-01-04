import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const AdminSponsorsScreen = () => {
    const navigation = useNavigation();
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchPendingSponsors();
    }, []);

    const fetchPendingSponsors = async () => {
        setLoading(true);
        try {
            const data = await apiService.getPendingSponsors();
            setSponsors(data);
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Failed to load pending sponsors.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, duration) => {
        setProcessingId(id);
        try {
            await apiService.approveSponsor(id, duration);
            Alert.alert('Success', `Sponsor Approved for ${duration === '1week' ? '1 Week' : '1 Month'}!`);
            setSponsors(prev => prev.filter(s => s._id !== id));
        } catch (error) {
            Alert.alert('Error', 'Failed to approve sponsor.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        Alert.alert(
            'Confirm Reject',
            'Are you sure you want to reject and delete this application?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        setProcessingId(id);
                        try {
                            await apiService.rejectSponsor(id);
                            setSponsors(prev => prev.filter(s => s._id !== id));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reject sponsor.');
                        } finally {
                            setProcessingId(null);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.typeBadge}>{item.type.toUpperCase()}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>

            <Text style={styles.sponsorName}>{item.sponsorName}</Text>
            <Text style={styles.detail}>Email: {item.contactEmail || 'N/A'}</Text>
            <Text style={styles.detail}>Link: {item.linkUrl}</Text>

            {item.type === 'prize' && (
                <View style={styles.prizeBox}>
                    <Text style={styles.prizeTitle}>Prize Info:</Text>
                    <Text style={styles.detail}>{item.prizeDescription}</Text>
                </View>
            )}

            {item.bannerUrl && (
                <Image source={{ uri: item.bannerUrl }} style={styles.bannerPreview} resizeMode="contain" />
            )}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.btn, styles.btnReject]}
                    onPress={() => handleReject(item._id)}
                    disabled={!!processingId}
                >
                    <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.btnApprove, { backgroundColor: '#059669' }]}
                    onPress={() => handleApprove(item._id, '1week')}
                    disabled={!!processingId}
                >
                    <Text style={styles.btnText}>1W</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.btnApprove, { backgroundColor: '#047857' }]}
                    onPress={() => handleApprove(item._id, '1month')}
                    disabled={!!processingId}
                >
                    {processingId === item._id ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>1M</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pending Approvals</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.accent.cyan} />
                </View>
            ) : (
                <FlatList
                    data={sponsors}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No pending applications.</Text>
                        </View>
                    }
                />
            )}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.secondary,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    list: {
        padding: SPACING.md,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.lg,
    },
    card: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    typeBadge: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: 'bold',
        color: COLORS.accent.cyan,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    date: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.tertiary,
    },
    sponsorName: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    detail: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        marginBottom: 2,
    },
    prizeBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginVertical: SPACING.sm,
    },
    prizeTitle: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.tertiary,
        marginBottom: 2,
    },
    bannerPreview: {
        width: '100%',
        height: 100,
        backgroundColor: '#000',
        borderRadius: BORDER_RADIUS.md,
        marginVertical: SPACING.md,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.sm,
    },
    btn: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    btnReject: {
        backgroundColor: COLORS.status.error,
    },
    btnApprove: {
        backgroundColor: COLORS.status.success,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AdminSponsorsScreen;
