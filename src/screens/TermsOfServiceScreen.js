import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const TermsOfServiceScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={COLORS.gradients.dark}
                    style={styles.card}
                >
                    <Text style={styles.lastUpdated}>Last Updated: December 21, 2025</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                        <Text style={styles.paragraph}>
                            By accessing and using Sports Prophecy ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the App.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Description of Service</Text>
                        <Text style={styles.paragraph}>
                            Sports Prophecy is a skill-based sports prediction platform for entertainment purposes. No gambling, wagering, or cash payouts are offered. Users can make predictions on sporting events, earn virtual tokens and crowns, and compete for rewards sponsored by third parties.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. No Gambling or Real Money Gaming</Text>
                        <Text style={styles.paragraph}>
                            Sports Prophecy is NOT a gambling site, sports betting platform, or real money gaming application.
                        </Text>
                        <Text style={styles.bulletPoint}>• No real money is wagered or exchanged</Text>
                        <Text style={styles.bulletPoint}>• No cash payouts or monetary prizes</Text>
                        <Text style={styles.bulletPoint}>• All prizes are sponsored promotional items with no cash value</Text>
                        <Text style={styles.bulletPoint}>• Participation is FREE with no purchase required</Text>
                        <Text style={styles.bulletPoint}>• This is a skill-based entertainment platform only</Text>
                        <Text style={styles.paragraph}>
                            Users acknowledge that Sports Prophecy operates as a free promotional contest platform, not a gambling service.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>4. Prize Structure</Text>
                        <Text style={styles.paragraph}>
                            Prizes are:
                        </Text>
                        <Text style={styles.bulletPoint}>• Sponsored by third-party partners (e.g., Epic Games, brands)</Text>
                        <Text style={styles.bulletPoint}>• Promotional items with no cash value</Text>
                        <Text style={styles.bulletPoint}>• Awarded through random drawings among eligible participants</Text>
                        <Text style={[styles.bulletPoint, { fontWeight: 'bold', color: COLORS.accent.cyan }]}>
                            • NO PURCHASE NECESSARY TO ENTER OR WIN
                        </Text>
                        <Text style={styles.bulletPoint}>• To enter without earning crowns: Request free entry through in-app "Free Entry" button to receive 1 entry per promotional period.</Text>
                        <Text style={styles.bulletPoint}>• Cannot be exchanged for cash</Text>
                        <Text style={styles.paragraph}>
                            Winners are selected randomly from eligible entries. Participation does not guarantee any prize or reward.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>5. User Accounts</Text>
                        <Text style={styles.paragraph}>
                            To use certain features of the App, you must register for an account. You agree to:
                        </Text>
                        <Text style={styles.bulletPoint}>• Provide accurate and complete information</Text>
                        <Text style={styles.bulletPoint}>• Maintain the security of your password</Text>
                        <Text style={styles.bulletPoint}>• Accept responsibility for all activities under your account</Text>
                        <Text style={styles.bulletPoint}>• Notify us immediately of any unauthorized use</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>6. Eligibility</Text>
                        <Text style={styles.paragraph}>
                            You must be at least 18 years old or the legal age of majority in your jurisdiction to participate in prize draws. By using the App and entering prize draws, you represent and warrant that you meet this age requirement and are legally eligible to receive prizes in your area.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>7. Virtual Currency</Text>
                        <Text style={styles.paragraph}>
                            Tokens and Crowns are virtual currencies used within the App. They have no real-world monetary value and cannot be exchanged for cash. Virtual currency balances may be adjusted, modified, or reset at our discretion for maintenance, fraud prevention, or other operational reasons.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>8. Prizes and Rewards</Text>
                        <Text style={styles.paragraph}>
                            Prizes are provided by third-party sponsors and are subject to availability. We reserve the right to substitute prizes of equal or greater value. Prize winners will be notified through the App and must claim prizes within the specified timeframe. Taxes on prizes are the sole responsibility of winners.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>9. User Conduct</Text>
                        <Text style={styles.paragraph}>
                            To keep Sports Prophecy fun and safe for everyone, we enforce a zero-tolerance policy for:
                        </Text>
                        <Text style={styles.bulletPoint}>• Hate speech, harassment, or bullying of any kind</Text>
                        <Text style={styles.bulletPoint}>• Spamming, scamming, or unauthorized self-promotion</Text>
                        <Text style={styles.bulletPoint}>• Impersonating staff or other users</Text>
                        <Text style={styles.bulletPoint}>• Sharing illegal content or promoting illegal activities</Text>
                        <Text style={styles.paragraph}>
                            Administrators and Moderators have full authority to suspend or ban any user who violates these rules or disrupts the community.
                        </Text>
                        <Text style={styles.paragraph}>
                            Additionally, you agree not to:
                        </Text>
                        <Text style={styles.bulletPoint}>• Use the App for any illegal purpose</Text>
                        <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to the App or other accounts</Text>
                        <Text style={styles.bulletPoint}>• Use bots, scripts, or automated tools</Text>
                        <Text style={styles.bulletPoint}>• Create multiple accounts to gain unfair advantages</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>10. Intellectual Property</Text>
                        <Text style={styles.paragraph}>
                            All content, features, and functionality of the App are owned by Sports Prophecy and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>11. Disclaimer of Warranties</Text>
                        <Text style={styles.paragraph}>
                            THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>12. Limitation of Liability</Text>
                        <Text style={styles.paragraph}>
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPORTS PROPHECY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE APP.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>13. Termination</Text>
                        <Text style={styles.paragraph}>
                            We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any other reason at our sole discretion. Upon termination, your right to use the App will immediately cease.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>14. Changes to Terms</Text>
                        <Text style={styles.paragraph}>
                            We reserve the right to modify these Terms at any time. We will notify users of significant changes through the App or via email. Continued use of the App after changes constitutes acceptance of the modified Terms.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>15. Governing Law</Text>
                        <Text style={styles.paragraph}>
                            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Sports Prophecy operates, without regard to its conflict of law provisions.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>16. Contact Information</Text>
                        <Text style={styles.paragraph}>
                            If you have any questions about these Terms of Service, please contact us at:
                        </Text>
                        <Text style={styles.contactText}>Email: sportsprophecyapp@gmail.com</Text>
                    </View>

                    <View style={styles.acknowledgment}>
                        <Ionicons name="shield-checkmark" size={24} color={COLORS.accent.cyan} />
                        <Text style={styles.acknowledgmentText}>
                            By using Sports Prophecy, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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

export default TermsOfServiceScreen;
