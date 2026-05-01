import React, { useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, Share } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getTeamLogo } from '../utils/teamLogos';

const { width } = Dimensions.get('window');

const PredictionShareCard = ({ visible, onClose, homeTeam, awayTeam, pick, username, referralCode }) => {
    const viewShotRef = useRef();

    if (!visible) return null;

    const handleShare = async () => {
        try {
            const uri = await viewShotRef.current.capture();
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    dialogTitle: 'Share your prediction!',
                    mimeType: 'image/png',
                });
            } else {
                // Fallback to basic text share if image sharing not available
                Share.share({
                    message: `I'm picking ${pick} to win! Join me in the Events Arena: https://sportsprophecyapp.com?ref=${referralCode}`,
                });
            }
        } catch (error) {
            console.error('Error sharing card:', error);
        }
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.modalContainer}>
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>

                {/* The Shareable Visual (Captured by ViewShot) */}
                <ViewShot 
                    ref={viewShotRef} 
                    options={{ format: 'png', quality: 0.9 }}
                    style={styles.captureArea}
                >
                    <LinearGradient
                        colors={['#0f172a', '#1e293b']}
                        style={styles.cardFrame}
                    >
                        <View style={styles.cardHeader}>
                            <Image 
                                source={require('../../assets/icon.png')} 
                                style={styles.appIcon} 
                            />
                            <View>
                                <Text style={styles.appTitle}>EVENTS ARENA</Text>
                                <Text style={styles.matchDate}>PROPHESY LOCK-IN</Text>
                            </View>
                        </View>

                        <View style={styles.vsRow}>
                            <View style={styles.teamBox}>
                                <Image source={{ uri: getTeamLogo(homeTeam) }} style={styles.shareLogo} />
                                <Text style={styles.shareTeamName} numberOfLines={1}>{homeTeam}</Text>
                            </View>
                            <Text style={styles.vsText}>VS</Text>
                            <View style={styles.teamBox}>
                                <Image source={{ uri: getTeamLogo(awayTeam) }} style={styles.shareLogo} />
                                <Text style={styles.shareTeamName} numberOfLines={1}>{awayTeam}</Text>
                            </View>
                        </View>

                        <View style={styles.pickSection}>
                            <Text style={styles.pickLabel}>{username.toUpperCase()}'S PICK</Text>
                            <LinearGradient
                                colors={COLORS.gradients.primary}
                                style={styles.pickBadge}
                            >
                                <Text style={styles.pickText}>{pick.toUpperCase()}</Text>
                            </LinearGradient>
                        </View>

                        <View style={styles.cardFooter}>
                            <Text style={styles.footerText}>JOIN THE ARENA</Text>
                            <Text style={styles.urlText}>sportsprophecyapp.com</Text>
                            <View style={styles.refBadge}>
                                <Text style={styles.refText}>USE CODE: {referralCode}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </ViewShot>

                {/* Action Button */}
                <TouchableOpacity style={styles.shareActionButton} onPress={handleShare}>
                    <LinearGradient
                        colors={COLORS.gradients.gold}
                        style={styles.shareGradient}
                    >
                        <Ionicons name="share-social" size={20} color={COLORS.text.dark} />
                        <Text style={styles.shareActionText}>SHARE TO SOCIAL</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        width: width * 0.9,
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        alignItems: 'center',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: SPACING.sm,
    },
    captureArea: {
        width: 320,
        height: 480,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        marginVertical: SPACING.lg,
    },
    cardFrame: {
        flex: 1,
        padding: SPACING.xl,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    appIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    appTitle: {
        color: COLORS.text.primary,
        fontSize: 16,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 2,
    },
    matchDate: {
        color: COLORS.accent.cyan,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    vsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xl,
    },
    teamBox: {
        alignItems: 'center',
        width: 100,
    },
    shareLogo: {
        width: 60,
        height: 60,
        marginBottom: SPACING.sm,
    },
    shareTeamName: {
        color: COLORS.text.primary,
        fontSize: 12,
        fontWeight: TYPOGRAPHY.weights.bold,
        textAlign: 'center',
    },
    vsText: {
        color: COLORS.text.tertiary,
        fontSize: 24,
        fontWeight: TYPOGRAPHY.weights.black,
        fontStyle: 'italic',
    },
    pickSection: {
        alignItems: 'center',
    },
    pickLabel: {
        color: COLORS.text.secondary,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: 2,
        marginBottom: SPACING.sm,
    },
    pickBadge: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        ...SHADOWS.glow,
    },
    pickText: {
        color: COLORS.text.dark,
        fontSize: 20,
        fontWeight: TYPOGRAPHY.weights.black,
    },
    cardFooter: {
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.text.secondary,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.bold,
        letterSpacing: 1,
    },
    urlText: {
        color: COLORS.text.primary,
        fontSize: 14,
        fontWeight: TYPOGRAPHY.weights.black,
        marginBottom: SPACING.sm,
    },
    refBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
    },
    refText: {
        color: COLORS.accent.gold,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    shareActionButton: {
        width: '100%',
        height: 56,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        marginTop: SPACING.md,
    },
    shareGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.md,
    },
    shareActionText: {
        color: COLORS.text.dark,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.black,
    },
});

export default PredictionShareCard;
