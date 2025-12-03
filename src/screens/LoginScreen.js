import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = async () => {
        setError('');
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                // Navigation is handled by App.js based on user state
            } else {
                setError('Invalid credentials');
            }
        } catch (error) {
            setError(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        if (error) setError('');
    };

    const handlePasswordChange = (text) => {
        setPassword(text);
        if (error) setError('');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background.primary, COLORS.background.secondary]}
                style={styles.background}
            />
            <SafeAreaView style={styles.content}>
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    accessibilityLabel="Back Button"
                    testID="login-back-button"
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>

                <View style={styles.formContainer}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue predicting</Text>

                    <View style={styles.form}>
                        {/* Error Message */}
                        {error ? (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color={COLORS.status.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <View style={[styles.inputWrapper, error && styles.inputError]}>
                                <Ionicons name="mail-outline" size={20} color={COLORS.text.tertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor={COLORS.text.muted}
                                    value={email}
                                    onChangeText={handleEmailChange}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    accessibilityLabel="Email Input"
                                    testID="login-email-input"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={[styles.inputWrapper, error && styles.inputError]}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.tertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Enter your password"
                                    placeholderTextColor={COLORS.text.muted}
                                    value={password}
                                    onChangeText={handlePasswordChange}
                                    secureTextEntry={!showPassword}
                                    accessibilityLabel="Password Input"
                                    testID="login-password-input"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} accessibilityLabel="Toggle Password Visibility" testID="login-toggle-password">
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={COLORS.text.tertiary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Remember Me & Forgot Password */}
                        <View style={styles.optionsRow}>
                            <TouchableOpacity
                                style={styles.rememberMeContainer}
                                onPress={() => setRememberMe(!rememberMe)}
                                accessibilityLabel="Remember Me Checkbox"
                                testID="login-remember-me"
                            >
                                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                    {rememberMe && (
                                        <Ionicons name="checkmark" size={16} color={COLORS.text.inverse} />
                                    )}
                                </View>
                                <Text style={styles.rememberMeText}>Remember me</Text>
                            </TouchableOpacity>

                            <TouchableOpacity accessibilityLabel="Forgot Password Button" testID="login-forgot-password">
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} accessibilityLabel="Sign In Button" testID="login-submit-button">
                            <LinearGradient
                                colors={COLORS.gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.text.inverse} />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>SIGN IN</Text>
                                        <Ionicons name="arrow-forward" size={20} color={COLORS.text.inverse} />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Sign Up Link */}
                        <TouchableOpacity onPress={() => navigation.navigate('Register')} accessibilityLabel="Sign Up Link" testID="login-signup-link">
                            <Text style={styles.linkText}>
                                Don't have an account? <Text style={styles.linkAccent}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    content: {
        flex: 1,
    },
    backButton: {
        marginLeft: SPACING.lg,
        marginTop: SPACING.md,
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.background.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.xxxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizes.md,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xxxl,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: SPACING.lg,
    },
    label: {
        color: COLORS.text.secondary,
        marginBottom: SPACING.sm,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.base,
    },
    inputIcon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        paddingVertical: SPACING.base,
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.base,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.border.secondary,
        marginRight: SPACING.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.accent.cyan,
        borderColor: COLORS.accent.cyan,
    },
    rememberMeText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    forgotPasswordText: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    button: {
        height: 56,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        ...SHADOWS.cyan,
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    buttonText: {
        color: COLORS.text.inverse,
        fontWeight: TYPOGRAPHY.weights.black,
        fontSize: TYPOGRAPHY.sizes.md,
        letterSpacing: 1,
    },
    linkText: {
        color: COLORS.text.secondary,
        textAlign: 'center',
        fontSize: TYPOGRAPHY.sizes.base,
    },
    linkAccent: {
        color: COLORS.accent.cyan,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.status.error,
    },
    errorText: {
        color: COLORS.status.error,
        marginLeft: SPACING.sm,
        fontSize: TYPOGRAPHY.sizes.sm,
        flex: 1,
    },
    inputError: {
        borderColor: COLORS.status.error,
    },
});

export default LoginScreen;
