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
                    <Text style={styles.lastUpdated}>Last Updated: December 6, 2025</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Introduction</Text>
                        <Text style={styles.paragraph}>
                            Sports Prophecy ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                        <Text style={styles.paragraph}>
                            We collect information that you provide directly to us:
                        </Text>
                        <Text style={styles.bulletPoint}>• Account information (username, email address, password)</Text>
                        <Text style={styles.bulletPoint}>• Profile information and preferences</Text>
                        <Text style={styles.bulletPoint}>• Predictions and game activity</Text>
                        <Text style={styles.bulletPoint}>• Communications with us</Text>
                        <Text style={styles.bulletPoint}>• Referral codes and social connections</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. Automatically Collected Information</Text>
                        <Text style={styles.paragraph}>
                            When you use the App, we automatically collect:
                        </Text>
                        <Text style={styles.bulletPoint}>• Device information (type, operating system, unique identifiers)</Text>
                        <Text style={styles.bulletPoint}>• Usage data (features used, time spent, interactions)</Text>
                        <Text style={styles.bulletPoint}>• Log data (IP address, browser type, access times)</Text>
                        <Text style={styles.bulletPoint}>• Analytics and performance data</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>4. How We Use Your Information</Text>
                        <Text style={styles.paragraph}>
                            We use the collected information to:
                        </Text>
                        <Text style={styles.bulletPoint}>• Provide and maintain the App</Text>
                        <Text style={styles.bulletPoint}>• Process your predictions and award prizes</Text>
                        <Text style={styles.bulletPoint}>• Send you notifications about your account and activities</Text>
                        <Text style={styles.bulletPoint}>• Improve and personalize your experience</Text>
                        <Text style={styles.bulletPoint}>• Detect and prevent fraud or abuse</Text>
                        <Text style={styles.bulletPoint}>• Communicate with you about updates and promotions</Text>
                        <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>5. Information Sharing</Text>
                        <Text style={styles.paragraph}>
                            We may share your information with:
                        </Text>
                        <Text style={styles.bulletPoint}>• Service providers who assist in operating the App</Text>
                        <Text style={styles.bulletPoint}>• Sponsors for prize fulfillment (name and contact info only)</Text>
                        <Text style={styles.bulletPoint}>• Law enforcement when required by law</Text>
                        <Text style={styles.bulletPoint}>• Other users (only public profile information like username and stats)</Text>
                        <Text style={styles.paragraph}>
                            We do not sell your personal information to third parties.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>6. Data Security</Text>
                        <Text style={styles.paragraph}>
                            We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>7. Data Retention</Text>
                        <Text style={styles.paragraph}>
                            We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account at any time, though we may retain certain information as required by law or for legitimate business purposes.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>8. Your Rights</Text>
                        <Text style={styles.paragraph}>
                            You have the right to:
                        </Text>
                        <Text style={styles.bulletPoint}>• Access your personal information</Text>
                        <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
                        <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
                        <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>
                        <Text style={styles.bulletPoint}>• Export your data</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>9. Age Requirements</Text>
                        <Text style={styles.paragraph}>
                            Participation in prize draws requires users to be at least 18 years old or the legal age of majority in their jurisdiction. We do not knowingly allow minors to participate in prize draws. Users must verify their age eligibility before entering any prize draws.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>10. Cookies and Tracking</Text>
                        <Text style={styles.paragraph}>
                            We use cookies and similar tracking technologies to track activity on our App and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>11. Third-Party Links</Text>
                        <Text style={styles.paragraph}>
                            Our App may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>12. Changes to This Policy</Text>
                        <Text style={styles.paragraph}>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>13. Contact Us</Text>
                        <Text style={styles.paragraph}>
                            If you have questions about this Privacy Policy, please contact us at:
                        </Text>
                        <Text style={styles.contactText}>Email: sportsprophecyapp@gmail.com</Text>
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
