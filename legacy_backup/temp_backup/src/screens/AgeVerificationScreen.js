import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, SafeAreaView, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const AgeVerificationScreen = () => {
    const { verifyAge } = useAuth();
    const [birthYear, setBirthYear] = useState('');

    const handleVerify = async () => {
        if (!birthYear || birthYear.length !== 4) {
            Alert.alert('Invalid Input', 'Please enter a valid 4-digit birth year.');
            return;
        }

        const year = parseInt(birthYear);
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;

        if (age < 13) {
            Alert.alert(
                'Access Denied',
                'You must be at least 13 years old to use Sports Prophecy.',
                [{ text: 'OK' }]
            );
            return;
        }

        if (age > 100 || year > currentYear) {
            Alert.alert('Invalid Year', 'Please enter a valid birth year.');
            return;
        }

        await verifyAge();
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../assets/landing_bg.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['rgba(10, 22, 40, 0.9)', 'rgba(10, 22, 40, 0.95)']}
                    style={styles.gradientOverlay}
                />
            </ImageBackground>

            <SafeAreaView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.logoText}>SPORTS <Text style={styles.logoAccent}>PROPHECY</Text></Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}>Age Verification</Text>
                    <Text style={styles.subtitle}>
                        Please enter your year of birth to continue.
                        {'\n'}
                        <Text style={styles.privacyNote}>This data is not stored on our servers.</Text>
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Birth Year</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY"
                            placeholderTextColor={COLORS.text.tertiary}
                            keyboardType="numeric"
                            maxLength={4}
                            value={birthYear}
                            onChangeText={setBirthYear}
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleVerify}>
                        <LinearGradient
                            colors={COLORS.gradients.gold}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.buttonText}>Continue</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
        justifyContent: 'center',
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xxxl,
    },
    logoText: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        letterSpacing: 2,
    },
    logoAccent: {
        color: COLORS.accent.cyan,
    },
    card: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    privacyNote: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.tertiary,
    },
    inputContainer: {
        width: '100%',
        marginBottom: SPACING.xl,
    },
    label: {
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    input: {
        backgroundColor: COLORS.background.input,
        borderWidth: 1,
        borderColor: COLORS.border.primary,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.lg,
        textAlign: 'center',
        letterSpacing: 2,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.text.inverse,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.bold,
        letterSpacing: 1,
    },
});

export default AgeVerificationScreen;
