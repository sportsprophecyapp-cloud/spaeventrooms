import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { apiService } from '../services/api';

import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const ChatScreen = () => {
  const { user } = useAuth();

  // View State: 'lobby' or 'chat'
  const [view, setView] = useState('lobby');
  const [currentRoom, setCurrentRoom] = useState(null); // null = General (if we treat General as a room, or handle separately)

  // Lobby State
  const [rooms, setRooms] = useState([]);
  const [lobbyCount, setLobbyCount] = useState(0);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoomToJoin, setSelectedRoomToJoin] = useState(null);

  // Create Room Form
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('public');
  const [newRoomPassword, setNewRoomPassword] = useState('');

  // Join Room Form
  const [joinPassword, setJoinPassword] = useState('');

  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  // Sponsor Ad State
  const [activeSponsors, setActiveSponsors] = useState([]);
  const [currentSponsorIndex, setCurrentSponsorIndex] = useState(0);
  const [showCustomAdModal, setShowCustomAdModal] = useState(false);
  const [customAdBanner, setCustomAdBanner] = useState('');
  const [customAdLink, setCustomAdLink] = useState('');
  const [customAdEnabled, setCustomAdEnabled] = useState(false);

  // --- Lobby Logic ---

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const data = await apiService.getRooms();
      // Handle new response format { rooms, lobbyCount }
      if (data.rooms) {
        setRooms(data.rooms);
        setLobbyCount(data.lobbyCount || 0);
      } else {
        // Fallback for old format (array)
        setRooms(Array.isArray(data) ? data : []);
        setLobbyCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch rooms', error);
      setRoomsError('Failed to load rooms. Please try again.');
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (view === 'lobby') {
      fetchRooms();
      const interval = setInterval(fetchRooms, 10000); // Refresh room list every 10s
      return () => clearInterval(interval);
    }
  }, [view]);

  // Fetch Active Sponsors
  const fetchSponsors = async () => {
    try {
      const data = await apiService.getActiveSponsors();
      setActiveSponsors(data);
    } catch (error) {
      console.error('Failed to fetch sponsors', error);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  // Rotate through sponsors every 10 seconds
  useEffect(() => {
    if (activeSponsors.length > 1) {
      const rotationInterval = setInterval(() => {
        setCurrentSponsorIndex((prevIndex) => (prevIndex + 1) % activeSponsors.length);
      }, 10000); // 10 seconds per sponsor

      return () => clearInterval(rotationInterval);
    }
  }, [activeSponsors]);

  // Load custom ad data when entering a private room
  useEffect(() => {
    if (currentRoom && currentRoom.type === 'private' && currentRoom.customAd) {
      setCustomAdBanner(currentRoom.customAd.bannerUrl || '');
      setCustomAdLink(currentRoom.customAd.linkUrl || '');
      setCustomAdEnabled(currentRoom.customAd.enabled || false);
    }
  }, [currentRoom]);

  // Handle Custom Ad Update
  const handleUpdateCustomAd = async () => {
    if (!currentRoom) return;

    try {
      await apiService.updateRoomCustomAd(currentRoom._id, {
        bannerUrl: customAdBanner,
        linkUrl: customAdLink,
        enabled: customAdEnabled
      });

      if (Platform.OS === 'web') {
        window.alert('Custom ad updated successfully!');
      } else {
        Alert.alert('Success', 'Custom ad updated successfully!');
      }

      setShowCustomAdModal(false);
      // Refresh room data
      fetchRooms();
    } catch (error) {
      const errorMsg = error.error || 'Failed to update custom ad';
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const handleCreateRoom = async () => {
    console.log('Attempting to create room:', { newRoomName, newRoomType, user });

    if (!user) {
      const msg = 'You must be logged in to create a room';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }

    if (!newRoomName.trim()) {
      const msg = 'Room name is required';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }
    if (newRoomType === 'private' && !newRoomPassword.trim()) {
      const msg = 'Password is required for private rooms';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }

    try {
      const result = await apiService.createRoom({
        name: newRoomName,
        type: newRoomType,
        password: newRoomPassword,
        userId: user.uuid
      });

      console.log('Room created successfully:', result);
      setShowCreateModal(false);
      setNewRoomName('');
      setNewRoomPassword('');
      setNewRoomType('public');
      fetchRooms();

      // Auto-join the created room
      enterRoom(result.room);
    } catch (error) {
      console.error('Create room error:', error);
      const errorMsg = error.error || error.message || 'Failed to create room';
      Platform.OS === 'web' ? window.alert(errorMsg) : Alert.alert('Error', errorMsg);
    }
  };

  const handleJoinRequest = (room) => {
    if (room.isPrivate) {
      setSelectedRoomToJoin(room);
      setJoinPassword('');
      setShowJoinModal(true);
    } else {
      enterRoom(room);
    }
  };

  const submitJoinPrivate = async () => {
    try {
      await apiService.joinRoom(selectedRoomToJoin._id, joinPassword);
      setShowJoinModal(false);
      enterRoom(selectedRoomToJoin);
    } catch (error) {
      Alert.alert('Error', error.error || 'Incorrect password');
    }
  };

  const enterRoom = (room) => {
    setCurrentRoom(room);
    setView('chat');
  };

  // --- Chat Logic ---

  const fetchMessages = async () => {
    try {
      const roomId = currentRoom ? currentRoom._id : null; // null for General
      const data = await apiService.getChat(roomId, user?.uuid); // Pass userId for presence
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (view === 'chat') {
      setLoadingMessages(true);
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [view, currentRoom]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage('');
    setSending(true);

    console.log('DEBUG: Sending chat with user badges:', user?.badges);

    // Optimistic update
    const tempMsg = {
      id: Date.now(),
      sender_name: user?.idName || 'Me',
      message: text,
      pending: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await apiService.sendChat({
        sender_name: user?.idName,
        sender_id: user?.uuid,
        message: text,
        sender_badges: user?.badges || [],
        roomId: currentRoom ? currentRoom._id : null
      });
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setSending(false);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setView('lobby');
    setMessages([]);
  };

  // --- Room Sponsorship Logic ---
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorLink, setSponsorLink] = useState('');
  const [sponsorBanner, setSponsorBanner] = useState('https://via.placeholder.com/600x200'); // Placeholder for now

  const handleSponsorRoom = async () => {
    if (!sponsorName || !sponsorLink) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const response = await apiService.createRoomSponsorCheckout({
        roomId: currentRoom._id,
        sponsorName,
        linkUrl: sponsorLink,
        bannerUrl: sponsorBanner
      });

      if (response.checkoutUrl) {
        await WebBrowser.openBrowserAsync(response.checkoutUrl);
        setShowSponsorModal(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate sponsorship');
    }
  };

  // --- Renderers ---

  const renderRoomItem = ({ item }) => (
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => handleJoinRequest(item)}
    >
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomMeta}>
          {item.type === 'private' ? 'Private • Password Protected' : 'Public • Open to all'}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.countBadge}>
          <Ionicons name="person" size={10} color={COLORS.text.primary} />
          <Text style={styles.countText}>{item.userCount || 0}</Text>
        </View>
        <Ionicons
          name={item.type === 'private' ? "lock-closed" : "chevron-forward"}
          size={20}
          color={item.type === 'private' ? COLORS.status.warning : COLORS.text.tertiary}
          style={{ marginLeft: 10 }}
        />
      </View>
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }) => {
    const isMe = item.sender_name === (user?.idName || user?.username);

    // Extract role badge from sender's badges (if available)
    const getRoleBadge = () => {
      if (!item.sender_badges || !Array.isArray(item.sender_badges)) return null;

      // Priority: Admin > Server Mod > Room Creator > Beta Tester
      if (item.sender_badges.includes('👑 Admin')) return '👑';
      if (item.sender_badges.includes('🛡️ Server Moderator')) return '🛡️';
      if (item.sender_badges.includes('🔨 Room Creator')) return '🔨';
      if (item.sender_badges.includes('🚀 Beta Tester')) return '🚀';
      return null;
    };

    const roleBadge = getRoleBadge();

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.theirMessageContainer]}>
        <View style={styles.senderRow}>
          <Text style={[styles.senderName, isMe ? styles.mySenderName : styles.theirSenderName]}>
            {item.sender_name}
          </Text>
          {roleBadge && (
            <Text style={styles.roleBadge}>{roleBadge}</Text>
          )}
        </View>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      </View>
    );
  };

  if (view === 'lobby') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat Rooms</Text>
          <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.createButton}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.accent.cyan} />
            <Text style={styles.createButtonText}>Create Room</Text>
          </TouchableOpacity>
        </View>

        {/* Lobby (Main Public Chat) */}
        <TouchableOpacity
          style={[styles.roomCard, styles.generalCard]}
          onPress={() => enterRoom(null)}
        >
          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>Lobby</Text>
            <Text style={styles.roomMeta}>Main Public Chat</Text>
          </View>
          <View style={styles.countBadge}>
            <Ionicons name="person" size={10} color={COLORS.text.primary} />
            <Text style={styles.countText}>{lobbyCount}</Text>
          </View>
          <Ionicons name="people" size={20} color={COLORS.accent.cyan} style={{ marginLeft: 10 }} />
        </TouchableOpacity>

        {loadingRooms ? (
          <ActivityIndicator size="large" color={COLORS.accent.cyan} style={{ marginTop: 20 }} />
        ) : roomsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{roomsError}</Text>
            <TouchableOpacity onPress={fetchRooms} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={rooms}
            renderItem={renderRoomItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No custom rooms yet. Create one!</Text>
            }
          />
        )}

        {/* Create Room Modal */}
        <Modal visible={showCreateModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Room</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Room Name"
                placeholderTextColor={COLORS.text.tertiary}
                value={newRoomName}
                onChangeText={setNewRoomName}
              />

              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeOption, newRoomType === 'public' && styles.typeOptionActive]}
                  onPress={() => setNewRoomType('public')}
                >
                  <Text style={[styles.typeText, newRoomType === 'public' && styles.typeTextActive]}>Public</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, newRoomType === 'private' && styles.typeOptionActive]}
                  onPress={() => setNewRoomType('private')}
                >
                  <Text style={[styles.typeText, newRoomType === 'private' && styles.typeTextActive]}>Private</Text>
                </TouchableOpacity>
              </View>

              {newRoomType === 'private' && (
                <TextInput
                  style={styles.modalInput}
                  placeholder="Set Password"
                  placeholderTextColor={COLORS.text.tertiary}
                  value={newRoomPassword}
                  onChangeText={setNewRoomPassword}
                  secureTextEntry
                />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreateRoom} style={styles.confirmButton}>
                  <Text style={styles.confirmButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Join Room Modal */}
        <Modal visible={showJoinModal} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Password</Text>
              <Text style={styles.modalSubtitle}>for {selectedRoomToJoin?.name}</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Password"
                placeholderTextColor={COLORS.text.tertiary}
                value={joinPassword}
                onChangeText={setJoinPassword}
                secureTextEntry
                autoFocus
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setShowJoinModal(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={submitJoinPrivate} style={styles.confirmButton}>
                  <Text style={styles.confirmButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Chat View
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeaveRoom} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{currentRoom ? currentRoom.name : 'Lobby'}</Text>
          {currentRoom && currentRoom.sponsor?.isActive && (
            <Text style={{ color: COLORS.status.success, fontSize: 10 }}>Sponsored by {currentRoom.sponsor.name}</Text>
          )}
        </View>
        {currentRoom ? (
          <TouchableOpacity onPress={() => setShowSponsorModal(true)} style={{ padding: 5 }}>
            <Ionicons name="star-outline" size={24} color={COLORS.status.warning} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Sponsor Ads Section */}
      <View style={styles.adsContainer}>
        {/* Main Sponsor Ad (all rooms) - ROTATING */}
        {activeSponsors.length > 0 && activeSponsors[currentSponsorIndex] && (
          <TouchableOpacity
            onPress={() => activeSponsors[currentSponsorIndex].linkUrl && WebBrowser.openBrowserAsync(activeSponsors[currentSponsorIndex].linkUrl)}
            style={styles.sponsorAdCard}
          >
            <LinearGradient
              colors={['#1e293b', '#334155']}
              style={styles.sponsorAdGradient}
            >
              <Text style={styles.sponsorAdLabel}>SPONSORED</Text>
              <Text style={styles.sponsorAdName}>{activeSponsors[currentSponsorIndex].sponsorName}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Custom Ad (private rooms only) */}
        {currentRoom && currentRoom.type === 'private' && currentRoom.customAd?.enabled && (
          <TouchableOpacity
            onPress={() => currentRoom.customAd.linkUrl && WebBrowser.openBrowserAsync(currentRoom.customAd.linkUrl)}
            style={[styles.sponsorAdCard, { marginTop: 8 }]}
          >
            <LinearGradient
              colors={['#065f46', '#064e3b']}
              style={styles.sponsorAdGradient}
            >
              <Text style={styles.sponsorAdLabel}>ROOM AD</Text>
              <Text style={styles.sponsorAdName}>Custom Advertisement</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Manage Custom Ad Button (private room creator only) */}
        {currentRoom && currentRoom.type === 'private' && currentRoom.createdBy === user?.uuid && (
          <TouchableOpacity
            onPress={() => setShowCustomAdModal(true)}
            style={styles.manageAdButton}
          >
            <Ionicons name="settings-outline" size={14} color={COLORS.accent.cyan} />
            <Text style={styles.manageAdText}>Manage Room Ad</Text>
          </TouchableOpacity>
        )}
      </View>

      {loadingMessages ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.cyan} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.text.tertiary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
            style={{ borderRadius: 20, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={(!newMessage.trim() || sending) ? ['#475569', '#475569'] : ['#00d4ff', '#2979ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButton}
            >
              <Ionicons name="send" size={20} color={COLORS.text.inverse} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Sponsor Room Modal */}
      <Modal visible={showSponsorModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sponsor This Room</Text>
            <Text style={styles.modalSubtitle}>$25 for 30 Days</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Sponsor Name"
              placeholderTextColor={COLORS.text.tertiary}
              value={sponsorName}
              onChangeText={setSponsorName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Website Link"
              placeholderTextColor={COLORS.text.tertiary}
              value={sponsorLink}
              onChangeText={setSponsorLink}
            />


            <Text style={{ color: COLORS.text.secondary, fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
              Banner upload coming soon. Using placeholder.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowSponsorModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSponsorRoom} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Pay $25</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Ad Management Modal (Private Room Creator Only) */}
      <Modal visible={showCustomAdModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Room Ad</Text>
            <Text style={styles.modalSubtitle}>Free Custom Ad for Your Private Room</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Banner Image URL"
              placeholderTextColor={COLORS.text.tertiary}
              value={customAdBanner}
              onChangeText={setCustomAdBanner}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Click Destination URL"
              placeholderTextColor={COLORS.text.tertiary}
              value={customAdLink}
              onChangeText={setCustomAdLink}
            />

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Enable Custom Ad</Text>
              <TouchableOpacity
                onPress={() => setCustomAdEnabled(!customAdEnabled)}
                style={[styles.toggle, customAdEnabled && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, customAdEnabled && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowCustomAdModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdateCustomAd} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.tertiary,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.accent.cyan,
    elementGap: 6, // Not supported in React Native StyleSheet directly, using gap in styles below or standard margin
    gap: 6,
  },
  createButtonText: {
    color: COLORS.accent.cyan,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  backButton: {
    padding: 5,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 20,
  },
  // Room Card Styles
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.tertiary,
  },
  generalCard: {
    margin: SPACING.md,
    marginBottom: SPACING.xs,
    borderColor: COLORS.accent.cyan,
    borderWidth: 1,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  roomMeta: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  emptyText: {
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.tertiary,
  },
  modalTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: -15,
    marginBottom: SPACING.lg,
  },
  modalInput: {
    backgroundColor: COLORS.background.primary,
    color: COLORS.text.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.tertiary,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.sm,
    padding: 4,
  },
  typeOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeOptionActive: {
    backgroundColor: COLORS.accent.cyan,
  },
  typeText: {
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  typeTextActive: {
    color: COLORS.text.inverse,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    marginRight: 10,
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: SPACING.md,
    marginLeft: 10,
    backgroundColor: COLORS.accent.cyan,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  confirmButtonText: {
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  // Chat Styles (Reused)
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  mySenderName: {
    color: COLORS.accent.cyan,
    marginRight: 5,
  },
  theirSenderName: {
    color: COLORS.text.secondary,
    marginLeft: 5,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: COLORS.accent.blue,
    borderTopRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: COLORS.background.surface,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.tertiary,
  },
  messageText: {
    color: COLORS.text.primary,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: COLORS.background.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.tertiary,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: COLORS.text.primary,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  roleBadge: {
    fontSize: 14,
  },
  countBadge: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginLeft: 4,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  errorText: {
    color: COLORS.status.error,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.accent.cyan,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Sponsor Ad Styles
  adsContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  sponsorAdCard: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  sponsorAdGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  sponsorAdLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sponsorAdName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  manageAdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    marginTop: SPACING.xs,
    gap: 6,
  },
  manageAdText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.accent.cyan,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  // Toggle Switch Styles
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background.surface,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.accent.cyan,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.text.tertiary,
  },
  toggleThumbActive: {
    backgroundColor: COLORS.text.inverse,
    alignSelf: 'flex-end',
  },
});

export default ChatScreen;
