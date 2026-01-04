import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../services/api';

const ResetPasswordScreen = ({ route, navigation }) => {
    const { email } = route.params;
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleReset = async () => {
        if (!code || !newPassword) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/reset-password', { email, code, newPassword });

            if (Platform.OS === 'web') {
                window.alert('Success: Password updated successfully');
                navigation.navigate('Login');
            } else {
                Alert.alert('Success', 'Password updated successfully', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
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
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>Enter the code sent to {email}</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.inputContainer}>
                        <Ionicons name="key-outline" size={20} color={COLORS.text.tertiary} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Reset Code (6 digits)"
                            placeholderTextColor={COLORS.text.muted}
                            value={code}
                            onChangeText={setCode}
                            keyboardType="number-pad"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.tertiary} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            placeholderTextColor={COLORS.text.muted}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
                        <LinearGradient
                            colors={COLORS.gradients.primary}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>RESET PASSWORD</Text>}
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
    formContainer: { padding: SPACING.lg, justifyContext: 'center', flex: 1, paddingTop: SPACING.xxxl },
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

export default ResetPasswordScreen;
