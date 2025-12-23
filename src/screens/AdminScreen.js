import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Image, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api, { apiService } from '../services/api';

const PERMISSION_DESCRIPTIONS = {
    can_manage_users: "Allows searching for users and viewing their basic profile info.",
    can_ban_users: "Gives the ability to ban or unban users from the application.",
    can_manage_sponsors: "Allows approving, rejecting, or putting sponsor applications on hold.",
    can_send_notifications: "Gives access to send global push notifications to all users.",
    can_manage_roles: "Allows promoting users to Moderator or Admin status.",
    can_mute_users: "Gives power to mute users instantly from the chat room.",
    can_kick_users: "Allows removing/banning a user from a specific chat room.",
    can_delete_rooms: "Gives permission to permanently delete chat rooms.",
    can_view_api_stats: "Allows viewing backend server performance and API usage statistics."
};

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
    const [activeSponsors, setActiveSponsors] = useState([]);

    // Notification State
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notifLoading, setNotifLoading] = useState(false);

    // Permission Management State
    const [rolePermissions, setRolePermissions] = useState([]);
    const [permLoading, setPermLoading] = useState(false);
    const [permSaving, setPermSaving] = useState(null); // role being saved

    // Analytics State
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsTab, setAnalyticsTab] = useState('overview'); // 'overview'', 'stats'
    const [userAnalyticsData, setUserAnalyticsData] = useState([]);
    const [userSearchQuery, setUserSearchQuery] = useState('');

    useEffect(() => {
        if (user?.role !== 'admin' && user?.role !== 'moderator') {
            Alert.alert('Access Denied', 'You do not have required privileges.');
            navigation.goBack();
        } else {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        if (activeTab === 'users') {
            fetchModerators();
        } else if (activeTab === 'permissions') {
            fetchRolePermissions();
        } else if (activeTab === 'analytics') {
            if (analyticsTab === 'overview') {
                fetchAnalytics();
            } else {
                fetchUserAnalytics(userSearchQuery);
            }
        } else {
            fetchModerators();
            fetchPendingSponsors();
            fetchActiveSponsors();
        }
    };

    const fetchModerators = async () => {
        try {
            const response = await api.get('/admin/moderators');
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
            console.error('Error fetching pending sponsors:', error);
        }
    };

    const fetchActiveSponsors = async () => {
        try {
            const sponsors = await apiService.getActiveSponsors();
            setActiveSponsors(sponsors);
        } catch (error) {
            console.error('Error fetching active sponsors:', error);
        }
    };

    const fetchRolePermissions = async () => {
        setLoading(true);
        try {
            const data = await apiService.getRolePermissions();
            setRolePermissions(data);
        } catch (error) {
            console.error('Error fetching role permissions:', error);
            Alert.alert('Error', 'Failed to fetch role permissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const data = await apiService.getAdminAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Alert.alert('Error', 'Failed to fetch analytics'); // Optional: silent fail preferred for analytics
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchUserAnalytics = async (search = '') => {
        setAnalyticsLoading(true);
        try {
            const data = await apiService.getAdminUserAnalytics(search);
            setUserAnalyticsData(data);
        } catch (error) {
            console.error('Error fetching user analytics:', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };


    const handleTogglePermission = (role, permission) => {
        setRolePermissions(prev => prev.map(rp => {
            if (rp.role === role) {
                return {
                    ...rp,
                    permissions: {
                        ...rp.permissions,
                        [permission]: !rp.permissions[permission]
                    }
                };
            }
            return rp;
        }));
    };

    const handleSavePermissions = async (role) => {
        const rp = rolePermissions.find(r => r.role === role);
        if (!rp) return;

        setPermSaving(role);
        try {
            await apiService.updateRolePermissions(role, rp.permissions);
            Alert.alert('Success', `Permissions for ${role.toUpperCase()} updated!`);
        } catch (error) {
            console.error('Error saving role permissions:', error);
            Alert.alert('Error', error.error || 'Failed to update permissions');
        } finally {
            setPermSaving(null);
        }
    };

    const handleQuickRoleChange = async (email, newRole) => {
        Alert.alert(
            `Change Role`,
            `Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        // Frontend check
                        if (newRole === 'admin' && user?.role !== 'admin') {
                            Alert.alert('Restricted', 'Only Administrators can promote users to Admin status.');
                            return;
                        }

                        setLoading(true);
                        try {
                            const response = await api.post('/admin/set-role', {
                                adminEmail: user.email,
                                targetEmail: email,
                                newRole: newRole
                            });
                            Alert.alert('Success', response.data.message);
                            fetchModerators();
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.error || 'Failed to update role');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSetRole = async () => {
        if (!targetEmail.trim()) {
            Alert.alert('Error', 'Please enter a user email');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/admin/set-role', {
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
                            const response = await api.post('/admin/ban-user', {
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

    const handleApproveSponsor = async (sponsor, duration) => {
        const title = 'Approve Sponsor';
        const durationText = duration === '1week' ? '1 Week' : '1 Month';
        const message = `Approve ${sponsor.sponsorName} for a ${durationText} ad?`;

        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n${message}`)) {
                setLoading(true);
                try {
                    await apiService.approveSponsor(sponsor._id, duration);
                    window.alert(`Success: Sponsor approved for ${durationText}!`);
                    fetchPendingSponsors();
                } catch (error) {
                    window.alert('Error: Failed to approve sponsor');
                } finally {
                    setLoading(false);
                }
            }
        } else {
            Alert.alert(title, message, [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: `Approve (${durationText})`,
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await apiService.approveSponsor(sponsor._id, duration);
                            Alert.alert('Success', `Sponsor approved for ${durationText}!`);
                            fetchPendingSponsors();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to approve sponsor');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]);
        }
    };

    const handleHoldSponsor = async (sponsor) => {
        const title = 'Hold Sponsor';
        const message = 'Put this application on hold? The sponsor will not be live.';

        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n${message}`)) {
                setLoading(true);
                try {
                    await apiService.holdSponsor(sponsor._id);
                    window.alert('Success: Sponsor put on hold');
                    fetchPendingSponsors();
                } catch (error) {
                    window.alert('Error: Failed to update sponsor');
                } finally {
                    setLoading(false);
                }
            }
        } else {
            Alert.alert(title, message, [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Put on Hold',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await apiService.holdSponsor(sponsor._id);
                            Alert.alert('Success', 'Sponsor put on hold');
                            fetchPendingSponsors();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to update sponsor');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]);
        }
    };

    const handleDeactivateSponsor = async (sponsor) => {
        const title = 'Remove Prize Draw Ad';
        const message = `Remove ${sponsor.sponsorName} from Prize Draws page? This will hide the ad but keep the sponsor record.`;

        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n${message}`)) {
                setLoading(true);
                try {
                    await apiService.deactivateSponsor(sponsor._id);
                    window.alert('Success: Ad removed from Prize Draws!');
                    fetchActiveSponsors();
                } catch (error) {
                    window.alert('Error: Failed to remove ad');
                } finally {
                    setLoading(false);
                }
            }
        } else {
            Alert.alert(title, message, [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await apiService.deactivateSponsor(sponsor._id);
                            Alert.alert('Success', 'Ad removed from Prize Draws!');
                            fetchActiveSponsors();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove ad');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]);
        }
    };

    const handleDeleteSponsor = async (sponsor) => {
        const title = 'Delete Sponsor';
        const message = `Are you sure you want to permanently delete ${sponsor.sponsorName}? This action cannot be undone.`;

        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n${message}`)) {
                setLoading(true);
                try {
                    await apiService.deleteSponsor(sponsor._id);
                    window.alert('Success: Sponsor deleted successfully!');
                    fetchPendingSponsors();
                } catch (error) {
                    window.alert('Error: Failed to delete sponsor');
                } finally {
                    setLoading(false);
                }
            }
        } else {
            Alert.alert(title, message, [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await apiService.deleteSponsor(sponsor._id);
                            Alert.alert('Success', 'Sponsor deleted successfully!');
                            fetchPendingSponsors();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete sponsor');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]);
        }
    };

    const handleSendNotification = async () => {
        if (!notificationMessage.trim()) {
            if (Platform.OS === 'web') {
                window.alert('Error: Please enter a message');
            } else {
                Alert.alert('Error', 'Please enter a message');
            }
            return;
        }

        const title = 'Confirm Send';
        const message = 'This will notify ALL users. Are you sure?';

        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n${message}`)) {
                setNotifLoading(true);
                try {
                    await apiService.sendAdminNotification(notificationMessage.trim());
                    window.alert('Success: Notification sent to all users');
                    setNotificationMessage('');
                } catch (error) {
                    window.alert('Error: Failed to send notification');
                    console.error(error);
                } finally {
                    setNotifLoading(false);
                }
            }
        } else {
            Alert.alert(
                title,
                message,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Send',
                        onPress: async () => {
                            setNotifLoading(true);
                            try {
                                await apiService.sendAdminNotification(notificationMessage.trim());
                                Alert.alert('Success', 'Notification sent to all users');
                                setNotificationMessage('');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to send notification');
                                console.error(error);
                            } finally {
                                setNotifLoading(false);
                            }
                        }
                    }
                ]
            );
        }
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
                        {['moderator', 'admin'].filter(r => r !== 'admin' || user?.role === 'admin').map((role) => (
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

                            <View style={styles.modActions}>
                                {mod.role === 'moderator' && user?.role === 'admin' && (
                                    <TouchableOpacity
                                        style={[styles.modActionButton, { backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}
                                        onPress={() => handleQuickRoleChange(mod.email, 'admin')}
                                    >
                                        <Text style={[styles.modActionText, { color: '#fbbf24' }]}>Promote</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={[styles.modActionButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                                    onPress={() => handleQuickRoleChange(mod.email, 'user')}
                                >
                                    <Text style={[styles.modActionText, { color: '#ef4444' }]}>Demote</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modActionButton, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}
                                    onPress={() => setActiveTab('permissions')}
                                >
                                    <Text style={[styles.modActionText, { color: '#38bdf8' }]}>Rights</Text>
                                </TouchableOpacity>
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

                            {/* STATUS BADGE */}
                            {sponsor.paymentStatus === 'hold' && (
                                <View style={{ backgroundColor: '#facc15', alignSelf: 'flex-start', paddingHorizontal: 8, borderRadius: 4, marginBottom: 5 }}>
                                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 10 }}>ON HOLD</Text>
                                </View>
                            )}

                            <TouchableOpacity onPress={() => Linking.openURL(sponsor.linkUrl)}>
                                <Text style={styles.sponsorLink}>{sponsor.linkUrl}</Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <Text style={styles.detailLabel}>Prize:</Text>
                            <Text style={styles.detailValue}>{sponsor.prizeDetails.description}</Text>

                            <Text style={styles.detailLabel}>Contact:</Text>
                            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${sponsor.contactEmail}`)}>
                                <Text style={[styles.detailValue, { color: '#38bdf8', textDecorationLine: 'underline' }]}>{sponsor.contactEmail}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                            <TouchableOpacity style={[styles.actionButton, { flex: 1 }]} onPress={() => handleApproveSponsor(sponsor, '1week')} disabled={loading}>
                                <LinearGradient colors={['#059669', '#10b981']} style={styles.gradient}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="time" size={16} color="#fff" /><Text style={[styles.buttonText, { fontSize: 13 }]}>1 Week</Text></>}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionButton, { flex: 1 }]} onPress={() => handleApproveSponsor(sponsor, '1month')} disabled={loading}>
                                <LinearGradient colors={['#047857', '#059669']} style={styles.gradient}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="calendar" size={16} color="#fff" /><Text style={[styles.buttonText, { fontSize: 13 }]}>1 Month</Text></>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={[styles.actionButton, { marginTop: 10, opacity: 0.8 }]} onPress={() => {
                            const title = 'Reject Application';
                            const message = 'Are you sure you want to reject and delete this application?';

                            if (Platform.OS === 'web') {
                                if (window.confirm(`${title}\n${message}`)) {
                                    setLoading(true);
                                    apiService.rejectSponsor(sponsor._id)
                                        .then(() => {
                                            window.alert('Application rejected');
                                            fetchPendingSponsors();
                                        })
                                        .catch(() => window.alert('Failed to reject'))
                                        .finally(() => setLoading(false));
                                }
                            } else {
                                Alert.alert(title, message, [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Reject', style: 'destructive', onPress: async () => {
                                            setLoading(true);
                                            try {
                                                await apiService.rejectSponsor(sponsor._id);
                                                Alert.alert('Success', 'Application rejected');
                                                fetchPendingSponsors();
                                            } catch (error) {
                                                Alert.alert('Error', 'Failed to reject');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }
                                    }
                                ]);
                            }
                        }} disabled={loading}>
                            <Text style={{ color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>Reject Application</Text>
                        </TouchableOpacity>

                    </LinearGradient>
                ))
            )}

            {/* Active Prize Draws Section */}
            <Text style={[styles.sectionTitle, { marginTop: 30 }]}>🎯 Active Prize Draws</Text>
            <Text style={styles.sectionSubtitle}>Manage live ads on Prize Draws page</Text>
            {activeSponsors.length === 0 ? (
                <View style={[styles.card, { padding: 20 }]}>
                    <Text style={{ color: '#94a3b8', textAlign: 'center' }}>No active prize draws</Text>
                </View>
            ) : (
                activeSponsors.map(sponsor => (
                    <LinearGradient key={sponsor._id} colors={['#0f172a', '#1e293b']} style={[styles.card, { marginBottom: 15 }]}>
                        {sponsor.bannerUrl && (
                            <Image source={{ uri: sponsor.bannerUrl }} style={styles.sponsorBanner} resizeMode="cover" />
                        )}

                        <View style={{ padding: 15 }}>
                            <Text style={styles.sponsorName}>{sponsor.sponsorName}</Text>

                            <Text style={styles.detailLabel}>Prize:</Text>
                            <Text style={styles.detailValue}>{sponsor.prizeDetails?.description || 'N/A'}</Text>

                            <Text style={styles.detailLabel}>Expires:</Text>
                            <Text style={styles.detailValue}>{sponsor.endDate ? new Date(sponsor.endDate).toLocaleDateString() : 'N/A'}</Text>

                            <TouchableOpacity
                                style={[styles.actionButton, { marginTop: 15 }]}
                                onPress={() => handleDeactivateSponsor(sponsor)}
                                disabled={loading}
                            >
                                <LinearGradient colors={['#dc2626', '#ef4444']} style={styles.gradient}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="close-circle" size={16} color="#fff" /><Text style={[styles.buttonText, { fontSize: 14 }]}>Remove from Prize Draws</Text></>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                ))
            )}
        </View>
    );

    const renderPermissionManagement = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔑 Role Permissions</Text>
            <Text style={styles.sectionSubtitle}>Configure what each role can do in the application.</Text>

            {rolePermissions.map((rp) => (
                <LinearGradient key={rp.role} colors={['#0f172a', '#1e293b']} style={[styles.card, { marginBottom: 20 }]}>
                    <View style={styles.roleHeader}>
                        <View style={[styles.roleBadge, rp.role === 'admin' && styles.adminRoleBadge]}>
                            <Text style={styles.roleBadgeText}>{rp.role.toUpperCase()}</Text>
                        </View>
                        {permSaving === rp.role ? (
                            <ActivityIndicator color="#38bdf8" size="small" />
                        ) : (
                            <TouchableOpacity onPress={() => handleSavePermissions(rp.role)}>
                                <Text style={styles.saveText}>Save Changes</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.permissionList}>
                        {Object.entries(rp.permissions).map(([perm, enabled]) => (
                            <TouchableOpacity
                                key={perm}
                                style={styles.permissionItem}
                                onPress={() => handleTogglePermission(rp.role, perm)}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.permissionName}>
                                        {perm.replace(/_/g, ' ').replace('can ', '')}
                                    </Text>
                                    <Text style={styles.permissionDescription}>
                                        {PERMISSION_DESCRIPTIONS[perm] || "No description available."}
                                    </Text>
                                </View>
                                <Ionicons
                                    name={enabled ? "checkbox" : "square-outline"}
                                    size={24}
                                    color={enabled ? "#38bdf8" : "#64748b"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </LinearGradient>
            ))}
        </View>
    );

    const renderNotificationManagement = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Send Global Notification</Text>
            <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.card}>
                <Text style={styles.label}>Message</Text>
                <Text style={styles.infoText}>This message will be sent to all users and appear in their profile notifications.</Text>
                <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    placeholder="Enter notification message..."
                    placeholderTextColor="#64748b"
                    value={notificationMessage}
                    onChangeText={setNotificationMessage}
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity
                    style={[styles.actionButton, !notificationMessage.trim() && { opacity: 0.5 }]}
                    onPress={handleSendNotification}
                    disabled={notifLoading || !notificationMessage.trim()}
                >
                    <LinearGradient colors={['#8b5cf6', '#a78bfa']} style={styles.gradient}>
                        {notifLoading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="paper-plane" size={20} color="#fff" /><Text style={styles.buttonText}>Send to All Users</Text></>}
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );

    const renderUserAnalyticsList = () => (
        <View>
            {/* Search Bar */}
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]}
                    placeholder="Search by name, email, or uuid..."
                    placeholderTextColor="#64748b"
                    value={userSearchQuery}
                    onChangeText={setUserSearchQuery}
                    onSubmitEditing={() => fetchUserAnalytics(userSearchQuery)}
                />
                <TouchableOpacity
                    style={[styles.actionButton, { width: 'auto', paddingHorizontal: 20 }]}
                    onPress={() => fetchUserAnalytics(userSearchQuery)}
                >
                    <LinearGradient colors={['#38bdf8', '#0ea5e9']} style={styles.gradient}>
                        <Ionicons name="search" size={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {analyticsLoading ? (
                <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 20 }} />
            ) : userAnalyticsData.length === 0 ? (
                <View style={[styles.card, { padding: 30, alignItems: 'center' }]}>
                    <Text style={{ color: '#94a3b8' }}>No users found.</Text>
                </View>
            ) : (
                userAnalyticsData.map((usr) => (
                    <LinearGradient key={usr.uuid} colors={['#0f172a', '#1e293b']} style={[styles.card, { marginBottom: 10 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <View>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{usr.username}</Text>
                                <Text style={{ color: '#94a3b8', fontSize: 12 }}>{usr.email}</Text>
                                <Text style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>{usr.uuid}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: '#38bdf8', fontWeight: 'bold' }}>Tokens: {usr.tokens}</Text>
                                <Text style={{ color: '#fbbf24', fontWeight: 'bold' }}>Crowns: {usr.crowns}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10 }}>
                            <View style={{ width: '50%', marginBottom: 8 }}>
                                <Text style={{ color: '#64748b', fontSize: 11 }}>Predictions</Text>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>{usr.predictionCount}</Text>
                            </View>
                            <View style={{ width: '50%', marginBottom: 8 }}>
                                <Text style={{ color: '#64748b', fontSize: 11 }}>Draw Entries</Text>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>{usr.drawEntryCount}</Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <Text style={{ color: '#64748b', fontSize: 11 }}>Joined</Text>
                                <Text style={{ color: '#fff', fontSize: 12 }}>{new Date(usr.createdAt).toLocaleDateString()}</Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <Text style={{ color: '#64748b', fontSize: 11 }}>Last Login</Text>
                                <Text style={{ color: '#fff', fontSize: 12 }}>{usr.lastLoginDate ? new Date(usr.lastLoginDate).toLocaleDateString() : 'N/A'}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                ))
            )}
        </View>
    );

    const renderAnalytics = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 App Analytics</Text>

            {/* Sub-Navigation for Analytics */}
            <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: '#0f172a', borderRadius: 10, padding: 4 }}>
                <TouchableOpacity
                    style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: analyticsTab === 'overview' ? '#334155' : 'transparent' }}
                    onPress={() => { setAnalyticsTab('overview'); fetchAnalytics(); }}
                >
                    <Text style={{ color: analyticsTab === 'overview' ? '#fff' : '#94a3b8', fontWeight: '600' }}>Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: analyticsTab === 'users' ? '#334155' : 'transparent' }}
                    onPress={() => { setAnalyticsTab('users'); fetchUserAnalytics(); }}
                >
                    <Text style={{ color: analyticsTab === 'users' ? '#fff' : '#94a3b8', fontWeight: '600' }}>User List</Text>
                </TouchableOpacity>
            </View>

            {analyticsTab === 'users' ? renderUserAnalyticsList() : (
                <>
                    <Text style={styles.sectionSubtitle}>Performance metrics and user engagement stats.</Text>

                    {analyticsLoading ? (
                        <View style={[styles.card, { padding: 40 }]}>
                            <ActivityIndicator size="large" color="#38bdf8" />
                        </View>
                    ) : !analytics ? (
                        <View style={[styles.card, { padding: 20 }]}>
                            <Text style={{ color: '#94a3b8', textAlign: 'center' }}>Could not load analytics.</Text>
                            <TouchableOpacity onPress={fetchAnalytics} style={[styles.actionButton, { marginTop: 10 }]}>
                                <LinearGradient colors={['#38bdf8', '#0ea5e9']} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Retry</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {/* User Growth Section */}
                            <Text style={styles.subHeader}>User Growth</Text>
                            <View style={styles.statsGrid}>
                                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.statCard}>
                                    <Text style={styles.statLabel}>Total Users</Text>
                                    <Text style={styles.statValue}>{analytics.growth.totalUsers}</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.statCard}>
                                    <Text style={styles.statLabel}>Signups (7d)</Text>
                                    <Text style={[styles.statValue, { color: '#4ade80' }]}>+{analytics.growth.newUsers7d}</Text>
                                </LinearGradient>
                            </View>
                            <View style={styles.statsGrid}>
                                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.statCard}>
                                    <Text style={styles.statLabel}>Organic (30d)</Text>
                                    <Text style={styles.statValue}>{analytics.growth.organicRate}%</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.statCard}>
                                    <Text style={styles.statLabel}>Referral (30d)</Text>
                                    <Text style={styles.statValue}>{analytics.growth.referralRate}%</Text>
                                </LinearGradient>
                            </View>

                            {/* Engagement Section */}
                            <Text style={styles.subHeader}>Engagement</Text>
                            <View style={styles.statsGrid}>
                                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.statCard}>
                                    <Text style={styles.statLabel}>DAU (Today)</Text>
                                    <Text style={styles.statValue}>{analytics.engagement.dau}</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.statCard}>
                                    <Text style={styles.statLabel}>MAU (30d)</Text>
                                    <Text style={styles.statValue}>{analytics.engagement.mau}</Text>
                                </LinearGradient>
                            </View>
                            <View style={styles.statsGrid}>
                                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.statCard}>
                                    <Text style={styles.statLabel}>Avg Preds/User</Text>
                                    <Text style={styles.statValue}>{analytics.engagement.avgPredsPerUser}</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.statCard}>
                                    <Text style={styles.statLabel}>Total Preds (7d)</Text>
                                    <Text style={styles.statValue}>{analytics.engagement.predictions7d}</Text>
                                </LinearGradient>
                            </View>

                            {/* Retention Section */}
                            <Text style={styles.subHeader}>Retention & Monetization</Text>
                            <View style={styles.statsGrid}>
                                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.statCard}>
                                    <Text style={styles.statLabel}>Day 3 Retention</Text>
                                    <Text style={[styles.statValue, { color: '#fbbf24' }]}>{analytics.retention.day3RetentionRate}%</Text>
                                    <Text style={styles.statSub}>Cohort: {analytics.retention.cohortSize}</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.statCard}>
                                    <Text style={styles.statLabel}>Prize Entry Rate</Text>
                                    <Text style={[styles.statValue, { color: '#a78bfa' }]}>{analytics.retention.prizeEntryRate}%</Text>
                                </LinearGradient>
                            </View>
                        </>
                    )}
                </>
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
                <TouchableOpacity style={[styles.tab, activeTab === 'notifications' && styles.activeTab]} onPress={() => setActiveTab('notifications')}>
                    <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>Notifications</Text>
                </TouchableOpacity>
                {user?.role === 'admin' && (
                    <TouchableOpacity style={[styles.tab, activeTab === 'analytics' && styles.activeTab]} onPress={() => setActiveTab('analytics')}>
                        <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
                    </TouchableOpacity>
                )}
                {user?.role === 'admin' && (
                    <TouchableOpacity style={[styles.tab, activeTab === 'permissions' && styles.activeTab]} onPress={() => setActiveTab('permissions')}>
                        <Text style={[styles.tabText, activeTab === 'permissions' && styles.activeTabText]}>Permissions</Text>
                    </TouchableOpacity>
                )}
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

                {activeTab === 'users' && renderUserManagement()}
                {activeTab === 'sponsors' && renderSponsorManagement()}
                {activeTab === 'notifications' && renderNotificationManagement()}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'permissions' && renderPermissionManagement()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    sectionSubtitle: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 20,
        marginTop: -10,
    },
    roleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        paddingBottom: 10,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 10,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statLabel: {
        color: '#94a3b8',
        fontSize: 12,
        marginBottom: 5,
        textAlign: 'center',
    },
    statValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    statSub: {
        color: '#64748b',
        fontSize: 10,
        marginTop: 2,
    },
    subHeader: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    saveText: {
        color: '#38bdf8',
        fontWeight: 'bold',
        fontSize: 14,
    },
    permissionList: {
        gap: 12,
    },
    permissionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    permissionName: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        textTransform: 'capitalize',
        marginBottom: 2,
    },
    permissionDescription: {
        color: '#94a3b8',
        fontSize: 12,
    },
    modActions: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 15,
    },
    modActionButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modActionText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
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
