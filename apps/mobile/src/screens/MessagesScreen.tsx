import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Conversation {
  id: string;
  matchId: string;
  partnerName: string;
  partnerInitial: string;
  avatarColor: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  compatibilityScore: number;
  online?: boolean;
}

interface MessagesScreenProps {
  onOpenChat?: (matchId: string) => void;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    matchId: 'match-001',
    partnerName: 'Hanna',
    partnerInitial: 'H',
    avatarColor: '#a78bfa',
    lastMessage: "That's so funny \u{1F602}",
    timestamp: '2m ago',
    unreadCount: 2,
    compatibilityScore: 87,
  },
  {
    id: '2',
    matchId: 'match-002',
    partnerName: 'Sara',
    partnerInitial: 'S',
    avatarColor: '#f472b6',
    lastMessage: 'Would love to grab coffee',
    timestamp: '1h ago',
    unreadCount: 0,
    compatibilityScore: 92,
  },
  {
    id: '3',
    matchId: 'match-003',
    partnerName: 'Meron',
    partnerInitial: 'M',
    avatarColor: '#34d399',
    lastMessage: "You sent a gift \u{1F339}",
    timestamp: '3h ago',
    unreadCount: 1,
    compatibilityScore: 78,
  },
  {
    id: '4',
    matchId: 'match-004',
    partnerName: 'Liya',
    partnerInitial: 'L',
    avatarColor: '#60a5fa',
    lastMessage: 'See you tomorrow!',
    timestamp: 'Yesterday',
    unreadCount: 0,
    compatibilityScore: 85,
  },
  {
    id: '5',
    matchId: 'match-005',
    partnerName: 'Bethlehem',
    partnerInitial: 'B',
    avatarColor: '#fbbf24',
    lastMessage: 'Thanks for the match!',
    timestamp: '2d ago',
    unreadCount: 0,
    compatibilityScore: 71,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MessagesScreen({ onOpenChat }: MessagesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_CONVERSATIONS;
    const q = searchQuery.toLowerCase();
    return MOCK_CONVERSATIONS.filter((c) =>
      c.partnerName.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const renderConversation = useCallback(({ item }: ListRenderItemInfo<Conversation>) => {
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.conversationRow}
        activeOpacity={0.7}
        onPress={() => onOpenChat?.(item.matchId)}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarInitial}>{item.partnerInitial}</Text>
          {item.online && <View style={styles.onlineIndicator} />}
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.topRow}>
            <Text
              style={[styles.partnerName, hasUnread && styles.partnerNameUnread]}
              numberOfLines={1}
            >
              {item.partnerName}
            </Text>
            <Text style={[styles.timestamp, hasUnread && styles.timestampUnread]}>
              {item.timestamp}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>

            <View style={styles.badges}>
              {/* Compatibility score */}
              <View style={styles.compatBadge}>
                <Text style={styles.compatText}>{item.compatibilityScore}%</Text>
              </View>

              {/* Unread badge */}
              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [onOpenChat]);

  const renderSeparator = useCallback(() => <View style={styles.separator} />, []);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{"💬"}</Text>
      <Text style={styles.emptyTitle}>No matches yet</Text>
      <Text style={styles.emptySubtitle}>
        Start discovering people to get your first match and begin a conversation.
      </Text>
    </View>
  ), []);

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.header}>Messages</Text>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>{"🔍"}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>{"✕"}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Conversation list */}
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            filteredConversations.length === 0
              ? styles.listEmptyContent
              : styles.listContent
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const AVATAR_SIZE = 52;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    letterSpacing: -0.6,
    color: colors.text,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.08)',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textMuted,
    paddingLeft: 8,
  },

  // List
  listContent: {
    paddingBottom: 100,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // Conversation row
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  // Avatar
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarInitial: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },

  // Content
  conversationContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 16,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  partnerNameUnread: {
    fontFamily: fontFamily.bodyBold,
    color: colors.textWhite,
  },
  timestamp: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  timestampUnread: {
    color: colors.gold,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
    marginRight: 10,
  },
  lastMessageUnread: {
    color: 'rgba(232,221,208,0.7)',
  },

  // Badges
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compatBadge: {
    backgroundColor: 'rgba(212,165,74,0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.25)',
  },
  compatText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 11,
    color: colors.gold,
  },
  unreadBadge: {
    backgroundColor: colors.gold,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.background,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: 'rgba(232,221,208,0.06)',
    marginLeft: 20 + AVATAR_SIZE + 14,
    marginRight: 20,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
