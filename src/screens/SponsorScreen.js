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
    const [selectedDuration, setSelectedDuration] = useState('week'); // 'week' or 'month'
    const [bannerImage, setBannerImage] = useState(null);

    // Prize State
    const [prizeDescription, setPrizeDescription] = useState('');
    const [prizeValue, setPrizeValue] = useState('');
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
        console.log('handlePaidSubmit_clicked');
        if (!sponsorName || !linkUrl || !bannerImage) {
            if (Platform.OS === 'web') {
                window.alert('Missing Information: Please fill in all fields and upload a banner image.');
            } else {
                Alert.alert('Missing Information', 'Please fill in all fields and upload a banner image.');
            }
            return;
        }

        setLoading(true);
        try {
            console.log('Initiating sponsor checkout...');
            const response = await apiService.createSponsorCheckout({
                sponsorName,
                bannerUrl: bannerImage,
                linkUrl,
                duration: '30days',
                price: 25
            });

            console.log('Checkout response:', response);

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
            console.error('Payment Error:', error);
            const errorMessage = error.response?.data?.message || error.message || JSON.stringify(error);
            Alert.alert('Payment Failed', `Could not initiate payment: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePrizeSubmit = async () => {
        console.log('handlePrizeSubmit_clicked');
        if (!sponsorName || !linkUrl || !bannerImage || !prizeDescription || !prizeValue || !contactEmail) {
            if (Platform.OS === 'web') {
                window.alert('Missing Information: Please fill in all fields.');
            } else {
                Alert.alert('Missing Information', 'Please fill in all fields.');
            }
            return;
        }

        setLoading(true);
        try {
            console.log('Submitting prize application...');
            await apiService.submitPrizeApplication({
                sponsorName,
                bannerUrl: bannerImage,
                linkUrl,
                prizeDescription,
                prizeValue: parseFloat(prizeValue),
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
            <Text style={styles.subtitle}>Promote your brand on our Main Page!</Text>

            <View style={styles.pricingContainer}>
                <TouchableOpacity
                    style={[styles.pricingCard, styles.selectedCard, { flex: 1 }]}
                    activeOpacity={1}
                >
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>BEST VALUE</Text>
                    </View>
                    <Text style={styles.priceTitle}>30-Day Banner Ad</Text>
                    <Text style={styles.priceAmount}>$25</Text>
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
                        Pay $25 for 30 Days
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );

    const renderPrizeTab = () => (
        <View>
            <Text style={styles.subtitle}>Sponsor a Prize Draw for Free Exposure!</Text>
            <Text style={styles.infoText}>
                Offer a prize to our users. The higher the value, the longer your ad runs (up to 1 month).
            </Text>

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
                    placeholder="e.g., $50 Gift Card, Signed Jersey"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={prizeDescription}
                    onChangeText={setPrizeDescription}
                />

                <Text style={styles.label}>Prize Value ($)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="50"
                    placeholderTextColor={COLORS.text.tertiary}
                    keyboardType="numeric"
                    value={prizeValue}
                    onChangeText={setPrizeValue}
                />
                <Text style={styles.helperText}>
                    Est. Duration: 1 Month
                </Text>

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
    disclaimer: {
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.xs,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
});

export default SponsorScreen;
