import React from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * BackgroundWrapper Component
 * Provides consistent background styling across all app screens
 * matching the landing page aesthetic with background image and gradient overlay
 */
const BackgroundWrapper = ({ children, style }) => {
    return (
        <View style={[styles.container, style]}>
            <ImageBackground
                source={require('../../assets/landing_bg.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['rgba(10, 22, 40, 0.85)', 'rgba(10, 22, 40, 0.95)']}
                    style={styles.gradientOverlay}
                />
            </ImageBackground>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default BackgroundWrapper;
