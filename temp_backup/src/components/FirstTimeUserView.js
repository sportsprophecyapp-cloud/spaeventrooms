import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameCard from './GameCard';

const { width } = Dimensions.get('window');

const FirstTimeUserView = ({ navigation, games, onComplete }) => {
    const [loading, setLoading] = useState(false);

    // Use the first game as the featured game
    const featuredGame = games && games.length > 0 ? games[0] : null;

    const handleComplete = async () => {
        try {
            setLoading(true);
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            if (onComplete) {
                onComplete();
            } else {
                // Fallback reload or navigation
                navigation.replace('Home');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Simplified Hero */}
            <LinearGradient
                colors={['#3B82F6', '#8B5CF6', '#EC4899']}
                style={styles.hero}
            >
                <Text style={styles.welcomeTitle}>Welcome to Sports Prophecy! 🎯</Text>
                <Text style={styles.welcomeSubtext}>
                    Make predictions. Earn rewards. Win prizes.
                </Text>

                {/* Simple Token/Crown Explainer */}
                <View style={styles.currencyExplainer}>
                    <View style={styles.currencyCard}>
                        <Ionicons name="logo-bitcoin" size={32} color="#FCD34D" />
                        <Text style={styles.currencyTitle}>Tokens</Text>
                        <Text style={styles.currencyDesc}>
                            Free to use. Earn daily.
                        </Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                    <View style={styles.currencyCard}>
                        <Ionicons name="trophy" size={32} color="#FCD34D" />
                        <Text style={styles.currencyTitle}>Crowns</Text>
                        <Text style={styles.currencyDesc}>
                            Win these with correct predictions.
                        </Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                    <View style={styles.currencyCard}>
                        <Ionicons name="gift" size={32} color="#FCD34D" />
                        <Text style={styles.currencyTitle}>Prizes</Text>
                        <Text style={styles.currencyDesc}>
                            Use crowns to enter prize draws.
                        </Text>
                    </View>
                </View>

                {/* Compliance Note */}
                <View style={styles.complianceNote}>
                    <Text style={styles.complianceText}>
                        ✓ 100% Free • No Deposits • Skill-Based Only
                    </Text>
                </View>
            </LinearGradient>

            {/* Featured Game (Just ONE) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Make Your First Prediction</Text>
                <Text style={styles.sectionSubtext}>
                    Pick the winner of today's featured game:
                </Text>
                {/* Show only 1 game card */}
                {featuredGame ? (
                    <GameCard
                        game={featuredGame}
                        onPress={() => navigation.navigate('Sport', { sportId: featuredGame.sport_key })}
                    />
                ) : (
                    <View style={styles.noGamesCard}>
                        <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                        <Text style={styles.noGamesText}>No games available right now. Check back later!</Text>
                    </View>
                )}
            </View>

            {/* Simple 3-Step How It Works */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>How It Works</Text>
                <View style={styles.step}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                    <Text style={styles.stepText}>Pick a winner</Text>
                </View>
                <View style={styles.step}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                    <Text style={styles.stepText}>Earn crowns when correct</Text>
                </View>
                <View style={styles.step}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                    <Text style={styles.stepText}>Enter prize draws</Text>
                </View>
            </View>

            {/* CTA to see full app */}
            <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleComplete}
            >
                <Text style={styles.ctaButtonText}>Start Playing — It's Free</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    hero: {
        padding: 24,
        paddingTop: 60,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    welcomeSubtext: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 24,
    },
    currencyExplainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    currencyCard: {
        alignItems: 'center',
        flex: 1,
    },
    currencyTitle: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
    currencyDesc: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 2,
    },
    arrow: {
        color: '#FFF',
        fontSize: 20,
        opacity: 0.5,
    },
    complianceNote: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    complianceText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    sectionSubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    noGamesCard: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    noGamesText: {
        marginTop: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    stepNumber: {
        width: 32,
        height: 32,
        backgroundColor: '#3B82F6',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    stepNumberText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    stepText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    ctaButton: {
        backgroundColor: '#3B82F6',
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 20,
    },
    ctaButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default FirstTimeUserView;
