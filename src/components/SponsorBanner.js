import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

import * as WebBrowser from 'expo-web-browser';

// Import local asset for test banner
// Note: In a real app, images are usually remote URLs. For local assets, we need to resolve them or use them directly in Image source.
// However, the Image component 'source' prop handles both {uri} and require(). 
// But our data structure expects 'bannerUrl' as a string URI.
// For this test, we will handle the local asset specifically in the render.


const SponsorBanner = ({ style, sponsor = null }) => {
    const navigation = useNavigation();
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(!sponsor);
    const [currentSponsor, setCurrentSponsor] = useState(sponsor);

    useEffect(() => {
        if (!sponsor) {
            fetchSponsors();
        } else {
            setCurrentSponsor(sponsor);
            setLoading(false);
        }
    }, [sponsor]);

    const fetchSponsors = async () => {
        try {
            const activeSponsors = await apiService.getActiveSponsors();

            setSponsors(activeSponsors);

            if (activeSponsors && activeSponsors.length > 0) {
                // Pick a random sponsor to start
                const randomIndex = Math.floor(Math.random() * activeSponsors.length);
                setCurrentSponsor(activeSponsors[randomIndex]);
            } else {
                // No sponsors - show placeholder
                setCurrentSponsor(null);
            }
        } catch (error) {
            console.error('Failed to fetch sponsors:', error);
            // Show placeholder on error
            setCurrentSponsor(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePress = async () => {
        if (currentSponsor && currentSponsor.linkUrl) {
            try {
                // Open in in-app browser to keep user in the app
                await WebBrowser.openBrowserAsync(currentSponsor.linkUrl);
            } catch (error) {
                console.error("Failed to open browser:", error);
                Linking.openURL(currentSponsor.linkUrl); // Fallback
            }
        } else {
            // Navigate to SponsorScreen if it's the placeholder or no link
            navigation.navigate('Sponsor');
        }
    };

    if (loading) {
        return null; // Or a small skeleton loader if preferred
    }

    if (!currentSponsor) {
        // Default "Advertise Here" Banner
        return (
            <TouchableOpacity onPress={() => navigation.navigate('Sponsor')} style={[styles.container, style]}>
                <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="megaphone-outline" size={24} color={COLORS.accent.cyan} />
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.title}>YOUR BRAND HERE</Text>
                        <Text style={styles.subtitle}>Reach thousands of sports fans!</Text>
                    </View>
                    <View style={styles.action}>
                        <Text style={styles.actionText}>Advertise</Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.text.secondary} />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={handlePress} style={[styles.container, style]}>
            {currentSponsor.bannerUrl ? (
                // Image Banner
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: currentSponsor.bannerUrl }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.imageOverlay}
                    >
                        <Text style={styles.sponsoredTag}>SPONSORED</Text>
                    </LinearGradient>
                </View>
            ) : (
                // Text/Gradient Banner Fallback (if no image provided, though unlikely for paid ads)
                <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        <Text style={styles.title}>{currentSponsor.sponsorName}</Text>
                        <Text style={styles.subtitle}>Tap to visit website</Text>
                    </View>
                    <View style={styles.action}>
                        <Ionicons name="open-outline" size={20} color={COLORS.accent.cyan} />
                    </View>
                </LinearGradient>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border.tertiary,
        backgroundColor: COLORS.background.secondary, // Fallback
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    content: {
        flex: 1,
    },
    title: {
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.sm,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    subtitle: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.xs,
    },
    action: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    imageContainer: {
        width: '100%',
        height: 80, // Fixed height for image banners
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        justifyContent: 'center',
        paddingHorizontal: SPACING.sm,
    },
    sponsoredTag: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});

export default SponsorBanner;
