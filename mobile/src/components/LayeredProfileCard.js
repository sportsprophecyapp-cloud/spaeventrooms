import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LayeredProfileCard({ identity, size = 100 }) {
    if (!identity) return null;

    const {
        shape,
        gems,
        colour,
        portrait,
        title,
        aura
    } = identity;

    // SHAPE (Level 1-10+)
    // Circle vs RoundedSquare vs Diamond (we'll stick to dynamic borderRadius)
    let borderRadius = size / 2; // Default circle
    if (shape === 'Square') borderRadius = size * 0.15;
    if (shape === 'Hexagon') borderRadius = size * 0.3; // Approx
    if (shape === 'Diamond') borderRadius = 0; // Handled via rotation if needed, but let's keep it simple

    // AURA (Draws Won)
    // 0: none, 1: subtle glow, 2: medium, 3+: heavy gold glow
    let shadowStyle = {};
    if (aura > 0) {
        shadowStyle = {
            shadowColor: aura >= 3 ? '#FFD700' : '#4DB8FF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: aura * 0.3,
            shadowRadius: aura * 4,
            elevation: aura * 2,
        };
    }

    // COLOUR (Streak)
    // Map colors. 'Bronze', 'Silver', 'Gold', 'Diamond', 'Fire'
    let gradientColors = ['#1a1a24', '#2a2a35']; // Base unranked
    if (colour === 'Bronze') gradientColors = ['#cd7f32', '#8b4513'];
    if (colour === 'Silver') gradientColors = ['#e5e4e2', '#c0c0c0'];
    if (colour === 'Gold') gradientColors = ['#ffd700', '#daa520'];
    if (colour === 'Diamond') gradientColors = ['#b9f2ff', '#00d2ff'];
    if (colour === 'Fire') gradientColors = ['#ff4b1f', '#ff9068'];

    // GEMS (Arena Picks, 1-5)
    // We'll place tiny colored dots along the bottom edge
    const renderGems = () => {
        if (gems === 0) return null;
        const total = Math.min(gems, 5);
        const gemSize = size * 0.15;
        
        // We'll flex them in a row at the top or bottom
        return (
            <View style={[styles.gemContainer, { top: -gemSize / 2 }]}>
                {Array.from({ length: total }).map((_, i) => (
                    <View key={i} style={[styles.gem, { width: gemSize, height: gemSize, borderRadius: gemSize/2, backgroundColor: gradientColors[0] }]} />
                ))}
            </View>
        );
    };

    const containerStyle = {
        width: size,
        height: size,
        ...shadowStyle
    };

    return (
        <View style={styles.wrapper}>
            {/* The Main Card wrapper */}
            <View style={containerStyle}>
                
                {/* Border / Colour Streak */}
                <LinearGradient
                    colors={gradientColors}
                    style={[styles.gradientBorder, { borderRadius: borderRadius }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Inner Image / Portrait */}
                    <View style={[styles.innerBackground, { borderRadius: Math.max(0, borderRadius - 2) }]}>
                        {portrait.type === 'emoji' ? (
                            <Text style={{ fontSize: size * 0.4 }}>{portrait.value}</Text>
                        ) : portrait.type === 'url' ? (
                            <Image 
                                source={{ uri: portrait.value }} 
                                style={[styles.image, { borderRadius: Math.max(0, borderRadius - 2) }]} 
                            />
                        ) : null}
                    </View>
                </LinearGradient>
                
                {renderGems()}

                {/* TITLE BADGE */}
                {title && (
                    <View style={[styles.titleBadge, { bottom: -size * 0.15 }]}>
                        <Text style={[styles.titleText, { fontSize: Math.max(10, size * 0.12) }]}>
                            {title}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    gradientBorder: {
        width: '100%',
        height: '100%',
        padding: 3, // Border width
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerBackground: {
        width: '100%',
        height: '100%',
        backgroundColor: '#0A0A14',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gemContainer: {
        position: 'absolute',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
    },
    gem: {
        borderWidth: 1,
        borderColor: '#0A0A14',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
    },
    titleBadge: {
        position: 'absolute',
        backgroundColor: '#1E1E2C',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3a3a4c',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 5,
    },
    titleText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});
