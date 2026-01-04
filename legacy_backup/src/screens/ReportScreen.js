import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ReportScreen = ({ navigation }) => {
    const [type, setType] = useState('suggestion'); // 'suggestion' or 'error'
    const [message, setMessage] = useState('');

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert('Missing Information', 'Please describe your suggestion or error.');
            return;
        }

        const subject = type === 'error' ? '⚠️ Error Report - Sports Prophecy' : '💡 Suggestion - Sports Prophecy';
        const body = `Type: ${type.toUpperCase()}\n\nMessage:\n${message}\n\n---\nUser Info (Optional):\nUsername: [Enter Username]\nDevice: [Enter Device]`;

        const url = `mailto:Contact@sportsprophecyapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            Linking.openURL(url);
        } else {
            Alert.alert('Error', 'Could not open email client. Please email Contact@sportsprophecyapp.com directly.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Feedback & Support</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <LinearGradient
                    colors={['#0f172a', '#1e293b']}
                    style={styles.card}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="chatbubbles-outline" size={40} color="#38bdf8" />
                    </View>
                    <Text style={styles.title}>We Value Your Feedback!</Text>
                    <Text style={styles.subtitle}>
                        Help us improve Sports Prophecy. Suggestions used will earn <Text style={styles.highlight}>5 ENTRIES</Text> into our Beta Testers Draw!
                    </Text>

                    {/* Type Selector */}
                    <View style={styles.selectorContainer}>
                        <TouchableOpacity
                            style={[styles.selectorButton, type === 'suggestion' && styles.activeSelector]}
                            onPress={() => setType('suggestion')}
                        >
                            <Ionicons name="bulb-outline" size={20} color={type === 'suggestion' ? '#fff' : '#94a3b8'} />
                            <Text style={[styles.selectorText, type === 'suggestion' && styles.activeText]}>Suggestion</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.selectorButton, type === 'error' && styles.activeSelector]}
                            onPress={() => setType('error')}
                        >
                            <Ionicons name="bug-outline" size={20} color={type === 'error' ? '#fff' : '#94a3b8'} />
                            <Text style={[styles.selectorText, type === 'error' && styles.activeText]}>Report Error</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Message Input */}
                    <Text style={styles.label}>
                        {type === 'suggestion' ? 'Your Suggestion' : 'Describe the Error'}
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder={type === 'suggestion' ? "I think it would be cool if..." : "I found a bug when..."}
                        placeholderTextColor="#64748b"
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                    />

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <LinearGradient
                            colors={['#38bdf8', '#0ea5e9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradient}
                        >
                            <Text style={styles.submitText}>Send via Email</Text>
                            <Ionicons name="mail-outline" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>
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
    },
    content: {
        padding: 20,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
        alignSelf: 'center',
        marginBottom: 15,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    highlight: {
        color: '#fbbf24',
        fontWeight: 'bold',
    },
    selectorContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    selectorButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    activeSelector: {
        backgroundColor: '#38bdf8',
    },
    selectorText: {
        color: '#94a3b8',
        fontWeight: '600',
    },
    activeText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    label: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        padding: 15,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        minHeight: 150,
        marginBottom: 30,
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ReportScreen;
