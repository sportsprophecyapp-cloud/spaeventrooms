import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const PredictionModal = ({ visible, onClose, event }) => {
    const [selectedWinner, setSelectedWinner] = useState(null);
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Reset state when modal opens or event changes
    useEffect(() => {
        if (visible && event) {
            setSelectedWinner(null);
            setHomeScore('');
            setAwayScore('');
        }
    }, [visible, event]);

    if (!event) return null;

    const handleSubmit = async () => {
        if (!selectedWinner) {
            Alert.alert('Error', 'Please select a winner');
            return;
        }

        setLoading(true);
        try {
            await apiService.submitPrediction({
                userId: user.uuid,
                eventId: event.id,
                predictedWinner: selectedWinner,
                predictedScores: [parseInt(homeScore) || 0, parseInt(awayScore) || 0],
                eventType: 'matchup'
            });
            Alert.alert('Success', 'Prediction submitted! -10 tokens');
            setSelectedWinner(null);
            setHomeScore('');
            setAwayScore('');
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit prediction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Make Prediction</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                        {/* Matchup Card */}
                        <View style={styles.matchupCard}>
                            <View style={styles.teamContainer}>
                                <View style={styles.logoContainer}>
                                    <Text style={styles.logoText}>{event.homeTeam?.charAt(0) || 'H'}</Text>
                                </View>
                                <Text style={styles.teamName} numberOfLines={2}>{event.homeTeam || 'Home Team'}</Text>
                            </View>

                            <View style={styles.vsContainer}>
                                <Text style={styles.vsText}>VS</Text>
                            </View>

                            <View style={styles.teamContainer}>
                                <View style={styles.logoContainer}>
                                    <Text style={styles.logoText}>{event.awayTeam?.charAt(0) || 'A'}</Text>
                                </View>
                                <Text style={styles.teamName} numberOfLines={2}>{event.awayTeam || 'Away Team'}</Text>
                            </View>
                        </View>

                        {/* Who will win? */}
                        <Text style={styles.sectionTitle}>Who will win?</Text>
                        <View style={styles.winnerButtons}>
                            <TouchableOpacity
                                style={styles.winnerButton}
                                onPress={() => setSelectedWinner(event.homeTeam)}
                            >
                                <LinearGradient
                                    colors={selectedWinner === event.homeTeam ? COLORS.gradients.primary : ['#2C2C2C', '#2C2C2C']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.winnerGradient}
                                >
                                    <View style={styles.miniLogo}>
                                        <Text style={styles.miniLogoText}>{event.homeTeam?.charAt(0) || 'H'}</Text>
                                    </View>
                                    <Text style={[
                                        styles.winnerButtonText,
                                        selectedWinner === event.homeTeam && styles.winnerButtonTextSelected
                                    ]}>
                                        {event.homeTeam || 'Home'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.winnerButton}
                                onPress={() => setSelectedWinner(event.awayTeam)}
                            >
                                <LinearGradient
                                    colors={selectedWinner === event.awayTeam ? COLORS.gradients.primary : ['#2C2C2C', '#2C2C2C']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.winnerGradient}
                                >
                                    <View style={styles.miniLogo}>
                                        <Text style={styles.miniLogoText}>{event.awayTeam?.charAt(0) || 'A'}</Text>
                                    </View>
                                    <Text style={[
                                        styles.winnerButtonText,
                                        selectedWinner === event.awayTeam && styles.winnerButtonTextSelected
                                    ]}>
                                        {event.awayTeam || 'Away'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Predicted Score */}
                        <Text style={styles.sectionTitle}>Predicted Score (Optional)</Text>
                        <View style={styles.scoreContainer}>
                            <View style={styles.scoreBox}>
                                <Text style={styles.scoreLabel}>{event.homeTeam || 'Home'}</Text>
                                <TextInput
                                    style={styles.scoreInput}
                                    keyboardType="numeric"
                                    value={homeScore}
                                    onChangeText={setHomeScore}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.text.muted}
                                    maxLength={3}
                                />
                            </View>

                            <View style={styles.scoreDivider}>
                                <Text style={styles.scoreDividerText}>-</Text>
                            </View>

                            <View style={styles.scoreBox}>
                                <Text style={styles.scoreLabel}>{event.awayTeam || 'Away'}</Text>
                                <TextInput
                                    style={styles.scoreInput}
                                    keyboardType="numeric"
                                    value={awayScore}
                                    onChangeText={setAwayScore}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.text.muted}
                                    maxLength={3}
                                />
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={loading || !selectedWinner}
                        >
                            <LinearGradient
                                colors={!selectedWinner ? COLORS.gradients.disabled : COLORS.gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.text.inverse} />
                                ) : (
                                    <>
                                        <Text style={styles.submitText}>SUBMIT PREDICTION</Text>
                                        <Ionicons name="arrow-forward" size={20} color={COLORS.text.inverse} />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.background.overlay,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: COLORS.background.primary,
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
        padding: SPACING.lg,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        paddingBottom: SPACING.base,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    content: {
        flex: 1,
    },
    matchupCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
        borderWidth: 2,
        borderColor: COLORS.border.primary,
    },
    teamContainer: {
        alignItems: 'center',
        flex: 1,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.background.primary,
        borderWidth: 2,
        borderColor: COLORS.accent.cyan,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    logoText: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    teamName: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        textAlign: 'center',
    },
    vsContainer: {
        paddingHorizontal: SPACING.base,
    },
    vsText: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    sectionTitle: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginBottom: SPACING.md,
    },
    winnerButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    winnerButton: {
        flex: 1,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
    },
    winnerGradient: {
        padding: SPACING.base,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: SPACING.sm,
        minHeight: 60,
    },
    miniLogo: {
        width: 28,
        height: 28,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniLogoText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    winnerButtonText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    winnerButtonTextSelected: {
        color: COLORS.text.inverse,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        gap: SPACING.md,
    },
    scoreBox: {
        flex: 1,
    },
    scoreLabel: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.sm,
        marginBottom: SPACING.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        textAlign: 'center',
    },
    scoreInput: {
        backgroundColor: COLORS.background.card,
        height: 70,
        borderRadius: BORDER_RADIUS.md,
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.xxxl,
        fontWeight: TYPOGRAPHY.weights.black,
        textAlign: 'center',
        borderWidth: 2,
        borderColor: COLORS.border.secondary,
    },
    scoreDivider: {
        paddingTop: SPACING.xl,
    },
    scoreDividerText: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    submitButton: {
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        marginTop: SPACING.base,
        marginBottom: SPACING.lg,
        ...SHADOWS.cyan,
    },
    submitGradient: {
        paddingVertical: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    submitText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 1,
    },
});

export default PredictionModal;
