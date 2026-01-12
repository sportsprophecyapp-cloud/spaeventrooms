import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../context/AuthContext';

export default function AppleSignInButton() {
    const { appleLogin } = useAuth();
    const [isAvailable, setIsAvailable] = React.useState(false);

    React.useEffect(() => {
        const checkAvailability = async () => {
            const available = await AppleAuthentication.isAvailableAsync();
            setIsAvailable(available);
        };
        checkAvailability();
    }, []);

    if (!isAvailable) return null;

    const handleAppleSignIn = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            // credential.identityToken
            // credential.user (only on first login)
            // credential.fullName (only on first login)

            // Construct a user object if name is present
            let user = null;
            if (credential.fullName) {
                user = JSON.stringify({
                    name: credential.fullName,
                    email: credential.email
                });
            }

            await appleLogin(credential.identityToken, user);

        } catch (e) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
                // handle that the user canceled the sign-in flow
            } else {
                // handle other errors
                console.error("Apple Sign-In failed", e);
                alert("Apple Sign-In failed. Please try again.");
            }
        }
    }

    return (
        <View style={styles.container}>
            <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                cornerRadius={5}
                style={styles.button}
                onPress={handleAppleSignIn}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 10,
    },
    button: {
        width: '100%',
        height: 48, // Match other buttons approx or usage guidelines
    },
});
