import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import axios from 'axios';

const API_URL = 'https://api.sportsprophecyapp.com/api';

const AdminScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'sponsors'

    // User Management State
    const [moderators, setModerators] = useState([]);
    const [targetEmail, setTargetEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('moderator');

    // Sponsor Management State
    const [pendingSponsors, setPendingSponsors] = useState([]);

    useEffect(() => {
        if (user?.role !== 'admin') {
            Alert.alert('Access Denied', 'You do not have admin privileges.');
            navigation.goBack();
        } else {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        if (activeTab === 'users') {
            fetchModerators();
        } else {
            fetchPendingSponsors();
        }
    };

    const fetchModerators = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/moderators`, {
                data: { adminEmail: user.email }
            });
            setModerators(response.data.moderators || []);
        } catch (error) {
            console.error('Error fetching moderators:', error);
        }
    };

    const fetchPendingSponsors = async () => {
        try {
            const sponsors = await apiService.getPendingSponsors();
            setPendingSponsors(sponsors);
        } catch (error) {
            console.error('Error fetching sponsors:', error);
        }
    };

    const handleSetRole = async () => {
        if (!targetEmail.trim()) {
            Alert.alert('Error', 'Please enter a user email');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/admin/set-role`, {
                adminEmail: user.email,
                targetEmail: targetEmail.trim(),
                newRole: selectedRole
            });

            Alert.alert('Success', response.data.message);
            setTargetEmail('');
            fetchModerators();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to set role');
        } finally {
            setLoading(false);
        }
    };

    const handleBanUser = async (email, shouldBan) => {
        Alert.alert(
            shouldBan ? 'Ban User' : 'Unban User',
            `Are you sure you want to ${shouldBan ? 'ban' : 'unban'} ${email}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: shouldBan ? 'Ban' : 'Unban',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await axios.post(`${API_URL}/admin/ban-user`, {
                                adminEmail: user.email,
                                targetEmail: email,
                                banned: shouldBan
                            });
                            Alert.alert('Success', response.data.message);
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.error || 'Failed to ban user');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleApproveSponsor = async (sponsor) => {
        Alert.alert(
            'Approve Sponsor',
            `Approve ${sponsor.sponsorName} for a ${sponsor.prizeDetails.value >= 50 ? '1 Month' : '1 Week'} ad?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await apiService.approveSponsor(sponsor._id);
                            Alert.alert('Success', 'Sponsor approved and ad is live!');
                            fetchPendingSponsors();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to approve sponsor');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderUserManagement = () => (
        <>
            {/* Role Management */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👥 Manage User Roles</Text>
                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.card}>
                    <Text style={styles.label}>User Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="user@example.com"
                        placeholderTextColor="#64748b"
                        value={targetEmail}
                        onChangeText={setTargetEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>Assign Role</Text>
                    <View style={styles.roleSelector}>
                        {['user', 'moderator', 'admin'].map((role) => (
                            <TouchableOpacity
                                key={role}
                                style={[styles.roleButton, selectedRole === role && styles.activeRole]}
                                onPress={() => setSelectedRole(role)}
                            >
                                <Text style={[styles.roleText, selectedRole === role && styles.activeRoleText]}>
                                    {role.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.actionButton} onPress={handleSetRole} disabled={loading}>
                        <LinearGradient colors={['#38bdf8', '#0ea5e9']} style={styles.gradient}>
                            {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="person-add" size={20} color="#fff" /><Text style={styles.buttonText}>Set Role</Text></>}
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {/* Ban User */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🚫 Ban Management</Text>
                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.card}>
                    <Text style={styles.infoText}>Enter a user's email above and use the buttons below to ban or unban them.</Text>
                    <View style={styles.banButtons}>
                        <TouchableOpacity style={[styles.actionButton, { flex: 1, marginRight: 10 }]} onPress={() => targetEmail.trim() && handleBanUser(targetEmail.trim(), true)} disabled={loading || !targetEmail.trim()}>
                            <LinearGradient colors={['#dc2626', '#ef4444']} style={styles.gradient}>
                                <Ionicons name="ban" size={20} color="#fff" /><Text style={styles.buttonText}>Ban</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, { flex: 1 }]} onPress={() => targetEmail.trim() && handleBanUser(targetEmail.trim(), false)} disabled={loading || !targetEmail.trim()}>
                            <LinearGradient colors={['#059669', '#10b981']} style={styles.gradient}>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" /><Text style={styles.buttonText}>Unban</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            {/* Moderator List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🛡️ Current Moderators</Text>
                {moderators.length === 0 ? (
                    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.card}>
                        <Text style={styles.emptyText}>No moderators assigned yet</Text>
                    </LinearGradient>
                ) : (
                    moderators.map((mod, index) => (
                        <LinearGradient key={index} colors={['#0f172a', '#1e293b']} style={[styles.card, { marginBottom: 10 }]}>
                            <View style={styles.modItem}>
                                <View style={styles.modInfo}>
                                    <View style={styles.modHeader}>
                                        <Text style={styles.modName}>{mod.username}</Text>
                                        <View style={[styles.roleBadge, mod.role === 'admin' && styles.adminRoleBadge]}>
                                            <Text style={styles.roleBadgeText}>{mod.role.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.modEmail}>{mod.email}</Text>
                                </View>
                                <Ionicons name={mod.role === 'admin' ? 'shield' : 'shield-checkmark-outline'} size={24} color={mod.role === 'admin' ? '#fbbf24' : '#38bdf8'} />
                            </View>
                        </LinearGradient>
                    ))
                )}
            </View>
        </>
    );

    const renderSponsorManagement = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>📢 Pending Prize Applications</Text>
            {pendingSponsors.length === 0 ? (
                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.card}>
                    <Text style={styles.emptyText}>No pending applications</Text>
                </LinearGradient>
            ) : (
                pendingSponsors.map((sponsor) => (
                    <LinearGradient key={sponsor._id} colors={['#0f172a', '#1e293b']} style={[styles.card, { marginBottom: 20 }]}>
                        <Image source={{ uri: sponsor.bannerUrl }} style={styles.sponsorBanner} resizeMode="cover" />

                        <View style={styles.sponsorDetails}>
                            <Text style={styles.sponsorName}>{sponsor.sponsorName}</Text>
                            <TouchableOpacity onPress={() => Linking.openURL(sponsor.linkUrl)}>
                                <Text style={styles.sponsorLink}>{sponsor.linkUrl}</Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <Text style={styles.detailLabel}>Prize:</Text>
                            <Text style={styles.detailValue}>{sponsor.prizeDetails.description}</Text>

                            <Text style={styles.detailLabel}>Value:</Text>
                            <Text style={styles.detailValue}>${sponsor.prizeDetails.value}</Text>

                            <Text style={styles.detailLabel}>Contact:</Text>
                            <Text style={styles.detailValue}>{sponsor.contactEmail}</Text>
                        </View>

                        <TouchableOpacity style={styles.actionButton} onPress={() => handleApproveSponsor(sponsor)} disabled={loading}>
                            <LinearGradient colors={['#059669', '#10b981']} style={styles.gradient}>
                                {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark-circle" size={20} color="#fff" /><Text style={styles.buttonText}>Approve Ad</Text></>}
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                ))
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Panel</Text>
                <Ionicons name="shield-checkmark" size={24} color="#fbbf24" />
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, activeTab === 'users' && styles.activeTab]} onPress={() => setActiveTab('users')}>
                    <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'sponsors' && styles.activeTab]} onPress={() => setActiveTab('sponsors')}>
                    <Text style={[styles.tabText, activeTab === 'sponsors' && styles.activeTabText]}>Sponsors</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Admin Info */}
                <LinearGradient colors={['#1e293b', '#334155']} style={styles.card}>
                    <View style={styles.adminBadge}>
                        <Ionicons name="shield" size={20} color="#fbbf24" />
                        <Text style={styles.adminText}>ADMIN</Text>
                    </View>
                    <Text style={styles.welcomeText}>Welcome, {user?.username}</Text>
                    <Text style={styles.emailText}>{user?.email}</Text>
                </LinearGradient>

                {activeTab === 'users' ? renderUserManagement() : renderSponsorManagement()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        paddingHorizontal: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#38bdf8',
    },
    tabText: {
        color: '#94a3b8',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#38bdf8',
    },
    content: {
        padding: 20,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 20,
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 15,
        gap: 6,
    },
    adminText: {
        color: '#fbbf24',
        fontWeight: 'bold',
        fontSize: 12,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    emailText: {
        fontSize: 14,
        color: '#94a3b8',
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    label: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        padding: 15,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    roleSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    activeRole: {
        backgroundColor: '#38bdf8',
    },
    roleText: {
        color: '#94a3b8',
        fontWeight: '600',
        fontSize: 12,
    },
    activeRoleText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    actionButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
    },
    gradient: {
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoText: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 15,
        lineHeight: 20,
    },
    banButtons: {
        flexDirection: 'row',
    },
    modItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modInfo: {
        flex: 1,
    },
    modHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        gap: 10,
    },
    modName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    modEmail: {
        fontSize: 14,
        color: '#94a3b8',
    },
    roleBadge: {
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    adminRoleBadge: {
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
    },
    roleBadgeText: {
        color: '#38bdf8',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#64748b',
        textAlign: 'center',
        fontSize: 14,
    },
    sponsorBanner: {
        width: '100%',
        height: 100,
        borderRadius: 12,
        marginBottom: 15,
    },
    sponsorDetails: {
        marginBottom: 15,
    },
    sponsorName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    sponsorLink: {
        fontSize: 14,
        color: '#38bdf8',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 10,
    },
    detailLabel: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 5,
    },
    detailValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default AdminScreen;
