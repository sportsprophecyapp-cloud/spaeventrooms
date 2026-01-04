import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../services/api';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendCode = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/forgot-password', { email });
            navigation.navigate('ResetPassword', { email });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background.primary, COLORS.background.secondary]}
                style={styles.background}
            />
            <SafeAreaView style={styles.content}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>

                <View style={styles.formContainer}>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>Enter your email to receive a reset code.</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color={COLORS.text.tertiary} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={COLORS.text.muted}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
                        <LinearGradient
                            colors={COLORS.gradients.primary}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SEND CODE</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background.primary },
    background: { position: 'absolute', width: '100%', height: '100%' },
    content: { flex: 1 },
    backButton: { margin: SPACING.md, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background.card, borderRadius: 20 },
    formContainer: { padding: SPACING.lg, justifyContent: 'center', flex: 1 },
    title: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: 'bold', color: COLORS.text.primary, textAlign: 'center', marginBottom: SPACING.sm },
    subtitle: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.text.secondary, textAlign: 'center', marginBottom: SPACING.xl },
    errorText: { color: COLORS.status.error, textAlign: 'center', marginBottom: SPACING.md },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background.card, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border.primary, height: 56 },
    icon: { marginRight: SPACING.sm },
    input: { flex: 1, color: COLORS.text.primary, fontSize: TYPOGRAPHY.sizes.md },
    button: { height: 56, borderRadius: BORDER_RADIUS.md, overflow: 'hidden', ...SHADOWS.cyan },
    gradientButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: COLORS.text.inverse, fontWeight: 'bold', fontSize: TYPOGRAPHY.sizes.md, letterSpacing: 1 }
});

export default ForgotPasswordScreen;
