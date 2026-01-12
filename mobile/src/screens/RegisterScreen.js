import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import GoogleSignInButton from '../components/GoogleSignInButton';
import AppleSignInButton from '../components/AppleSignInButton';
import { BiometricService } from '../services/biometrics';

const RegisterScreen = ({ navigation, isEmbedded = false, onToggleMode }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [ageVerified, setAgeVerified] = useState(false);
    const [tosAccepted, setTosAccepted] = useState(false);
    const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, user } = useAuth();

    const handleRegister = async () => {
        setError('');
        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Validate age verification
        if (!ageVerified) {
            setError('You must confirm that you are at least 18 years old');
            return;
        }

        // Validate TOS and Privacy Policy
        if (!tosAccepted) {
            setError('You must accept the Terms of Service');
            return;
        }

        if (!privacyPolicyAccepted) {
            setError('You must accept the Privacy Policy');
            return;
        }

        setLoading(true);
        try {
            const success = await register(email, password, username, referralCode, ageVerified, tosAccepted, privacyPolicyAccepted, rememberMe);
            if (success) {
                // Force navigation to Main with a slight delay
                // Check for biometric support
                const { hasHardware, isEnrolled } = await BiometricService.checkBiometricSupport();
                if (hasHardware && isEnrolled && !isEmbedded) {
                    Alert.alert(
                        'Enable Biometrics?',
                        'Would you like to enable FaceID/TouchID for faster login next time?',
                        [
                            {
                                text: 'No Thanks',
                                onPress: () => navigation.navigate('Main'),
                                style: 'cancel'
                            },
                            {
                                text: 'Yes, Enable',
                                onPress: async () => {
                                    await BiometricService.saveCredentials(email, password);
                                    Alert.alert('Success', 'Biometric login enabled!');
                                    navigation.navigate('Main');
                                }
                            }
                        ]
                    );
                } else {
                    setTimeout(() => {
                        navigation.navigate('Main');
                    }, 100);
                }
            } else {
                setError('Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.error || error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        if (error) setError('');
    };

    const renderForm = () => (
        <View style={[styles.formContainer, isEmbedded && styles.embeddedFormContainer]}>
            {!isEmbedded && (
                <>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join thousands of sports fans</Text>
                </>
            )}

            <View style={styles.form}>
                {/* Error Message */}
                {error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color={COLORS.status.error} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* Username Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <View style={[styles.inputWrapper, error && styles.inputError]}>
                        <Ionicons name="person-outline" size={20} color={COLORS.text.tertiary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Choose a username"
                            placeholderTextColor={COLORS.text.muted}
                            value={username}
                            onChangeText={(text) => { setUsername(text); clearError(); }}
                            autoCapitalize="none"
                            accessibilityLabel="Username Input"
                            testID="register-username-input"
                            nativeID="username"
                            autoComplete="username"
                            textContentType="username"
                        />
                    </View>
                </View>

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
                            onChangeText={(text) => { setEmail(text); clearError(); }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            accessibilityLabel="Email Input"
                            testID="register-email-input"
                            nativeID="email"
                            autoComplete="email"
                            textContentType="emailAddress"
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
                            placeholder="Create a password"
                            placeholderTextColor={COLORS.text.muted}
                            value={password}
                            onChangeText={(text) => { setPassword(text); clearError(); }}
                            secureTextEntry={!showPassword}
                            accessibilityLabel="Password Input"
                            testID="register-password-input"
                            nativeID="new-password"
                            autoComplete="new-password"
                            textContentType="newPassword"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} accessibilityLabel="Toggle Password Visibility" testID="register-toggle-password">
                            <Ionicons
                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color={COLORS.text.tertiary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={[styles.inputWrapper, error && styles.inputError]}>
                        <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.tertiary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Confirm your password"
                            placeholderTextColor={COLORS.text.muted}
                            value={confirmPassword}
                            onChangeText={(text) => { setConfirmPassword(text); clearError(); }}
                            secureTextEntry={!showConfirmPassword}
                            accessibilityLabel="Confirm Password Input"
                            testID="register-confirm-password-input"
                            nativeID="confirm-password"
                            autoComplete="new-password"
                            textContentType="newPassword"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} accessibilityLabel="Toggle Confirm Password Visibility" testID="register-toggle-confirm-password">
                            <Ionicons
                                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color={COLORS.text.tertiary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Referral Code (Optional) */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Referral Code (Optional)</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="gift-outline" size={20} color={COLORS.text.tertiary} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter friend's referral code"
                            placeholderTextColor={COLORS.text.muted}
                            value={referralCode}
                            onChangeText={(text) => setReferralCode(text.toUpperCase())}
                            autoCapitalize="characters"
                            maxLength={10}
                            accessibilityLabel="Referral Code Input"
                            testID="register-referral-code-input"
                            nativeID="referral-code"
                            autoComplete="off"
                        />
                    </View>
                </View>

                {/* Age Verification Checkbox */}
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAgeVerified(!ageVerified)}
                    accessibilityLabel="Age Verification Checkbox"
                    testID="register-age-checkbox"
                >
                    <View style={[styles.checkbox, ageVerified && styles.checkboxChecked]}>
                        {ageVerified && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.checkboxText}>
                        I confirm that I am <Text style={{ color: COLORS.accent.cyan, fontWeight: 'bold' }}>18 years of age or older</Text>.
                    </Text>
                </TouchableOpacity>

                {/* Terms of Service Checkbox */}
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setTosAccepted(!tosAccepted)}
                    accessibilityLabel="Terms of Service Checkbox"
                    testID="register-tos-checkbox"
                >
                    <View style={[styles.checkbox, tosAccepted && styles.checkboxChecked]}>
                        {tosAccepted && (
                            <Ionicons name="checkmark" size={16} color={COLORS.text.inverse} />
                        )}
                    </View>
                    <Text style={styles.checkboxText}>
                        I accept the{' '}
                        <Text
                            style={styles.termsLink}
                            onPress={(e) => {
                                e.stopPropagation();
                                navigation.navigate('TermsOfService');
                            }}
                        >
                            Terms of Service
                        </Text>
                    </Text>
                </TouchableOpacity>

                {/* Privacy Policy Checkbox */}
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setPrivacyPolicyAccepted(!privacyPolicyAccepted)}
                    accessibilityLabel="Privacy Policy Checkbox"
                    testID="register-privacy-checkbox"
                >
                    <View style={[styles.checkbox, privacyPolicyAccepted && styles.checkboxChecked]}>
                        {privacyPolicyAccepted && (
                            <Ionicons name="checkmark" size={16} color={COLORS.text.inverse} />
                        )}
                    </View>
                    <Text style={styles.checkboxText}>
                        I accept the{' '}
                        <Text
                            style={styles.termsLink}
                            onPress={(e) => {
                                e.stopPropagation();
                                navigation.navigate('PrivacyPolicy');
                            }}
                        >
                            Privacy Policy
                        </Text>
                    </Text>
                </TouchableOpacity>



                {/* Register Button */}
                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} accessibilityLabel="Create Account Button" testID="register-submit-button">
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
                                <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
                                <Ionicons name="arrow-forward" size={20} color={COLORS.text.inverse} />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>



                <GoogleSignInButton />
                <AppleSignInButton />

                {/* Login Link */}
                <TouchableOpacity
                    onPress={() => isEmbedded ? onToggleMode('login') : navigation.navigate('Login')}
                    accessibilityLabel="Sign In Link"
                    testID="register-login-link"
                >
                    <Text style={styles.linkText}>
                        Already have an account? <Text style={styles.linkAccent}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isEmbedded) {
        return renderForm();
    }

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
                    testID="register-back-button"
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {renderForm()}
                </ScrollView>
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
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    formContainer: {
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
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: SPACING.base,
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
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    checkboxText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.sm,
        flex: 1,
    },
    helperText: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.xs,
        marginTop: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    button: {
        height: 56,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        marginBottom: SPACING.base,
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
    termsText: {
        color: COLORS.text.tertiary,
        textAlign: 'center',
        fontSize: TYPOGRAPHY.sizes.xs,
        marginBottom: SPACING.lg,
        lineHeight: 18,
    },
    termsLink: {
        color: COLORS.accent.cyan,
        fontWeight: TYPOGRAPHY.weights.semibold,
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
    embeddedFormContainer: {
        padding: 0,
        backgroundColor: 'transparent',
        flex: 0,
        justifyContent: 'flex-start',
    },
});

export default RegisterScreen;
