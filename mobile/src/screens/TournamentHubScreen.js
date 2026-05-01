import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import axios from 'axios';

export default function TournamentHubScreen({ route, navigation }) {
    // hubId can be 'world-cup' or 'nhl-playoffs'
    const { hubId, title, icon } = route.params;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [hubId]);

    const fetchData = async () => {
        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com/api';
            const res = await axios.get(`${API_URL}/pulse/${hubId}`);
            setData(res.data);
        } catch (err) {
            console.error('Error fetching hub:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent.cyan} />
            </View>
        );
    }

    const matches = data?.matches || data?.series || [];
    let displayed = matches;
    if (filter === 'live') displayed = matches.filter(m => m.status === 'In Progress');
    if (filter === 'upcoming') displayed = matches.filter(m => m.status === 'Scheduled' || m.status === 'Postponed');
    if (filter === 'completed') displayed = matches.filter(m => m.completed);

    const renderCard = (item) => {
        const isNHL = hubId === 'nhl-playoffs';
        const home = item.home;
        const away = item.away;
        const completed = item.completed;
        const isLive = item.status === 'In Progress';

        return (
            <TouchableOpacity 
                key={item.id} 
                style={styles.card}
                onPress={() => navigation.navigate('Sport', { sportId: isNHL ? 'icehockey_nhl' : 'soccer', sportName: title })}
            >
                {isLive && (
                    <View style={styles.liveTag}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                )}

                <View style={styles.teamsRow}>
                    {/* Home */}
                    <View style={styles.team}>
                        <Image source={{ uri: home?.logo }} style={styles.logo} />
                        <Text style={styles.teamAbbr}>{home?.abbr || home?.name?.substring(0,3)}</Text>
                        {(completed || isNHL) && (
                            <Text style={[styles.score, (completed && home?.winner) && styles.winnerScore]}>
                                {isNHL ? home.wins : home?.score} {isNHL && 'W'}
                            </Text>
                        )}
                    </View>

                    {/* Middle Info */}
                    <View style={styles.middle}>
                        {!completed && !isLive && !isNHL && item.date ? (
                            <Text style={styles.dateText}>
                                {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        ) : isNHL ? (
                            <Text style={styles.seriesSummary}>{item.summary || `${home.wins}-${away.wins}`}</Text>
                        ) : (
                            <Text style={styles.vsText}>FT</Text>
                        )}
                    </View>

                    {/* Away */}
                    <View style={styles.team}>
                        {(completed || isNHL) && (
                            <Text style={[styles.score, (completed && away?.winner) && styles.winnerScore]}>
                                {isNHL ? away.wins : away?.score} {isNHL && 'W'}
                            </Text>
                        )}
                        <Text style={styles.teamAbbr}>{away?.abbr || away?.name?.substring(0,3)}</Text>
                        <Image source={{ uri: away?.logo }} style={styles.logo} />
                    </View>
                </View>

                {isNHL && item.lastGame?.detail && (
                    <Text style={styles.lastGameText}>Last: {item.lastGame.detail}</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerTitles}>
                    <Text style={styles.title}>{icon} {title}</Text>
                    <Text style={styles.subtitle}>{data?.phase || 'Tournament Phase'}</Text>
                </View>
            </LinearGradient>

            <View style={styles.filterBar}>
                {['all', 'live', 'upcoming', 'completed'].map(f => (
                    <TouchableOpacity 
                        key={f} 
                        style={[styles.filterBtn, filter === f && styles.activeFilter]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
                            {f.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {displayed.length === 0 ? (
                    <Text style={styles.emptyText}>No matches found.</Text>
                ) : (
                    displayed.map(renderCard)
                )}

                <TouchableOpacity 
                    style={styles.predictBtn}
                    onPress={() => navigation.navigate('Sport', { sportId: hubId === 'nhl-playoffs' ? 'icehockey_nhl' : 'soccer', sportName: title })}
                >
                    <Text style={styles.predictBtnText}>Predict in Arena →</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' },
    header: { padding: 20, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: 15 },
    headerTitles: { flex: 1 },
    title: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    subtitle: { color: '#888', fontSize: 14, marginTop: 4 },
    filterBar: { flexDirection: 'row', padding: 15, justifyContent: 'space-between', backgroundColor: '#16213e' },
    filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
    activeFilter: { backgroundColor: COLORS.accent.cyan },
    filterText: { color: '#888', fontSize: 12, fontWeight: 'bold' },
    activeFilterText: { color: '#000' },
    scroll: { padding: 15, paddingBottom: 50 },
    emptyText: { color: '#888', textAlign: 'center', marginTop: 40 },
    card: { backgroundColor: '#1a1a24', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#2a2a35' },
    teamsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    team: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    logo: { width: 30, height: 30, resizeMode: 'contain' },
    teamAbbr: { color: '#FFF', fontWeight: 'bold', marginHorizontal: 10, fontSize: 16 },
    score: { color: '#888', fontSize: 18, fontWeight: 'bold' },
    winnerScore: { color: '#2ed573' },
    middle: { width: 60, alignItems: 'center' },
    vsText: { color: '#888', fontWeight: 'bold' },
    dateText: { color: '#888', fontSize: 12 },
    seriesSummary: { color: '#fff', fontSize: 14, fontWeight: 'bold', backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    lastGameText: { color: '#888', fontSize: 12, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
    liveTag: { position: 'absolute', top: -10, left: 10, backgroundColor: '#ff4757', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF', marginRight: 4 },
    liveText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    predictBtn: { backgroundColor: COLORS.accent.cyan, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    predictBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});
