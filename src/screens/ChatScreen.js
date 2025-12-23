import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Alert, Linking, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import api, { apiService } from '../services/api';

import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getAvatarSource, BADGE_AVATARS } from '../constants/avatars';
import UserAvatar from '../components/UserAvatar';
import { BiometricService } from '../services/biometrics';
import storage from '../utils/storage';

const WARNING_PRESETS = [
  "Inappropriate language or behavior.",
  "Spamming or flooding the chat.",
  "Harassment or personal attacks.",
  "Promoting illegal content or scams.",
  "Sharing personal information (doxing).",
  "Self-promotion or advertising."
];

const MODERATION_POLICY = "Please be aware that users will be banned from chat for 1 week if too many violations occur in a 30-day period, and a 1-month ban from chat for a repeated violation thereafter.";

/**
 * Robust Cross-Platform Alert Helper
 */
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const ChatScreen = () => {
  const { user } = useAuth();

  // View State: 'lobby', 'join', 'create', or room object (for joined rooms)
  const [activeTab, setActiveTab] = useState('lobby');
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null); // null = Lobby
  const [filterType, setFilterType] = useState('all'); // all, public, private

  // Blocked Users State
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Lobby State
  const [rooms, setRooms] = useState([]);
  const [lobbyCount, setLobbyCount] = useState(0);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoomToJoin, setSelectedRoomToJoin] = useState(null);

  // Load Initial State (Blocked Users & Joined Rooms)
  useEffect(() => {
    const loadState = async () => {
      try {
        const [blocked, joined] = await Promise.all([
          storage.getItem('blocked_users'),
          storage.getItem('joined_rooms')
        ]);
        if (blocked) setBlockedUsers(JSON.parse(blocked));
        if (joined) setJoinedRooms(JSON.parse(joined));
      } catch (e) {
        console.error('Failed to load storage state', e);
      }
    };
    loadState();
  }, []);

  // Persist Joined Rooms
  useEffect(() => {
    storage.setItem('joined_rooms', JSON.stringify(joinedRooms));
  }, [joinedRooms]);

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

  // Delete Room State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);

  // Quick Moderation State
  const [modModalVisible, setModModalVisible] = useState(false);
  const [warningPresetsVisible, setWarningPresetsVisible] = useState(false);
  const [selectedUserForMod, setSelectedUserForMod] = useState(null); // { name, uuid, email, avatar }
  const [modLoading, setModLoading] = useState(false);

  // Admin/Moderator Detection
  // Admin and moderator privileges are determined server-side based on user role.
  // The backend validates permissions for all moderation actions.

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
    fetchRooms();
    const interval = setInterval(fetchRooms, 15000); // Slower refresh for API optimization
    return () => clearInterval(interval);
  }, []);

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

  // Load custom ad data for current room
  useEffect(() => {
    if (activeRoom && activeRoom.type === 'private' && activeRoom.customAd) {
      setCustomAdBanner(activeRoom.customAd.bannerUrl || '');
      setCustomAdLink(activeRoom.customAd.linkUrl || '');
      setCustomAdEnabled(activeRoom.customAd.enabled || false);
    }
  }, [activeRoom]);

  // Handle Custom Ad Update
  const handleUpdateCustomAd = async () => {
    if (!activeRoom) return;

    try {
      await apiService.updateRoomCustomAd(activeRoom._id, {
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
    if (!user || user.isGuest) {
      const msg = 'Please create an account to unlock this feature and join our community.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert(
          'Join the Club!',
          msg,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Create Account', onPress: () => navigation.navigate('Register') }
          ]
        );
      }
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
    if (room.type === 'private') {
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
    setActiveRoom(room);
    setActiveTab(room ? room._id : 'lobby');

    if (room) {
      // Add to joinedRooms if not already there, maintain max 3
      setJoinedRooms(prev => {
        const exists = prev.find(r => r._id === room._id);
        if (exists) return prev;
        const newJoined = [room, ...prev].slice(0, 3);
        return newJoined;
      });
    }
  };

  // --- Chat Logic ---

  const fetchMessages = async () => {
    try {
      const roomId = activeRoom ? activeRoom._id : null; // null for General/Lobby
      const data = await apiService.getChat(roomId, user?.uuid);
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
    if (activeTab === 'lobby' || (joinedRooms.find(r => r._id === activeTab))) {
      setLoadingMessages(true);
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Guest Restriction
    if (user?.isGuest) {
      Alert.alert(
        'Join the Club!',
        'Please create an account to unlock this feature and join our community.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => navigation.navigate('Register') }
        ]
      );
      return;
    }

    const text = newMessage;
    setNewMessage('');
    setSending(true);

    // Optimistic update
    const myBadgeId = user?.selectedBadge;
    const tempMsg = {
      id: Date.now(),
      sender_name: user?.idName || user?.username || 'Me',
      sender_avatar: user?.profilePicture,
      sender_badge_id: myBadgeId,
      sender_role: user?.role,
      message: text,
      pending: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await apiService.sendChat({
        sender_name: user?.idName,
        sender_id: user?.uuid,
        sender_avatar: user?.profilePicture,
        sender_badge_id: myBadgeId,
        message: text,
        sender_badges: user?.badges || [],
        roomId: activeRoom ? activeRoom._id : null
      });
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message', error);
      Alert.alert('Message Not Sent', error.error || 'Failed to send message. Please try again.');
      // Remove the optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    setActiveTab('lobby');
    setMessages([]);
  };

  const handleExitRoom = (room) => {
    if (!room) return;
    Alert.alert(
      'Leave Room',
      `Are you sure you want to leave ${room.name}? You will need to join it again to see messages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            setJoinedRooms(prev => prev.filter(r => r._id !== room._id));
            if (activeTab === room._id || activeRoom?._id === room._id) {
              handleLeaveRoom();
            }
          }
        }
      ]
    );
  };

  // --- Room Sponsorship Logic ---
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorLink, setSponsorLink] = useState('');
  const [sponsorBanner, setSponsorBanner] = useState('https://via.placeholder.com/600x200'); // Placeholder for now
  const [sponsorAmount, setSponsorAmount] = useState('25');

  const handleSponsorRoom = async () => {
    if (user?.isGuest) {
      Alert.alert(
        'Join the Club!',
        'Please create an account to sponsor rooms and support the community.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => navigation.navigate('Register') }
        ]
      );
      return;
    }

    if (!sponsorName || !sponsorLink) {
      const msg = 'Missing Information: Please fill in all fields.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Missing Info', msg);
      return;
    }

    const numericAmount = parseFloat(sponsorAmount);
    if (isNaN(numericAmount) || numericAmount < 0.50) {
      const msg = 'Invalid Amount: Minimum sponsorship amount is $0.50.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Invalid Amount', msg);
      return;
    }

    // Assuming setLoadingCheckout is defined elsewhere, or will be added.
    // For now, just adding it as per the instruction.
    // setLoadingCheckout(true);

    try {
      const response = await apiService.createRoomSponsorCheckout({
        roomId: activeRoom._id,
        sponsorName,
        linkUrl: sponsorLink,
        bannerUrl: sponsorBanner,
        amount: parseFloat(sponsorAmount) || 25
      });

      if (response.checkoutUrl) {
        await WebBrowser.openBrowserAsync(response.checkoutUrl);
        setShowSponsorModal(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate sponsorship');
    }
  };

  // --- Main Renderers ---

  const renderMessageItem = ({ item }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.message}</Text>
        </View>
      );
    }

    const isMe = item.sender_name === (user?.idName || user?.username);
    const getRoleBadge = () => {
      // Prioritize explicit sender_role from the message
      if (item.sender_role === 'admin') return '👑';
      if (item.sender_role === 'moderator') return '🛡️';

      // Fallback to legacy badges array check
      if (!item.sender_badges || !Array.isArray(item.sender_badges)) return null;
      if (item.sender_badges.includes('👑 Admin')) return '👑';
      if (item.sender_badges.includes('🛡️ Server Moderator')) return '🛡️';
      if (item.sender_badges.includes('🔨 Room Creator')) return '🔨';
      if (item.sender_badges.includes('🚀 Beta Tester')) return '🚀';
      return null;
    };
    const roleBadge = getRoleBadge();

    // Verification Badge (Equipped)
    const badgeObj = item.sender_badge_id ? BADGE_AVATARS.find(b => b.id === item.sender_badge_id) : null;

    return (
      <View style={[styles.messageOuterContainer, isMe ? styles.myOuterContainer : styles.theirOuterContainer]}>
        {!isMe && (
          <TouchableOpacity
            style={styles.chatAvatarContainer}
            onPress={() => handleAvatarPress(item)}
            activeOpacity={0.7}
            disabled={user?.role === 'user'}
          >
            <UserAvatar
              size={44}
              profilePicture={item.sender_avatar}
              selectedBadge={item.sender_badge_id}
              fallbackName={item.sender_name}
              style={styles.chatAvatar}
              customBadgeSize={18}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onLongPress={() => !isMe && handleReportMessage(item)}
          delayLongPress={500}
          activeOpacity={0.8}
          style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.theirMessageContainer]}
        >
          <View style={styles.senderRow}>
            <Text style={[styles.senderName, isMe ? styles.mySenderName : styles.theirSenderName]}>
              {item.sender_name}
            </Text>
            {roleBadge && <Text style={styles.roleBadge}>{roleBadge}</Text>}
          </View>
          <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        </TouchableOpacity>

        {isMe && (
          <View style={styles.chatAvatarContainer}>
            <UserAvatar
              size={44}
              profilePicture={user?.profilePicture}
              selectedBadge={user?.selectedBadge}
              fallbackName={user?.idName || user?.username}
              style={styles.chatAvatar}
              customBadgeSize={18}
            />
          </View>
        )}
      </View>
    );
  };

  const renderRoomItem = ({ item }) => (
    <TouchableOpacity style={styles.roomCard} onPress={() => handleJoinRequest(item)}>
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

  const handleBlockUser = async (userId, userName) => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${userName}? You will no longer see their messages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              const newBlocked = [...blockedUsers, userId];
              setBlockedUsers(newBlocked);
              await storage.setItem('blocked_users', JSON.stringify(newBlocked));
              Alert.alert('Blocked', `${userName} has been blocked.`);
            } catch (e) {
              Alert.alert('Error', 'Failed to block user.');
            }
          }
        }
      ]
    );
  };

  const handleModAction = async (action) => {
    if (!selectedUserForMod) return;

    const targetEmail = selectedUserForMod.email || `${selectedUserForMod.name}@sportsprophecy.com`;
    const targetUuid = selectedUserForMod.uuid;

    setModLoading(true);

    try {
      if (action === 'ban') {
        await api.post('/admin/ban-user', {
          targetEmail,
          targetUuid,
          banned: true
        });
        showAlert('Success', `${selectedUserForMod.name} has been banned.`);
      } else if (action === 'mute') {
        await apiService.muteUser(targetEmail, true, targetUuid);
        // Isolate notification to prevent silent failure if notification fails
        try {
          await apiService.sendAdminNotification(`🔇 You have been muted by a moderator. ${MODERATION_POLICY}`, targetUuid);
        } catch (notifErr) {
          console.warn('[MOD] Warning: Mute notification failed to send', notifErr);
        }
        showAlert('Success', `${selectedUserForMod.name} has been muted.`);
      } else if (action === 'unmute') {
        await apiService.muteUser(targetEmail, false, targetUuid);

        // Isolate notification
        try {
          await apiService.sendAdminNotification(`🔊 Your chat privileges have been restored by a moderator.`, targetUuid, false);
        } catch (notifErr) {
          console.warn('[MOD] Warning: Unmute notification failed to send', notifErr);
        }

        showAlert('Success', `${selectedUserForMod.name} has been unmuted.`);
      } else if (action === 'kick') {
        await apiService.kickUser(targetEmail, activeRoom?._id, targetUuid);
        try {
          await apiService.sendAdminNotification(`👢 You have been removed from the chat room "${activeRoom?.name || 'General'}". ${MODERATION_POLICY}`, targetUuid);
        } catch (notifErr) {
          console.warn('[MOD] Warning: Kick notification failed to send', notifErr);
        }
        showAlert('Success', `${selectedUserForMod.name} has been removed.`);
      } else if (action === 'warn') {
        setWarningPresetsVisible(true);
        return;
      } else if (action === 'makeMod') {
        await apiService.setUserRole('moderator', targetEmail, targetUuid);
        showAlert('Success', `${selectedUserForMod.name} is now a Moderator.`);
      } else if (action === 'removeMod') {
        await apiService.setUserRole('user', targetEmail, targetUuid);
        showAlert('Success', `${selectedUserForMod.name} has been removed from Moderator role.`);
      }
      setModModalVisible(false);
    } catch (error) {
      console.error('[MOD ERROR]:', action, error);

      // Attempt to extract the most descriptive error message
      let errorMsg = 'Moderation action failed.';
      if (error.error) {
        errorMsg = error.error;
      } else if (error.message) {
        errorMsg = error.message;
      }

      if (error.details) {

      }

      showAlert('Moderation Error', errorMsg);
    } finally {
      setModLoading(false);
    }
  };

  const handleSendPresetWarn = async (preset) => {
    if (!selectedUserForMod) return;

    setModLoading(true);
    const targetEmail = selectedUserForMod.email || `${selectedUserForMod.name}@sportsprophecy.com`;
    const targetUuid = selectedUserForMod.uuid;

    try {
      // 1. Send targeted notification (triggers auto-mute by default)
      try {
        const officialMessage = `⚠️ Official Warning: ${preset} ${MODERATION_POLICY}`;
        await apiService.sendAdminNotification(officialMessage, targetUuid);
      } catch (notifErr) {
        console.warn('[MOD] Targeted notification failed', notifErr);
      }

      // 2. Send in-chat system message
      try {
        const publicMessage = `⚠️ Official Warning to ${selectedUserForMod.name}: ${preset}`;
        await api.post('/chat', {
          sender_name: "SYSTEM",
          sender_id: user?.uuid,
          message: publicMessage,
          roomId: activeRoom?._id,
          type: 'system',
          targetUserId: targetUuid
        });
      } catch (chatErr) {
        console.warn('[MOD] System chat message failed', chatErr);
      }

      showAlert('Success', `Warning sent to ${selectedUserForMod.name}.`);
      setWarningPresetsVisible(false);
      setModModalVisible(false);
    } catch (error) {
      console.error('Warn error:', error);
      showAlert('Error', error.error || 'Failed to send warning.');
    } finally {
      setModLoading(false);
    }
  };

  const handleAvatarPress = (msg) => {
    if (user?.role === 'admin' || user?.role === 'moderator') {
      if (msg.sender_id === user?.uuid) return; // Don't mod yourself

      setSelectedUserForMod({
        name: msg.sender_name,
        uuid: msg.sender_id,
        avatar: msg.sender_avatar,
        email: msg.sender_email,
        role: msg.sender_role
      });
      setModModalVisible(true);
    }
  };

  const handleReportMessage = (msg) => {
    Alert.alert(
      'Message Options',
      'Choose an action for this message:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block User', onPress: () => handleBlockUser(msg.sender_id, msg.sender_name) },
        {
          text: 'Report Message',
          style: 'destructive',
          onPress: async () => {
            const subject = 'Chat Report – Sports Prophecy';
            const roomName = activeRoom ? activeRoom.name : 'Public Lobby';
            const timestamp = new Date().toISOString();
            const reportingUserId = user?.uuid || user?.uid || 'Unknown';
            const body = `Reported Message:\n"${msg.message}"\n\nReported User ID:\n${msg.sender_id}\n\nReporting User ID:\n${reportingUserId}\n\nRoom:\n${roomName}\n\nTimestamp:\n${timestamp}`;
            const url = `mailto:Contact@sportsprophecyapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) Linking.openURL(url);
            else Alert.alert('Error', 'Could not open mail client. Please email Contact@sportsprophecyapp.com');
          }
        }
      ]
    );
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
        {/* Fixed Tabs */}
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lobby' && styles.activeTab]}
          onPress={() => enterRoom(null)}
        >
          <Ionicons name="chatbubbles" size={16} color={activeTab === 'lobby' ? COLORS.text.inverse : COLORS.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'lobby' && styles.activeTabText]}>Lobby</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'join' && styles.activeTab]}
          onPress={() => setActiveTab('join')}
        >
          <Ionicons name="search" size={16} color={activeTab === 'join' ? COLORS.text.inverse : COLORS.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'join' && styles.activeTabText]}>Join</Text>
        </TouchableOpacity>

        {/* Dynamic Joined Rooms */}
        {joinedRooms.map((room) => (
          <TouchableOpacity
            key={room._id}
            style={[styles.tab, activeTab === room._id && styles.activeTab]}
            onPress={() => enterRoom(room)}
          >
            <Text style={[styles.tabText, activeTab === room._id && styles.activeTabText]} numberOfLines={1}>
              {room.name}
            </Text>
            <TouchableOpacity onPress={() => handleExitRoom(room)} style={styles.closeTabIcon}>
              <Ionicons name="close" size={12} color={activeTab === room._id ? COLORS.text.inverse : COLORS.text.secondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab, { marginLeft: 10 }]}
          onPress={() => setActiveTab('create')}
        >
          <Ionicons name="add" size={18} color={activeTab === 'create' ? COLORS.text.inverse : COLORS.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>Create</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderChatView = () => (
    <>
      <View style={styles.adsContainer}>
        {activeSponsors.length > 0 && activeSponsors[currentSponsorIndex] && (
          <TouchableOpacity
            onPress={() => activeSponsors[currentSponsorIndex].linkUrl && WebBrowser.openBrowserAsync(activeSponsors[currentSponsorIndex].linkUrl)}
            style={styles.sponsorAdCard}
          >
            <LinearGradient colors={['#1e293b', '#334155']} style={styles.sponsorAdGradient}>
              <Text style={styles.sponsorAdLabel}>SPONSORED</Text>
              <Text style={styles.sponsorAdName}>{activeSponsors[currentSponsorIndex].sponsorName}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {activeRoom && activeRoom.type === 'private' && activeRoom.customAd?.enabled && (
          <TouchableOpacity
            onPress={() => activeRoom.customAd.linkUrl && WebBrowser.openBrowserAsync(activeRoom.customAd.linkUrl)}
            style={[styles.sponsorAdCard, { marginTop: 8 }]}
          >
            <LinearGradient colors={['#065f46', '#064e3b']} style={styles.sponsorAdGradient}>
              <Text style={styles.sponsorAdLabel}>ROOM AD</Text>
              <Text style={styles.sponsorAdName}>Custom Advertisement</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {activeRoom && (
          <TouchableOpacity
            onPress={() => handleExitRoom(activeRoom)}
            style={styles.leaveRoomButton}
          >
            <Ionicons name="log-out-outline" size={14} color={COLORS.status.error} />
            <Text style={styles.leaveRoomText}>Leave Room</Text>
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
          data={messages.filter(m => !blockedUsers.includes(m.sender_id))}
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
          <TouchableOpacity onPress={handleSend} disabled={!newMessage.trim() || sending} style={{ borderRadius: 20, overflow: 'hidden' }}>
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
    </>
  );

  const renderJoinView = () => {
    const filteredRooms = rooms.filter(room => {
      if (filterType === 'all') return true;
      return room.type === filterType;
    });

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.filterBar}>
          {['all', 'public', 'private'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterTab, filterType === type && styles.activeFilterTab]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[styles.filterTabText, filterType === type && styles.activeFilterTabText]}>
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loadingRooms ? (
          <ActivityIndicator size="large" color={COLORS.accent.cyan} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredRooms}
            renderItem={renderRoomItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No {filterType !== 'all' ? filterType : ''} rooms found.</Text>
            }
          />
        )}
      </View>
    );
  };

  const renderCreateView = () => (
    <ScrollView contentContainerStyle={styles.createContainer}>
      <Text style={styles.createTitle}>Create New Room</Text>
      <Text style={styles.createSubtitle}>Start your own community</Text>

      <View style={styles.createForm}>
        <Text style={styles.inputLabel}>Room Name</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="e.g. Lakers Nation"
          placeholderTextColor={COLORS.text.tertiary}
          value={newRoomName}
          onChangeText={setNewRoomName}
        />

        <Text style={styles.inputLabel}>Privacy Setting</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeOption, newRoomType === 'public' && styles.typeOptionActive]}
            onPress={() => setNewRoomType('public')}
          >
            <Ionicons name="people" size={18} color={newRoomType === 'public' ? COLORS.text.inverse : COLORS.text.secondary} />
            <Text style={[styles.typeText, newRoomType === 'public' && styles.typeTextActive]}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeOption, newRoomType === 'private' && styles.typeOptionActive]}
            onPress={() => setNewRoomType('private')}
          >
            <Ionicons name="lock-closed" size={18} color={newRoomType === 'private' ? COLORS.text.inverse : COLORS.text.secondary} />
            <Text style={[styles.typeText, newRoomType === 'private' && styles.typeTextActive]}>Private</Text>
          </TouchableOpacity>
        </View>

        {newRoomType === 'private' && (
          <>
            <Text style={styles.inputLabel}>Room Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Min 4 characters"
              placeholderTextColor={COLORS.text.tertiary}
              value={newRoomPassword}
              onChangeText={setNewRoomPassword}
              secureTextEntry
            />
          </>
        )}

        <TouchableOpacity onPress={handleCreateRoom} style={styles.createRoomSubmit}>
          <LinearGradient colors={['#00d4ff', '#2979ff']} style={styles.createRoomSubmitGradient}>
            <Text style={styles.confirmButtonText}>CREATE ROOM</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderTabs()}

      <View style={{ flex: 1 }}>
        {activeTab === 'join' ? renderJoinView()
          : activeTab === 'create' ? renderCreateView()
            : renderChatView()}
      </View>

      {/* Join Password Modal */}
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

      {/* Sponsor Room Modal */}
      <Modal visible={showSponsorModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sponsor This Room</Text>
            <Text style={styles.modalSubtitle}>Sponsorship Details</Text>

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
            <TextInput
              style={styles.modalInput}
              placeholder="Amount ($)"
              placeholderTextColor={COLORS.text.tertiary}
              value={sponsorAmount}
              onChangeText={setSponsorAmount}
              keyboardType="numeric"
            />
            <Text style={{ color: COLORS.accent.cyan, fontSize: 10, marginBottom: 10, textAlign: 'center' }}>
              Minimum $0.50 (Stripe requirement)
            </Text>


            <Text style={{ color: COLORS.text.secondary, fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
              Banner upload coming soon. Using placeholder.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowSponsorModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSponsorRoom} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Pay ${sponsorAmount || '25'}</Text>
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
      {/* Quick Moderation Modal */}
      <Modal visible={modModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: 30 }]}>
            <View style={styles.modHeader}>
              <UserAvatar
                size={60}
                profilePicture={selectedUserForMod?.avatar}
                fallbackName={selectedUserForMod?.name}
              />
              <View style={styles.modHeaderInfo}>
                <Text style={styles.modalTitle}>{selectedUserForMod?.name}</Text>
                <Text style={styles.modalSubtitle}>Moderation Actions</Text>
              </View>
              <TouchableOpacity onPress={() => setModModalVisible(false)} style={styles.closeModButton}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modActionGrid}>
              <TouchableOpacity
                style={styles.modActionItem}
                onPress={() => handleModAction('mute')}
                disabled={modLoading}
              >
                <View style={[styles.modIconContainer, { backgroundColor: '#f59e0b20' }]}>
                  <Ionicons name="mic-off" size={24} color="#f59e0b" />
                </View>
                <Text style={styles.modActionText}>Mute User</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modActionItem}
                onPress={() => handleModAction('kick')}
                disabled={modLoading}
              >
                <View style={[styles.modIconContainer, { backgroundColor: '#ef444420' }]}>
                  <Ionicons name="exit-outline" size={24} color="#ef4444" />
                </View>
                <Text style={styles.modActionText}>Kick Room</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modActionItem}
                onPress={() => handleModAction('ban')}
                disabled={modLoading}
              >
                <View style={[styles.modIconContainer, { backgroundColor: '#b91c1c20' }]}>
                  <Ionicons name="hammer" size={24} color="#b91c1c" />
                </View>
                <Text style={styles.modActionText}>Ban Server</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modActionItem}
                onPress={() => handleModAction('warn')}
                disabled={modLoading}
              >
                <View style={[styles.modIconContainer, { backgroundColor: '#3b82f620' }]}>
                  <Ionicons name="alert-circle" size={24} color="#3b82f6" />
                </View>
                <Text style={styles.modActionText}>Send Warn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modActionItem}
                onPress={() => handleModAction('unmute')}
                disabled={modLoading}
              >
                <View style={[styles.modIconContainer, { backgroundColor: '#10b98120' }]}>
                  <Ionicons name="mic" size={24} color="#10b981" />
                </View>
                <Text style={styles.modActionText}>Unmute User</Text>
              </TouchableOpacity>

              {user?.role === 'admin' && (
                <TouchableOpacity
                  style={styles.modActionItem}
                  onPress={() => handleModAction(selectedUserForMod?.role === 'moderator' ? 'removeMod' : 'makeMod')}
                  disabled={modLoading}
                >
                  <View style={[styles.modIconContainer, { backgroundColor: selectedUserForMod?.role === 'moderator' ? '#ef444420' : '#8b5cf620' }]}>
                    <Ionicons
                      name={selectedUserForMod?.role === 'moderator' ? "person-remove-outline" : "shield-checkmark-outline"}
                      size={24}
                      color={selectedUserForMod?.role === 'moderator' ? "#ef4444" : "#8b5cf6"}
                    />
                  </View>
                  <Text style={styles.modActionText}>
                    {selectedUserForMod?.role === 'moderator' ? 'Remove Mod' : 'Make Mod'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {modLoading && (
              <ActivityIndicator color="#38bdf8" style={{ marginTop: 20 }} />
            )}
          </View>
        </View>
      </Modal>

      {/* Warning Presets Modal */}
      <Modal visible={warningPresetsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modHeader}>
              <Ionicons name="alert-circle" size={32} color="#3b82f6" />
              <View style={styles.modHeaderInfo}>
                <Text style={styles.modalTitle}>Issue Warning</Text>
                <Text style={styles.modalSubtitle}>Select reason for {selectedUserForMod?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setWarningPresetsVisible(false)} style={styles.closeModButton}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {WARNING_PRESETS.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetItem}
                  onPress={() => handleSendPresetWarn(preset)}
                  disabled={modLoading}
                >
                  <Text style={styles.presetText}>{preset}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {modLoading && (
              <ActivityIndicator color="#38bdf8" style={{ marginTop: 20 }} />
            )}

            <TouchableOpacity
              style={[styles.cancelButton, { marginTop: 20, width: '100%' }]}
              onPress={() => setWarningPresetsVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  tabsContainer: {
    backgroundColor: COLORS.background.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.tertiary,
    paddingVertical: 8,
  },
  tabsScrollContent: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.accent.cyan,
    borderColor: COLORS.accent.cyan,
  },
  tabText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  activeTabText: {
    color: COLORS.text.inverse,
  },
  closeTabIcon: {
    marginLeft: 4,
    padding: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: BORDER_RADIUS.full,
  },
  filterBar: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: 10,
    backgroundColor: COLORS.background.surface,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.tertiary,
  },
  activeFilterTab: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: COLORS.accent.cyan,
  },
  filterTabText: {
    color: COLORS.text.secondary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.black,
  },
  activeFilterTabText: {
    color: COLORS.accent.cyan,
  },
  createContainer: {
    padding: SPACING.xl,
    paddingBottom: 40,
  },
  createTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  createSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  createForm: {
    backgroundColor: COLORS.background.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.tertiary,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.tertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  createRoomSubmit: {
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  createRoomSubmitGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
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
  messageOuterContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-end',
    gap: 8,
  },
  myOuterContainer: {
    justifyContent: 'flex-end',
  },
  theirOuterContainer: {
    justifyContent: 'flex-start',
  },
  chatAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'visible',
  },
  chatAvatar: {
    width: '100%',
    height: '100%',
  },
  chatAvatarPlaceholder: {
    backgroundColor: COLORS.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.tertiary,
  },
  chatAvatarText: {
    color: COLORS.text.secondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageContainer: {
    maxWidth: '75%',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
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
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  roleBadge: {
    fontSize: 14,
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
  emptyText: {
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: 20,
  },
  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: COLORS.background.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.tertiary,
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: COLORS.text.primary,
    fontSize: 16,
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
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: -10,
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
    gap: 4,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    gap: 6,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  leaveRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    marginTop: SPACING.xs,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  leaveRoomText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.status.error,
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
  // Quick Mod Styles
  modHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  modHeaderInfo: {
    marginLeft: 15,
    flex: 1,
  },
  closeModButton: {
    padding: 5,
  },
  modActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  modActionItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Warning Preset Styles
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  presetText: {
    color: '#cbd5e1',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  systemMessageContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginVertical: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    alignSelf: 'center',
    maxWidth: '90%',
  },
  systemMessageText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  }
});

export default ChatScreen;
