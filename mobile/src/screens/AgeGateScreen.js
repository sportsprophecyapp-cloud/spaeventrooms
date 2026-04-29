import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AgeGateScreen = ({ navigation, onVerify }) => {
    const [agreed, setAgreed] = useState(false);

    const handleContinue = async () => {
        if (!agreed) return;

        try {
            await AsyncStorage.setItem('ageVerified', 'true');
            await AsyncStorage.setItem('ageVerifiedDate', new Date().toISOString());

            if (typeof onVerify === 'function') {
                onVerify();
            } else {
                // Fallback navigation if used in a flow without state callback
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            }
        } catch (error) {
            console.error('Error saving age verification:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="shield-checkmark" size={64} color="#3B82F6" style={styles.icon} />

                <Text style={styles.title}>Age Verification Required</Text>

                <Text style={styles.description}>
                    You must be 18 years or older to use Events Arena.
                </Text>

                <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                        style={[styles.checkbox, agreed && styles.checkboxChecked]}
                        onPress={() => setAgreed(!agreed)}
                        activeOpacity={0.8}
                    >
                        {agreed && <Ionicons name="checkmark" size={20} color="#FFF" />}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setAgreed(!agreed)} activeOpacity={1}>
                        <Text style={styles.checkboxLabel}>
                            I confirm I am 18 years or older
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, !agreed && styles.continueButtonDisabled]}
                    onPress={handleContinue}
                    disabled={!agreed}
                >
                    <LinearGradient
                        colors={agreed ? ['#3B82F6', '#2563EB'] : ['#D1D5DB', '#9CA3AF']}
                        style={styles.gradientButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                        {agreed && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.legalText}>
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    icon: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 48,
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    checkbox: {
        width: 28,
        height: 28,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: '#FFF',
    },
    checkboxChecked: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    checkboxLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    continueButton: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    continueButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    continueButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    legalText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 18,
    },
});

export default AgeGateScreen;
