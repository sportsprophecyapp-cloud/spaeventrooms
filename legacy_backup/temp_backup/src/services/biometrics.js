import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_AUTH_KEY = 'biometric_auth_credentials';

export const BiometricService = {
    // Check if hardware supports biometrics and is enrolled
    checkBiometricSupport: async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            return { hasHardware, isEnrolled };
        } catch (error) {
            console.error('Biometric support check failed:', error);
            return { hasHardware: false, isEnrolled: false };
        }
    },

    // Authenticate user with biometrics
    authenticate: async (promptMessage = 'Confirm your identity') => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage,
                fallbackLabel: 'Use Passcode',
                disableDeviceFallback: false,
            });
            return result.success;
        } catch (error) {
            console.error('Biometric authentication failed:', error);
            return false;
        }
    },

    // Save credentials securely (email & password)
    saveCredentials: async (email, password) => {
        try {
            const credentials = JSON.stringify({ email, password });
            await SecureStore.setItemAsync(BIOMETRIC_AUTH_KEY, credentials);
            return true;
        } catch (error) {
            console.error('Failed to save biometric credentials:', error);
            return false;
        }
    },

    // Retrieve credentials (if biometrics enabled)
    getCredentials: async () => {
        try {
            const credentials = await SecureStore.getItemAsync(BIOMETRIC_AUTH_KEY);
            return credentials ? JSON.parse(credentials) : null;
        } catch (error) {
            console.error('Failed to retrieve biometric credentials:', error);
            return null;
        }
    },

    // Clear credentials (disable biometrics)
    clearCredentials: async () => {
        try {
            await SecureStore.deleteItemAsync(BIOMETRIC_AUTH_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear biometric credentials:', error);
            return false;
        }
    }
};
