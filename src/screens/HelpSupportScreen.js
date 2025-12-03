import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const HelpSupportScreen = () => {
    const navigation = useNavigation();
    const [expandedFaq, setExpandedFaq] = useState(null);

    const faqs = [
        {
            id: 1,
            question: "Is Sports Prophecy really free?",
            answer: "Yes! Sports Prophecy is 100% free to play. No deposits, no gambling, no risk. You compete for prizes from our sponsors, not cash."
        },
        {
            id: 2,
            question: "How do I earn tokens and crowns?",
            answer: "New users start with 50 tokens and 5 crowns. Earn 3 tokens daily by logging in. Win predictions to earn 3 tokens and 1 crown. Get exact scores for bonus crowns. Login 7 days in a row for a crown bonus!"
        },
        {
            id: 3,
            question: "What do tokens and crowns do?",
            answer: "Tokens are used to make predictions (1 token per prediction). Crowns are used to enter weekly prize draws (1 crown per entry). The more crowns you have, the more entries you can make!"
        },
        {
            id: 4,
            question: "Can I predict on the same game twice?",
            answer: "No, you can only make one prediction per game. Once you submit a prediction, the button will show 'PREDICTED' and be disabled. Choose wisely!"
        },
        {
            id: 5,
            question: "What happens if my predicted scores don't match my selected winner?",
            answer: "The app validates your predictions! If you select Team A to win but enter scores where Team B wins, you'll get an error message. This prevents accidental contradictions."
        },
        {
            id: 6,
            question: "How do I enter the weekly prize draw?",
            answer: "Navigate to the Weekly Draw screen from the More menu. Click 'Enter Draw' and then 'Confirm Entry' (two clicks prevent accidents). Each entry costs 1 crown."
        },
        {
            id: 7,
            question: "What prizes can I win?",
            answer: "You can win prizes from our sponsors! Check the Weekly Draw screen for current prize details. Remember, this is not gambling - all prizes are sponsor-provided, not cash."
        },
        {
            id: 8,
            question: "When are predictions resolved?",
            answer: "Predictions are resolved after the game ends. You'll receive notifications on your profile page when your predictions win. Check the Profile screen (bell icon) to see your winning notifications!"
        },
        {
            id: 9,
            question: "How does the leaderboard work?",
            answer: "The leaderboard ranks players based on their total crowns earned. The more accurate your predictions, the higher you'll rank. Compete with other players to reach the top!"
        },
        {
            id: 10,
            question: "Can I change my prediction after submitting?",
            answer: "No, predictions are final once submitted. Make sure you're confident in your choice before clicking submit!"
        },
        {
            id: 11,
            question: "What sports are available?",
            answer: "We cover NFL, NBA, NHL, MLB, EPL (English Premier League), and MLS. More sports may be added in the future!"
        },
        {
            id: 12,
            question: "How do I claim my daily login reward?",
            answer: "Daily rewards are automatically checked when you log in. If you're eligible, you'll see a popup with your reward. You can claim once every 24 hours."
        }
    ];

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const handleEmailPress = () => {
        Linking.openURL('mailto:Contact@sportsprophecyapp.com');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Contact Card */}
                <LinearGradient
                    colors={COLORS.gradients.primary}
                    style={styles.contactCard}
                >
                    <Ionicons name="mail" size={48} color={COLORS.text.inverse} />
                    <Text style={styles.contactTitle}>Need Help?</Text>
                    <Text style={styles.contactSubtitle}>We're here to assist you</Text>
                    <TouchableOpacity
                        style={styles.emailButton}
                        onPress={handleEmailPress}
                        accessibilityLabel="Contact Support Email"
                    >
                        <Ionicons name="mail-outline" size={20} color={COLORS.accent.cyan} />
                        <Text style={styles.emailText}>Contact@sportsprophecyapp.com</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* FAQ Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="help-circle" size={24} color={COLORS.accent.cyan} />
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    </View>

                    {faqs.map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            style={styles.faqCard}
                            onPress={() => toggleFaq(faq.id)}
                            accessibilityLabel={`FAQ: ${faq.question}`}
                        >
                            <View style={styles.faqHeader}>
                                <View style={styles.faqQuestion}>
                                    <Ionicons
                                        name="help-circle-outline"
                                        size={20}
                                        color={COLORS.accent.cyan}
                                        style={styles.faqIcon}
                                    />
                                    <Text style={styles.questionText}>{faq.question}</Text>
                                </View>
                                <Ionicons
                                    name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={COLORS.text.secondary}
                                />
                            </View>
                            {expandedFaq === faq.id && (
                                <View style={styles.faqAnswer}>
                                    <Text style={styles.answerText}>{faq.answer}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Links */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Links</Text>

                    <TouchableOpacity
                        style={styles.linkCard}
                        onPress={() => navigation.navigate('HowToPlay')}
                    >
                        <Ionicons name="book-outline" size={24} color={COLORS.accent.cyan} />
                        <Text style={styles.linkText}>How to Play</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkCard}
                        onPress={() => navigation.navigate('WeeklyDraw')}
                    >
                        <Ionicons name="gift-outline" size={24} color={COLORS.accent.purple} />
                        <Text style={styles.linkText}>Prize Draws</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkCard}
                        onPress={() => navigation.navigate('Leaderboard')}
                    >
                        <Ionicons name="trophy-outline" size={24} color={COLORS.accent.lime} />
                        <Text style={styles.linkText}>Leaderboard</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appName}>Sports Prophecy</Text>
                    <Text style={styles.versionText}>Version 2.3.1</Text>
                    <Text style={styles.appTagline}>100% Free Sports Predictions</Text>
                </View>
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
        paddingBottom: SPACING.xxxl,
    },
    contactCard: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.xl,
        ...SHADOWS.cyan,
    },
    contactTitle: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.inverse,
        marginTop: SPACING.md,
    },
    contactSubtitle: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.inverse,
        opacity: 0.9,
        marginBottom: SPACING.lg,
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        gap: SPACING.sm,
    },
    emailText: {
        color: COLORS.accent.cyan,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    faqCard: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    faqIcon: {
        marginRight: SPACING.xs,
    },
    questionText: {
        flex: 1,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.text.primary,
    },
    faqAnswer: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.tertiary,
    },
    answerText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        lineHeight: 20,
    },
    linkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
        gap: SPACING.md,
    },
    linkText: {
        flex: 1,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.text.primary,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.tertiary,
        marginTop: SPACING.lg,
    },
    appName: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    appVersion: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
    },
    appTagline: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.tertiary,
        fontStyle: 'italic',
    },
});

export default HelpSupportScreen;
