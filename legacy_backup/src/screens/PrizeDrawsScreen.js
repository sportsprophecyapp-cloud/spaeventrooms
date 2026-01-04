import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Linking, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SocialProofCard from '../components/SocialProofCard';

const { width } = Dimensions.get('window');

const PrizeDrawsScreen = ({ navigation }) => {
    const { user, updateUser } = useAuth();
    const [activeDraw, setActiveDraw] = useState(null);
    const [upcomingDraws, setUpcomingDraws] = useState([]);
    const [sponsors, setSponsors] = useState([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [entering, setEntering] = useState(false);
    const [userEntries, setUserEntries] = useState(0);
    const [totalDrawEntries, setTotalDrawEntries] = useState(0);


    useEffect(() => {
        loadData();
    }, []);

    // Sponsor ad rotation (every 10 seconds)
    useEffect(() => {
        if (sponsors.length > 1) {
            const interval = setInterval(() => {
                setCurrentAdIndex((prev) => (prev + 1) % sponsors.length);
            }, 10000); // 10 seconds
            return () => clearInterval(interval);
        }
    }, [sponsors]);

    const loadData = async () => {
        try {
            setLoading(true);
            const prizes = await apiService.getActivePrizeSponsors();
            const prizeDrawSponsors = await apiService.getPrizeDrawSponsors();
            setSponsors(prizeDrawSponsors || []);

            // Fetch real entry stats
            const stats = await apiService.getWeeklyDrawStats();
            setTotalDrawEntries(stats.totalEntries || 0);

            if (user && user.uuid && !user.isGuest) {
                const userStats = await apiService.getUserWeeklyDrawEntries(user.uuid);
                setUserEntries(userStats.count || 0);
            }

            if (Array.isArray(prizes) && prizes.length > 0) {
                const format = (p) => ({
                    id: p._id,
                    title: p.prizeDetails?.description || 'Prize Draw',
                    sponsor: p.sponsorName,
                    entries: stats.totalEntries || 0,
                    endsIn: '2d 5h',
                    cost: 1,
                    image: p.bannerUrl
                });

                setActiveDraw(format(prizes[0]));
                setUpcomingDraws(prizes.slice(1).map(format));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };


    const handleEnterDraw = async () => {
        if (!user || user.isGuest) {
            Alert.alert('Sign In Required', 'You need to create an account to enter prize draws.');
            return;
        }

        if (user.crowns < 1) {
            Alert.alert('Insufficient Crowns', 'Make more predictions to earn crowns!');
            return;
        }

        try {
            setEntering(true);
            const result = await apiService.enterWeeklyDraw(user.uuid);

            if (result.success) {
                // Update local context
                await updateUser({ crowns: result.crowns });

                if (Platform.OS === 'web') {
                    window.alert('🎉 Entry Confirmed! Good luck!');
                } else {
                    Alert.alert('🎉 Success!', 'Your entry has been recorded. Good luck!');
                }

                // Refresh draw stats if needed
                loadData();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to enter draw. Please try again.';
            Alert.alert('Error', errorMsg);
        } finally {
            setEntering(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Header */}
                <LinearGradient
                    colors={['#FACC15', '#F97316', '#EC4899']} // Yellow -> Orange -> Pink
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.hero}
                >
                    <SafeAreaView>
                        <View style={styles.headerContent}>
                            <Text style={styles.pageTitle}>Prize Draws</Text>
                            <Text style={styles.pageSubtitle}>Use your crowns to enter for amazing prizes</Text>

                            <View style={styles.crownBadge}>
                                <MaterialCommunityIcons name="crown" size={20} color="#F59E0B" />
                                <Text style={styles.crownText}>You have {user?.crowns || 0} crowns</Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Top Sponsor Banner */}
                {sponsors.length > 0 && (
                    <TouchableOpacity
                        onPress={() => Linking.openURL(sponsors[currentAdIndex].linkUrl)}
                        style={styles.sponsorBanner}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={{ uri: sponsors[currentAdIndex].bannerUrl }}
                            style={styles.sponsorBannerImage}
                            resizeMode="cover"
                        />
                        <View style={styles.sponsorLabel}>
                            <Text style={styles.sponsorLabelText}>Sponsored</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <View style={styles.content}>
                    {/* Active Draw Card */}
                    {activeDraw ? (
                        <View style={styles.activeDrawCard}>
                            {/* Header Strip */}
                            <LinearGradient
                                colors={['#FACC15', '#F97316']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.activeDrawHeader}
                            >
                                <View style={styles.activeTag}>
                                    <Ionicons name="flash" size={16} color="#FFF" />
                                    <Text style={styles.activeTagText}>ACTIVE DRAW</Text>
                                </View>
                            </LinearGradient>

                            <View style={styles.activeDrawBody}>
                                <View style={styles.activeDrawInfo}>
                                    <Text style={styles.drawTitle}>{activeDraw.title}</Text>
                                    <Text style={styles.sponsorText}>Sponsored by {activeDraw.sponsor}</Text>

                                    <View style={styles.drawStatsRow}>
                                        <View style={styles.statItem}>
                                            <Ionicons name="time-outline" size={16} color="#EA580C" />
                                            <Text style={styles.statText}>{activeDraw.endsIn}</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Ionicons name="people-outline" size={16} color="#EA580C" />
                                            <Text style={styles.statText}>{activeDraw.entries} entries</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* User Entries Box */}
                                <View style={styles.userEntriesBox}>
                                    <Text style={styles.userEntriesLabel}>Your Entries</Text>
                                    <Text style={styles.userEntriesValue}>{userEntries} entries</Text>
                                    <Text style={styles.userEntriesSub}>
                                        Odds: ~1 in {totalDrawEntries > 0 ? Math.ceil(totalDrawEntries / Math.max(userEntries, 1)) : 1}
                                    </Text>
                                </View>


                                <TouchableOpacity
                                    style={[styles.enterButton, entering && { opacity: 0.7 }]}
                                    onPress={handleEnterDraw}
                                    disabled={entering}
                                >
                                    <LinearGradient
                                        colors={['#FACC15', '#F97316']}
                                        style={styles.enterButtonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {entering ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <>
                                                <MaterialCommunityIcons name="crown" size={20} color="#FFF" />
                                                <Text style={styles.enterButtonText}>Enter Draw (1 Crown)</Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        // Fallback / Loading State
                        <View style={[styles.activeDrawCard, { height: 200, justifyContent: 'center', alignItems: 'center' }]}>
                            <Text>No active draws currently.</Text>
                        </View>
                    )}

                    {/* Upcoming Draws */}
                    <Text style={styles.sectionTitle}>Upcoming Draws</Text>
                    {upcomingDraws.length > 0 ? (
                        (Array.isArray(upcomingDraws) ? upcomingDraws : []).map((draw) => (
                            <View key={draw.id} style={styles.upcomingCard}>
                                <View style={styles.upcomingInfo}>
                                    <Text style={styles.upcomingTitle}>{draw.title}</Text>
                                    <Text style={styles.upcomingSponsor}>Sponsored by {draw.sponsor}</Text>
                                    <Text style={styles.upcomingTime}>Coming Soon</Text>
                                </View>
                                <MaterialCommunityIcons name="star" size={32} color="#F59E0B" />
                            </View>
                        ))
                    ) : (
                        <View style={[styles.upcomingCard, { opacity: 0.7 }]}>
                            <Text style={{ color: '#6B7280', fontStyle: 'italic' }}>No upcoming draws scheduled.</Text>
                        </View>
                    )}

                    {/* Mid-Page Sponsor Banner */}
                    {sponsors.length > 0 && (
                        <TouchableOpacity
                            onPress={() => Linking.openURL(sponsors[currentAdIndex].linkUrl)}
                            style={[styles.sponsorBanner, { marginTop: 24, marginBottom: 8 }]}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={{ uri: sponsors[currentAdIndex].bannerUrl }}
                                style={styles.sponsorBannerImage}
                                resizeMode="cover"
                            />
                            <View style={styles.sponsorLabel}>
                                <Text style={styles.sponsorLabelText}>Sponsored</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Recent Winners (Social Proof) */}
                    <Text style={styles.sectionTitle}>Recent Winners</Text>
                    <SocialProofCard
                        user="BenchWarmer"
                        amount="50 Google Gift Card"
                        message="Still can't believe I won! This app is the real deal! 🔥"
                        type="winner"
                    />

                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    hero: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 24,
    },
    headerContent: {
        alignItems: 'flex-start',
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    pageSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
    },
    crownBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 8,
    },
    crownText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    content: {
        padding: 16,
    },
    activeDrawCard: {
        backgroundColor: '#FFF5F5', // Light orange tint
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#FACC15', // Yellow border
        marginBottom: 24,
        marginTop: -10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    activeDrawHeader: {
        padding: 12,
    },
    activeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    activeTagText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    activeDrawBody: {
        padding: 24,
        backgroundColor: '#FFF7ED', // Orange-50
    },
    drawTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    sponsorText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 12,
    },
    drawStatsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EA580C',
    },
    userEntriesBox: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#FED7AA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    userEntriesLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    userEntriesValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#EA580C',
    },
    userEntriesSub: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    enterButton: {
        overflow: 'hidden',
        borderRadius: 12,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    enterButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    enterButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
        marginTop: 8,
    },
    upcomingCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
    },
    upcomingInfo: {
        flex: 1,
    },
    upcomingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    upcomingSponsor: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    upcomingTime: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    sponsorBanner: {
        marginHorizontal: 16,
        marginTop: -10,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sponsorBannerImage: {
        width: '100%',
        height: 100,
    },
    sponsorLabel: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    sponsorLabelText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});

export default PrizeDrawsScreen;
