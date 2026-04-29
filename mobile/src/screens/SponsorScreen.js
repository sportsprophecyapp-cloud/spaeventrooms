import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as WebBrowser from 'expo-web-browser';
import { apiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const SponsorScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('paid'); // 'paid' or 'prize'

    // Paid State
    const [sponsorName, setSponsorName] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [placement, setPlacement] = useState('main'); // NEW: 'main', 'prizeDraws', or 'both'
    const [selectedDuration, setSelectedDuration] = useState('week'); // 'week' or 'month'
    const [bannerImage, setBannerImage] = useState(null);
    const [amount, setAmount] = useState('25');

    // Prize State
    const [prizeDescription, setPrizeDescription] = useState('');
    const [contactEmail, setContactEmail] = useState('');

    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 5],
            quality: 1,
        });

        if (!result.canceled) {
            const manipResult = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 800 } }], // 800x250 approx
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );
            setBannerImage(`data:image/jpeg;base64,${manipResult.base64}`);
        }
    };

    const handlePaidSubmit = async () => {
        if (!sponsorName || !linkUrl || !bannerImage) {
            const msg = 'Missing Information: Please fill in all fields and upload a banner image.';
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert('Missing Information', msg);
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount < 0.50) {
            const msg = 'Invalid Amount: Minimum sponsorship amount is $0.50.';
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert('Invalid Amount', msg);
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.createSponsorCheckout({
                sponsorName,
                bannerUrl: bannerImage,
                linkUrl,
                placement, // Include placement in API call
                duration: '30days',
                amount: parseFloat(amount) || 25
            });

            if (response.checkoutUrl) {
                if (Platform.OS === 'web') {
                    window.location.href = response.checkoutUrl;
                } else {
                    await WebBrowser.openBrowserAsync(response.checkoutUrl);
                    navigation.goBack();
                    Alert.alert('Success', 'Redirecting to payment... Your ad will be live once payment is confirmed!');
                }
            } else {
                throw new Error('No checkout URL received from server');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || JSON.stringify(error);
            if (Platform.OS === 'web') {
                window.alert(`Payment Failed: Could not initiate payment: ${errorMessage}`);
            } else {
                Alert.alert('Payment Failed', `Could not initiate payment: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePrizeSubmit = async () => {
        if (!sponsorName || !linkUrl || !bannerImage || !prizeDescription || !contactEmail) {
            if (Platform.OS === 'web') {
                window.alert('Missing Information: Please fill in all fields.');
            } else {
                Alert.alert('Missing Information', 'Please fill in all fields.');
            }
            return;
        }

        setLoading(true);
        try {
            await apiService.submitPrizeApplication({
                sponsorName,
                bannerUrl: bannerImage,
                linkUrl,
                prizeDescription,
                contactEmail
            });

            if (Platform.OS === 'web') {
                window.alert('Application Submitted: Your prize draw application has been submitted for review!');
                navigation.goBack();
            } else {
                Alert.alert(
                    'Application Submitted',
                    'Your prize draw application has been submitted for review!',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Application Error:', error);
            const errorMessage = error.response?.data?.message || error.message || JSON.stringify(error);
            Alert.alert('Submission Failed', `Failed to submit application: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const renderPaidTab = () => (
        <View>
            <Text style={styles.subtitle}>Reach thousands of users across the entire app!</Text>

            {/* Placement Selector */}
            <View style={styles.placementContainer}>
                <Text style={styles.label}>Choose Ad Placement</Text>

                <TouchableOpacity
                    style={[styles.placementCard, placement === 'main' && styles.selectedPlacement]}
                    onPress={() => setPlacement('main')}
                >
                    <View style={styles.placementHeader}>
                        <Ionicons name="home" size={24} color={placement === 'main' ? COLORS.accent.cyan : COLORS.text.secondary} />
                        <Text style={[styles.placementTitle, placement === 'main' && styles.selectedPlacementText]}>Main Pages</Text>
                    </View>
                    <Text style={styles.placementSubtext}>Home & Announcements Screen</Text>
                    {placement === 'main' && <Ionicons name="checkmark-circle" size={24} color={COLORS.accent.cyan} style={styles.placementCheck} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.placementCard, placement === 'prizeDraws' && styles.selectedPlacement]}
                    onPress={() => setPlacement('prizeDraws')}
                >
                    <View style={styles.placementHeader}>
                        <Ionicons name="gift" size={24} color={placement === 'prizeDraws' ? COLORS.accent.cyan : COLORS.text.secondary} />
                        <Text style={[styles.placementTitle, placement === 'prizeDraws' && styles.selectedPlacementText]}>Prize Draws Page</Text>
                    </View>
                    <Text style={styles.placementSubtext}>High engagement, prize-focused users</Text>
                    {placement === 'prizeDraws' && <Ionicons name="checkmark-circle" size={24} color={COLORS.accent.cyan} style={styles.placementCheck} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.placementCard, placement === 'both' && styles.selectedPlacement]}
                    onPress={() => setPlacement('both')}
                >
                    <View style={styles.placementHeader}>
                        <Ionicons name="star" size={24} color={placement === 'both' ? COLORS.accent.gold : COLORS.text.secondary} />
                        <Text style={[styles.placementTitle, placement === 'both' && styles.selectedPlacementText]}>All Pages (Premium)</Text>
                    </View>
                    <Text style={styles.placementSubtext}>Maximum reach (+$10)</Text>
                    {placement === 'both' && <Ionicons name="checkmark-circle" size={24} color={COLORS.accent.cyan} style={styles.placementCheck} />}
                </TouchableOpacity>
            </View>

            {/* Benefits Section */}
            <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Your Ad Will Appear On:</Text>

                <View style={styles.benefitItem}>
                    <Ionicons name="home" size={20} color={COLORS.accent.cyan} />
                    <View style={styles.benefitTextContainer}>
                        <Text style={styles.benefitText}>Home Screen</Text>
                        <Text style={styles.benefitSubtext}>Static banner at top</Text>
                    </View>
                </View>

                <View style={styles.benefitItem}>
                    <Ionicons name="megaphone" size={20} color={COLORS.accent.cyan} />
                    <View style={styles.benefitTextContainer}>
                        <Text style={styles.benefitText}>Announcements Page</Text>
                        <Text style={styles.benefitSubtext}>Static banner at top</Text>
                    </View>
                </View>

                <View style={styles.benefitItem}>
                    <Ionicons name="trending-up" size={20} color={COLORS.accent.cyan} />
                    <View style={styles.benefitTextContainer}>
                        <Text style={styles.benefitText}>Growing Audience</Text>
                        <Text style={styles.benefitSubtext}>New placements added regularly</Text>
                    </View>
                </View>

                <View style={styles.benefitHighlight}>
                    <Ionicons name="trending-up" size={16} color={COLORS.status.success} />
                    <Text style={styles.benefitHighlightText}>Maximum visibility across the platform!</Text>
                </View>
            </View>

            <View style={styles.pricingContainer}>
                <TouchableOpacity
                    style={[styles.pricingCard, styles.selectedCard, { flex: 1 }]}
                    activeOpacity={1}
                >
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>BEST VALUE</Text>
                    </View>
                    <Text style={styles.priceTitle}>30-Day Banner Ad</Text>
                    <Text style={styles.priceAmount}>${amount || '25'}</Text>
                    <Text style={styles.priceSub}>for 30 days</Text>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.accent.cyan} style={styles.checkIcon} />
                </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Sponsor Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Quantum Sports Gear"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={sponsorName}
                    onChangeText={setSponsorName}
                />

                <Text style={styles.label}>Website Link</Text>
                <TextInput
                    style={styles.input}
                    placeholder="https://yourwebsite.com"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={linkUrl}
                    onChangeText={setLinkUrl}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Sponsorship Amount ($)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0.50"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                />
                <Text style={styles.helperText}>Minimum amount is $0.50 (Stripe requirement)</Text>

                <Text style={styles.label}>Banner Image (3.2:1 Ratio)</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    {bannerImage ? (
                        <Image source={{ uri: bannerImage }} style={styles.previewImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <Ionicons name="cloud-upload-outline" size={32} color={COLORS.accent.cyan} />
                            <Text style={styles.uploadText}>Tap to Upload Banner</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.payButton, loading && styles.disabledButton]}
                onPress={handlePaidSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.payButtonText}>
                        Pay ${amount || '25'} for 30 Days
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );

    const renderPrizeTab = () => (
        <View>
            <View style={styles.marketingContainer}>
                <Ionicons name="gift-outline" size={48} color={COLORS.accent.gold} style={{ alignSelf: 'center', marginBottom: SPACING.md }} />
                <Text style={styles.marketingTitle}>Partner with Events Arena</Text>
                <Text style={styles.marketingText}>
                    Connect your brand with thousands of engaged sports fans through our Weekly Prize Draws.
                </Text>

                <View style={styles.marketingGrid}>
                    <View style={styles.marketingItem}>
                        <Ionicons name="people" size={24} color={COLORS.accent.cyan} />
                        <Text style={styles.marketingItemTitle}>Massive Reach</Text>
                        <Text style={styles.marketingItemText}>Your brand front & center during peak activity.</Text>
                    </View>
                    <View style={styles.marketingItem}>
                        <Ionicons name="heart" size={24} color={COLORS.status.error} />
                        <Text style={styles.marketingItemTitle}>Brand Love</Text>
                        <Text style={styles.marketingItemText}>Build goodwill by gifting prizes users love.</Text>
                    </View>
                </View>

                <View style={styles.highlightBox}>
                    <Text style={styles.highlightText}>
                        💡 The higher the prize value, the longer your campaign runs (up to 1 month)!
                    </Text>
                </View>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Sponsor Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Quantum Sports Gear"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={sponsorName}
                    onChangeText={setSponsorName}
                />

                <Text style={styles.label}>Website Link</Text>
                <TextInput
                    style={styles.input}
                    placeholder="https://yourwebsite.com"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={linkUrl}
                    onChangeText={setLinkUrl}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Prize Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Authentic Jersey, Game Tickets, Tech Gadget"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={prizeDescription}
                    onChangeText={setPrizeDescription}
                />

                <Text style={styles.label}>Contact Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="contact@yourbrand.com"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={contactEmail}
                    onChangeText={setContactEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Banner Image (3.2:1 Ratio)</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    {bannerImage ? (
                        <Image source={{ uri: bannerImage }} style={styles.previewImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <Ionicons name="cloud-upload-outline" size={32} color={COLORS.accent.cyan} />
                            <Text style={styles.uploadText}>Tap to Upload Banner</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.payButton, loading && styles.disabledButton]}
                onPress={handlePrizeSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.payButtonText}>Submit Application</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Advertise with Us</Text>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'paid' && styles.activeTab]}
                    onPress={() => setActiveTab('paid')}
                >
                    <Text style={[styles.tabText, activeTab === 'paid' && styles.activeTabText]}>Main Page Ad</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'prize' && styles.activeTab]}
                    onPress={() => setActiveTab('prize')}
                >
                    <Text style={[styles.tabText, activeTab === 'prize' && styles.activeTabText]}>Prize Draw Ad</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'paid' ? renderPaidTab() : renderPrizeTab()}

                <Text style={styles.disclaimer}>
                    Payments processed by Stripe. Prize applications reviewed by admin.
                    {'\n\n'}
                    Promotions are sponsored by third parties. Sponsors are solely responsible for fulfillment.
                    Google Play and Apple are not sponsors of, nor affiliated with, these promotions.
                </Text>
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
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.primary,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.secondary,
        paddingHorizontal: SPACING.lg,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.accent.cyan,
    },
    tabText: {
        color: COLORS.text.secondary,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    activeTabText: {
        color: COLORS.accent.cyan,
    },
    content: {
        padding: SPACING.lg,
    },
    subtitle: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.lg,
        textAlign: 'center',
        marginBottom: SPACING.lg,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    infoText: {
        color: COLORS.text.tertiary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    pricingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    pricingCard: {
        flex: 0.48,
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: COLORS.accent.cyan,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
    },
    priceTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: 4,
    },
    priceAmount: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: 4,
    },
    priceSub: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.xs,
    },
    checkIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    badge: {
        position: 'absolute',
        top: -10,
        backgroundColor: '#fbbf24',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
    },
    formContainer: {
        marginBottom: SPACING.xl,
    },
    label: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
    },
    input: {
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        color: COLORS.text.primary,
        borderWidth: 1,
        borderColor: COLORS.border.primary,
    },
    helperText: {
        color: COLORS.accent.lime,
        fontSize: TYPOGRAPHY.sizes.xs,
        marginTop: 4,
    },
    uploadButton: {
        height: 120,
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border.primary,
        borderStyle: 'dashed',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadPlaceholder: {
        alignItems: 'center',
    },
    uploadText: {
        color: COLORS.accent.cyan,
        marginTop: 10,
        fontWeight: 'bold',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    payButton: {
        backgroundColor: COLORS.accent.cyan,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    disabledButton: {
        opacity: 0.7,
    },
    payButtonText: {
        color: '#000',
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    benefitsContainer: {
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border.primary,
    },
    benefitsTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.md,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    benefitTextContainer: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    benefitText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    benefitSubtext: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.xs,
        marginTop: 2,
    },
    benefitHighlight: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginTop: SPACING.sm,
    },
    benefitHighlightText: {
        color: COLORS.status.success,
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginLeft: SPACING.sm,
    },
    disclaimer: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.xs,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    marketingContainer: {
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        marginBottom: SPACING.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.secondary,
    },
    marketingTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    marketingText: {
        fontSize: TYPOGRAPHY.sizes.md,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    marketingGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: SPACING.lg,
        gap: SPACING.md,
    },
    marketingItem: {
        flex: 1,
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.background.primary,
        borderRadius: BORDER_RADIUS.md,
    },
    marketingItemTitle: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
        marginTop: SPACING.sm,
        marginBottom: 4,
        textAlign: 'center',
    },
    marketingItemText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.tertiary,
        textAlign: 'center',
        lineHeight: 16,
    },
    highlightBox: {
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    highlightText: {
        color: COLORS.accent.gold,
        fontSize: TYPOGRAPHY.sizes.sm,
        textAlign: 'center',
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    placementContainer: {
        marginBottom: SPACING.xl,
    },
    placementCard: {
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedPlacement: {
        borderColor: COLORS.accent.cyan,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
    },
    placementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: 4,
    },
    placementTitle: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    selectedPlacementText: {
        color: COLORS.accent.cyan,
    },
    placementSubtext: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.tertiary,
        marginLeft: 32,
    },
    placementCheck: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
});

export default SponsorScreen;
