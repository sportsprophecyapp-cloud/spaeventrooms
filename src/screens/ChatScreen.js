import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatScreen = () => {
  const { user } = useAuth();

  // View State: 'lobby' or 'chat'
  const [view, setView] = useState('lobby');
  const [currentRoom, setCurrentRoom] = useState(null); // null = General (if we treat General as a room, or handle separately)

  // Lobby State
  const [rooms, setRooms] = useState([]);
  const [lobbyCount, setLobbyCount] = useState(0);
  const [loadingRooms, setLoadingRooms] = useState(false);
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
          <Ionicons name="person" size={10} color="#fff" />
          <Text style={styles.countText}>{item.userCount || 0}</Text>
        </View>
        <Ionicons
          name={item.type === 'private' ? "lock-closed" : "chevron-forward"}
          size={20}
          color={item.type === 'private' ? "#f59e0b" : "#94a3b8"}
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
            <Ionicons name="add" size={24} color="#fff" />
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
            <Ionicons name="person" size={10} color="#fff" />
            <Text style={styles.countText}>{lobbyCount}</Text>
          </View>
          <Ionicons name="people" size={20} color="#38bdf8" style={{ marginLeft: 10 }} />
        </TouchableOpacity>

        {loadingRooms ? (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 20 }} />
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
                placeholderTextColor="#64748b"
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
                  placeholderTextColor="#64748b"
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
                placeholderTextColor="#64748b"
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
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{currentRoom ? currentRoom.name : 'Lobby'}</Text>
          {currentRoom && currentRoom.sponsor?.isActive && (
            <Text style={{ color: '#34d399', fontSize: 10 }}>Sponsored by {currentRoom.sponsor.name}</Text>
          )}
        </View>
        {currentRoom ? (
          <TouchableOpacity onPress={() => setShowSponsorModal(true)} style={{ padding: 5 }}>
            <Ionicons name="star-outline" size={24} color="#fbbf24" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {loadingMessages ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
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
            placeholderTextColor="#64748b"
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
              <Ionicons name="send" size={20} color="#fff" />
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
              placeholderTextColor="#64748b"
              value={sponsorName}
              onChangeText={setSponsorName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Website Link"
              placeholderTextColor="#64748b"
              value={sponsorLink}
              onChangeText={setSponsorLink}
            />

            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  createButton: {
    padding: 5,
  },
  backButton: {
    padding: 5,
  },
  listContent: {
    padding: 15,
    paddingBottom: 20,
  },
  // Room Card Styles
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  generalCard: {
    margin: 15,
    marginBottom: 5,
    borderColor: '#38bdf8',
    borderWidth: 1,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roomMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  emptyText: {
    color: '#64748b',
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
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -15,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 4,
  },
  typeOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeOptionActive: {
    backgroundColor: '#38bdf8',
  },
  typeText: {
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  typeTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 10,
    backgroundColor: '#334155',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    marginLeft: 10,
    backgroundColor: '#38bdf8',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    color: '#38bdf8',
    marginRight: 5,
  },
  theirSenderName: {
    color: '#94a3b8',
    marginLeft: 5,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#0284c7',
    borderTopRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
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
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default ChatScreen;
