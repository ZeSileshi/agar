import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { usePointsStore } from '../store/points-store';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatScreenProps {
  matchId: string;
  partnerName: string;
  onBack: () => void;
}

type MessageType = 'sent' | 'received' | 'gift';

interface Message {
  id: string;
  type: MessageType;
  text: string;
  timestamp: number;
  read?: boolean;
  giftEmoji?: string;
  giftLabel?: string;
}

interface Gift {
  emoji: string;
  label: string;
  points: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GIFTS: Gift[] = [
  { emoji: '\u{1F339}', label: 'Rose', points: 10 },
  { emoji: '\u2615', label: 'Coffee', points: 15 },
  { emoji: '\u{1F320}', label: 'Star', points: 20 },
  { emoji: '\u{1F48C}', label: 'Letter', points: 30 },
  { emoji: '\u{1F48B}', label: 'Kiss', points: 40 },
  { emoji: '\u{1F48E}', label: 'Diamond', points: 100 },
];

const now = Date.now();
const min = 60_000;

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'received',
    text: 'Hey! I saw we matched. Your profile is really interesting.',
    timestamp: now - 45 * min,
  },
  {
    id: '2',
    type: 'sent',
    text: 'Hi! Thanks so much, yours too. I loved the photo from Lalibela.',
    timestamp: now - 43 * min,
    read: true,
  },
  {
    id: '3',
    type: 'received',
    text: 'That was an incredible trip! Have you been?',
    timestamp: now - 40 * min,
  },
  {
    id: '4',
    type: 'sent',
    text: "Not yet, but it's at the top of my list. The rock-hewn churches look stunning.",
    timestamp: now - 38 * min,
    read: true,
  },
  {
    id: '5',
    type: 'gift',
    text: 'sent a gift',
    giftEmoji: '\u2615',
    giftLabel: 'Coffee',
    timestamp: now - 30 * min,
  },
  {
    id: '6',
    type: 'received',
    text: 'Aww thanks for the coffee! That made my day.',
    timestamp: now - 28 * min,
  },
  {
    id: '7',
    type: 'sent',
    text: "Of course! Maybe we can grab a real one sometime?",
    timestamp: now - 25 * min,
    read: true,
  },
  {
    id: '8',
    type: 'received',
    text: "I'd love that! How about this weekend?",
    timestamp: now - 5 * min,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function shouldShowTimestamp(cur: Message, prev: Message | undefined): boolean {
  if (!prev) return true;
  return cur.timestamp - prev.timestamp > 10 * min;
}

let idCounter = 100;
function nextId(): string {
  idCounter += 1;
  return String(idCounter);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ChatScreen({ matchId: _matchId, partnerName, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [giftSheetOpen, setGiftSheetOpen] = useState(false);
  const { balance: pointsBalance, spendPoints } = usePointsStore();
  const flatListRef = useRef<FlatList<Message>>(null);

  /* ---- actions ---- */

  const sendMessage = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const msg: Message = {
      id: nextId(),
      type: 'sent',
      text: trimmed,
      timestamp: Date.now(),
      read: false,
    };
    setMessages((prev) => [...prev, msg]);
    setInputText('');
  }, [inputText]);

  const sendGift = useCallback(
    (gift: Gift) => {
      const spent = spendPoints(gift.points);
      if (!spent) return;
      const msg: Message = {
        id: nextId(),
        type: 'gift',
        text: 'sent a gift',
        giftEmoji: gift.emoji,
        giftLabel: gift.label,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
      setGiftSheetOpen(false);
    },
    [pointsBalance],
  );

  /* ---- reversed data for inverted FlatList ---- */
  const reversedMessages = [...messages].reverse();

  /* ---- render helpers ---- */

  const renderMessage = useCallback(
    ({ item, index }: ListRenderItemInfo<Message>) => {
      // The data fed to FlatList is already reversed (reversedMessages).
      // In inverted mode, index 0 is the bottom-most (newest) message.
      // The "previous" message visually above is at index + 1.
      const prevMsg = index < reversedMessages.length - 1 ? reversedMessages[index + 1] : undefined;
      const showTime = shouldShowTimestamp(item, prevMsg);

      return (
        <View>
          {showTime && (
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          )}
          {item.type === 'gift' ? (
            <View style={styles.giftBubble}>
              <Text style={styles.giftEmoji}>{item.giftEmoji}</Text>
              <Text style={styles.giftText}>
                {item.giftLabel} {'\u2014'} {item.text}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.messageBubble,
                item.type === 'sent' ? styles.sentBubble : styles.receivedBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.type === 'sent' ? styles.sentText : styles.receivedText,
                ]}
              >
                {item.text}
              </Text>
              {item.type === 'sent' && (
                <Text style={styles.readReceipt}>
                  {item.read ? '\u2713\u2713' : '\u2713'}
                </Text>
              )}
            </View>
          )}
        </View>
      );
    },
    [reversedMessages],
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  /* ---- render ---- */

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ---- Header ---- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityLabel="Go back">
            <Text style={styles.backArrow}>{'\u2190'}</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerName} numberOfLines={1}>
              {partnerName}
            </Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineLabel}>Online</Text>
            </View>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* ---- Messages ---- */}
        <FlatList
          ref={flatListRef}
          data={reversedMessages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          inverted
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {/* ---- Input bar ---- */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.giftButton}
            onPress={() => setGiftSheetOpen(true)}
            accessibilityLabel="Send a gift"
          >
            <Text style={styles.giftButtonIcon}>{'\u{1F381}'}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
            accessibilityLabel="Send message"
          >
            <Text style={styles.sendIcon}>{'\u2191'}</Text>
          </TouchableOpacity>
        </View>

        {/* ---- Gift Bottom Sheet ---- */}
        <Modal
          visible={giftSheetOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setGiftSheetOpen(false)}
        >
          <TouchableOpacity
            style={styles.sheetOverlay}
            activeOpacity={1}
            onPress={() => setGiftSheetOpen(false)}
          >
            <View
              style={styles.sheetContainer}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Send a Gift</Text>
              <Text style={styles.sheetBalance}>
                {'\u2B50'} {pointsBalance} pts available
              </Text>
              <View style={styles.giftGrid}>
                {GIFTS.map((gift) => {
                  const canAfford = pointsBalance >= gift.points;
                  return (
                    <TouchableOpacity
                      key={gift.label}
                      style={[styles.giftCard, !canAfford && styles.giftCardDisabled]}
                      onPress={() => sendGift(gift)}
                      disabled={!canAfford}
                      accessibilityLabel={`Send ${gift.label} for ${gift.points} points`}
                    >
                      <Text style={styles.giftCardEmoji}>{gift.emoji}</Text>
                      <Text style={styles.giftCardLabel}>{gift.label}</Text>
                      <Text style={styles.giftCardPoints}>{gift.points} pts</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const GOLD_TINT = 'rgba(212,165,74,0.18)';
const GOLD_BORDER = 'rgba(212,165,74,0.45)';

const styles = StyleSheet.create({
  /* layout */
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },

  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,165,74,0.15)',
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: colors.gold,
    fontFamily: fontFamily.bodySemibold,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    fontSize: 18,
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  onlineLabel: {
    fontSize: 12,
    color: colors.success,
    fontFamily: fontFamily.body,
  },
  headerSpacer: {
    width: 40,
  },

  /* messages */
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timestamp: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    marginVertical: 12,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 3,
  },
  sentBubble: {
    alignSelf: 'flex-end',
    backgroundColor: GOLD_TINT,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderBottomRightRadius: 6,
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fontFamily.body,
  },
  sentText: {
    color: colors.goldLight,
  },
  receivedText: {
    color: colors.text,
  },
  readReceipt: {
    fontSize: 11,
    color: colors.gold,
    textAlign: 'right',
    marginTop: 4,
    fontFamily: fontFamily.bodyMedium,
  },

  /* gift message bubble */
  giftBubble: {
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,165,74,0.08)',
    marginVertical: 10,
  },
  giftEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  giftText: {
    fontSize: 13,
    color: colors.gold,
    fontFamily: fontFamily.bodySemibold,
  },

  /* input bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,165,74,0.15)',
    backgroundColor: colors.surface,
  },
  giftButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  giftButtonIcon: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: colors.text,
    fontFamily: fontFamily.body,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  sendIcon: {
    fontSize: 20,
    color: colors.background,
    fontFamily: fontFamily.bodySemibold,
  },

  /* gift bottom sheet */
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    color: colors.text,
    fontFamily: fontFamily.displayBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetBalance: {
    fontSize: 14,
    color: colors.gold,
    fontFamily: fontFamily.bodySemibold,
    textAlign: 'center',
    marginBottom: 20,
  },
  giftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  giftCard: {
    width: '30%',
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
  },
  giftCardDisabled: {
    opacity: 0.35,
  },
  giftCardEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  giftCardLabel: {
    fontSize: 13,
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    marginBottom: 2,
  },
  giftCardPoints: {
    fontSize: 11,
    color: colors.gold,
    fontFamily: fontFamily.bodyMedium,
  },
});
