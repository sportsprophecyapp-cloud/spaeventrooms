import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAvatarSource } from '../constants/avatars';
import { COLORS, SHADOWS } from '../constants/theme';

const UserAvatar = ({ size = 40, profilePicture, selectedBadge, fallbackName, style, showGlow = true, customBadgeSize }) => {
    const source = getAvatarSource(profilePicture);
    const badgeSource = selectedBadge ? getAvatarSource(selectedBadge) : null;

    const renderBadge = (badgeObj, badgeSize, isFloating = false) => {
        if (!badgeObj || !badgeObj.icon) return null;

        return (
            <View style={[
                styles.badgeOuterContainer,
                { width: badgeSize, height: badgeSize },
                isFloating && styles.floatingBadge,
                isFloating && {
                    bottom: badgeOffset,
                    right: badgeOffset,
                    borderColor: COLORS.background.primary,
                }
            ]}>
                {/* Main Body with Metallic Gradient */}
                <LinearGradient
                    colors={[badgeObj.color, '#ffffff60', badgeObj.secondaryColor, badgeObj.color]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.badgeMain,
                        { borderRadius: badgeSize / 2 }
                    ]}
                >
                    {/* Inner Glass/Glow Effect */}
                    <View style={[
                        styles.badgeInner,
                        { borderRadius: (badgeSize * 0.85) / 2, width: badgeSize * 0.85, height: badgeSize * 0.85 }
                    ]}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)', 'rgba(0,0,0,0.1)']}
                            style={StyleSheet.absoluteFill}
                        />

                        <Ionicons
                            name={badgeObj.icon}
                            size={badgeSize * 0.5}
                            color="#fff"
                            style={styles.badgeIcon}
                        />
                    </View>

                    {/* Glossy Sheen Overlay */}
                    <View style={[
                        styles.badgeSheen,
                        { borderRadius: badgeSize / 2 }
                    ]}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.1)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </View>
                </LinearGradient>

                {/* Subtle Glow Background */}
                {showGlow && (
                    <View style={[
                        styles.badgeGlow,
                        {
                            width: badgeSize * 1.2,
                            height: badgeSize * 1.2,
                            borderRadius: (badgeSize * 1.2) / 2,
                            backgroundColor: badgeObj.glowColor || 'rgba(255,255,255,0.1)'
                        }
                    ]} />
                )}
            </View>
        );
    };

    const renderMainAvatar = () => {
        // If it's a badge object being used as the primary avatar
        if (source && source.id && source.icon) {
            return renderBadge(source, size, false);
        }

        // If no source, show safe placeholder
        if (!source) {
            return (
                <View style={[
                    styles.placeholder,
                    { width: size, height: size, borderRadius: size / 2 },
                ]}>
                    <Text style={[styles.placeholderText, { fontSize: size * 0.4 }]}>
                        {fallbackName?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
            );
        }

        // Standard Image source (require or uri)
        return (
            <Image
                source={source}
                style={{ width: size, height: size, borderRadius: size / 2 }}
            />
        );
    };

    const currentBadgeSize = customBadgeSize || (size * 0.4);
    const badgeOffset = -size * 0.02;

    return (
        <View style={[styles.container, style]}>
            {renderMainAvatar()}
            {badgeSource && renderBadge(badgeSource, currentBadgeSize, true)}
        </View>
    );
};

const styles = StyleSheet.create({
    badgeOuterContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badgeMain: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        overflow: 'hidden',
        zIndex: 2,
    },
    badgeInner: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    badgeIcon: {
        zIndex: 3,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    badgeSheen: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 4,
        pointerEvents: 'none',
    },
    badgeGlow: {
        position: 'absolute',
        zIndex: 1,
        opacity: 0.6,
        transform: [{ scale: 1.1 }],
    },
    placeholder: {
        backgroundColor: COLORS.background.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
    },
    placeholderText: {
        color: COLORS.text.tertiary,
        fontWeight: 'bold',
    },
    container: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingBadge: {
        position: 'absolute',
        zIndex: 10,
        borderWidth: 1.5,
        ...SHADOWS.sm,
        overflow: 'hidden',
    },
    badgeGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default UserAvatar;
