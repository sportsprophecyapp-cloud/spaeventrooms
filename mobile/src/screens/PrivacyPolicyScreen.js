import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const PrivacyPolicyScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={COLORS.gradients.dark}
                    style={styles.card}
                >
                    <Text style={styles.lastUpdated}>Effective Date: 12/15/2025</Text>

                    <Text style={styles.paragraph}>
                        Events Arena (“we”, “our”, “us”) respects your privacy. This Privacy Policy explains what information we collect, how we use it, and how it is protected.
                    </Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                        <Text style={styles.paragraph}>
                            We collect information you provide directly, as well as some data automatically:
                        </Text>
                        <Text style={[styles.paragraph, { fontWeight: 'bold', marginTop: 8 }]}>User-provided information:</Text>
                        <Text style={styles.bulletPoint}>• Name/username</Text>
                        <Text style={styles.bulletPoint}>• Email address</Text>
                        <Text style={styles.bulletPoint}>• Profile information (e.g., Apple/Google ID for authentication)</Text>

                        <Text style={[styles.paragraph, { fontWeight: 'bold', marginTop: 8 }]}>User-generated content:</Text>
                        <Text style={styles.bulletPoint}>• Chat messages</Text>
                        <Text style={styles.bulletPoint}>• Predictions and leaderboard activity</Text>

                        <Text style={[styles.paragraph, { fontWeight: 'bold', marginTop: 8 }]}>Automatically collected information for ads and analytics:</Text>
                        <Text style={styles.bulletPoint}>• Device identifiers</Text>
                        <Text style={styles.bulletPoint}>• App usage and interaction data</Text>

                        <Text style={[styles.paragraph, { fontWeight: 'bold', marginTop: 8 }]}>Third-party services:</Text>
                        <Text style={styles.paragraph}>
                            We use third-party services for authentication, analytics, and advertising (e.g., Google Sign-In, Apple Sign-In, AdMob).
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
                        <Text style={styles.paragraph}>
                            To provide the core functionality of Events Arena: game predictions, leaderboard tracking, and digital rewards (Tokens/Crowns).
                        </Text>
                        <Text style={styles.paragraph}>
                            To display sponsor banners and provide relevant advertising.
                        </Text>
                        <Text style={styles.paragraph}>
                            To maintain the safety and integrity of the community: moderation of chat and user content.
                        </Text>
                        <Text style={styles.paragraph}>
                            To analyze app usage and improve app performance.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. Advertising & Sponsor Banners</Text>
                        <Text style={styles.paragraph}>
                            Events Arena displays sponsored banners within the app.
                        </Text>
                        <Text style={styles.paragraph}>
                            Third-party ad networks may collect non-personally identifiable information, such as device identifiers and usage data, to deliver relevant ads.
                        </Text>
                        <Text style={styles.paragraph}>
                            We do not share personally identifiable information with advertisers.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>4. Data Handling & Security</Text>
                        <Text style={styles.paragraph}>
                            All data transmitted between your device and our servers is encrypted in transit.
                        </Text>
                        <Text style={styles.paragraph}>
                            Data is not shared with third parties except for the purposes stated above (ads, analytics, authentication).
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>5. Data Deletion & Retention</Text>
                        <Text style={styles.paragraph}>
                            You may request deletion of your account and personal data at any time by contacting support@sportsprophecyapp.com or using the in-app account deletion feature.
                        </Text>
                        <Text style={styles.paragraph}>
                            We retain data only as necessary to provide services, comply with legal obligations, or resolve disputes.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>6. Children’s Privacy & Age Restrictions</Text>
                        <Text style={styles.paragraph}>
                            Events Arena is intended for users 13 years and older. Users under 13 are not permitted to use the app.
                        </Text>
                        <Text style={styles.paragraph}>
                            Account creation requires Google Sign-In or Apple Sign-In, and users are prompted to confirm their birth year. Users under 13 are blocked from accessing the app.
                        </Text>
                        <Text style={styles.paragraph}>
                            We do not knowingly collect personal data from children under 13. If we learn that a child under 13 has provided information, we will promptly delete the account and all associated data.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>7. Contact</Text>
                        <Text style={styles.paragraph}>
                            For questions, concerns, or privacy inquiries, contact:
                        </Text>
                        <Text style={styles.contactText}>Email: support@sportsprophecyapp.com</Text>
                    </View>

                    <View style={styles.acknowledgment}>
                        <Ionicons name="lock-closed" size={24} color={COLORS.accent.cyan} />
                        <Text style={styles.acknowledgmentText}>
                            Your privacy is important to us. We are committed to protecting your personal information and being transparent about our data practices.
                        </Text>
                    </View>
                </LinearGradient>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.tertiary,
        backgroundColor: COLORS.background.secondary,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    content: {
        padding: SPACING.base,
    },
    card: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    lastUpdated: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.tertiary,
        fontStyle: 'italic',
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.accent.cyan,
        marginBottom: SPACING.md,
    },
    paragraph: {
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.text.secondary,
        lineHeight: 24,
        marginBottom: SPACING.sm,
    },
    bulletPoint: {
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.text.secondary,
        lineHeight: 24,
        marginLeft: SPACING.md,
        marginBottom: SPACING.xs,
    },
    contactText: {
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.accent.cyan,
        marginTop: SPACING.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    acknowledgment: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.accent.cyan,
        marginTop: SPACING.lg,
        gap: SPACING.md,
    },
    acknowledgmentText: {
        flex: 1,
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.primary,
        lineHeight: 20,
    },
});

export default PrivacyPolicyScreen;
