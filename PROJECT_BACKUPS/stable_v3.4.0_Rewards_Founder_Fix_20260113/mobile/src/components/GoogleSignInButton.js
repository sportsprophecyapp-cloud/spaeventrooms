import * as React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton({ variant = 'standard' }) {
    const { googleLogin } = useAuth();
    const isOutline = variant === 'outline';

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: '690358031158-c8shuqjc5h66ffg811j1re5b7ihgimrh.apps.googleusercontent.com',
        androidClientId: '690358031158-li4ae9s6l59tmhg5gf0sd1a7imk4cjfq.apps.googleusercontent.com',
        webClientId: '690358031158-n4e5sqsu936iega8rh9ge8f0kjikveht.apps.googleusercontent.com',
        redirectUri: makeRedirectUri({
            path: '/',
            preferLocalhost: true,
        }),
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            // Pass both tokens to backend for robust verification
            handleGoogleSignIn({
                idToken: authentication.idToken,
                accessToken: authentication.accessToken
            });
        } else if (response?.type === 'error') {
            console.error("Google Sign-In Error Response:", response.error);
            Alert.alert("Sign In Error", "Could not sign in with Google. Please try again.");
        }
    }, [response]);

    const handleGoogleSignIn = async (tokens) => {
        try {
            await googleLogin(tokens);
        } catch (error) {
            console.error("Google Sign-In failed", error);
            Alert.alert("Sign In Failed", "Unable to authenticate with server.");
        }
    }

    return (
        <TouchableOpacity
            style={[
                styles.googleButton,
                isOutline && styles.googleButtonOutline,
                !request && { opacity: 0.5 }
            ]}
            disabled={!request}
            onPress={() => {
                promptAsync().catch(err => {
                    console.error("Google promptAsync error:", err);
                    Alert.alert("Error", "Failed to launch Google Sign-In.");
                });
            }}
        >
            <Ionicons
                name="logo-google"
                size={20}
                color={isOutline ? COLORS.accent.cyan : "white"}
                style={{ marginRight: 10 }}
            />
            <Text style={[
                styles.googleButtonText,
                isOutline && styles.googleButtonTextOutline
            ]}>
                {isOutline ? "Sign in with Google" : "Continue with Google"}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#DB4437', // Google Red
        paddingVertical: 12,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
    },
    googleButtonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.accent.cyan,
    },
    googleButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    googleButtonTextOutline: {
        color: COLORS.accent.cyan,
        fontSize: 16, // Matching LoginScreen typography if possible, or keep consistent
    },
});
