import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={styles.title}>Oops! Something went wrong.</Text>
                        <Text style={styles.subtitle}>
                            The application encountered an error and could not continue.
                        </Text>

                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>
                                {this.state.error && this.state.error.toString()}
                            </Text>
                        </View>

                        {this.state.errorInfo && (
                            <View style={styles.stackBox}>
                                <Text style={styles.stackText}>
                                    {this.state.errorInfo.componentStack}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.status.error,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizes.md,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    errorBox: {
        backgroundColor: COLORS.background.card,
        padding: SPACING.md,
        borderRadius: 8,
        width: '100%',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.status.error,
    },
    errorText: {
        color: COLORS.status.error,
        fontFamily: 'monospace',
    },
    stackBox: {
        backgroundColor: COLORS.background.tertiary,
        padding: SPACING.md,
        borderRadius: 8,
        width: '100%',
        marginBottom: SPACING.xl,
        maxHeight: 200,
    },
    stackText: {
        color: COLORS.text.tertiary,
        fontSize: 10,
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: COLORS.accent.cyan,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: 8,
    },
    buttonText: {
        color: COLORS.text.inverse,
        fontWeight: TYPOGRAPHY.weights.bold,
        fontSize: TYPOGRAPHY.sizes.md,
    },
});

export default ErrorBoundary;
