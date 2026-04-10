import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { usePointsStore } from '../store/points-store';
import type { MatchCandidate } from '@agar/shared';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.58;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const DAILY_LIMIT = 10;
const UNLOCK_COUNT = 15;
const UNLOCK_COST = 10;

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_CANDIDATES: MatchCandidate[] = [
  {
    userId: '1', displayName: 'Hanna', age: 26, primaryPhotoUrl: '',
    photos: [], bio: 'Coffee lover, bookworm, and stargazer',
    interests: ['Coffee', 'Reading', 'Hiking', 'Photography'],
    compatibilityScore: 87,
    compatibilityHighlights: ['Sun signs in harmony', 'Strong Venus-Mars chemistry'],
    isOnline: true, mode: 'self',
  },
  {
    userId: '2', displayName: 'Sara', age: 24, primaryPhotoUrl: '',
    photos: [], bio: 'Adventure seeker with a love for Ethiopian cuisine',
    interests: ['Travel', 'Ethiopian Food', 'Dancing', 'Music'],
    compatibilityScore: 92,
    compatibilityHighlights: ['Perfect element match', 'Shared moon energy'],
    isOnline: true, mode: 'self',
  },
  {
    userId: '3', displayName: 'Meron', age: 27, primaryPhotoUrl: '',
    photos: [], bio: 'Tech by day, traditional music by night',
    interests: ['Tech', 'Traditional Music', 'Coffee', 'Yoga'],
    compatibilityScore: 78,
    compatibilityHighlights: ['Complementary energies', 'Growth potential'],
    isOnline: false, mode: 'self',
  },
  {
    userId: '4', displayName: 'Liya', age: 25, primaryPhotoUrl: '',
    photos: [], bio: 'Photographer and dreamer. Show me your world.',
    interests: ['Photography', 'Art', 'Travel', 'Writing'],
    compatibilityScore: 85,
    compatibilityHighlights: ['Creative souls aligned', 'Venus trine Venus'],
    isOnline: true, mode: 'self',
  },
  {
    userId: '5', displayName: 'Bethlehem', age: 28, primaryPhotoUrl: '',
    photos: [], bio: 'Looking for genuine connection, not just swipes',
    interests: ['Meditation', 'Hiking', 'Languages', 'Cooking'],
    compatibilityScore: 71,
    compatibilityHighlights: ['Grounding presence', 'Earth sign harmony'],
    isOnline: false, mode: 'self',
  },
  {
    userId: '6', displayName: 'Tigist', age: 23, primaryPhotoUrl: '',
    photos: [], bio: 'Fitness enthusiast and coffee addict',
    interests: ['Fitness', 'Coffee', 'Running', 'Movies'],
    compatibilityScore: 83,
    compatibilityHighlights: ['Fire signs unite', 'Active lifestyle match'],
    isOnline: true, mode: 'self',
  },
  {
    userId: '7', displayName: 'Selam', age: 26, primaryPhotoUrl: '',
    photos: [], bio: 'Astronomy nerd who loves deep conversations',
    interests: ['Astronomy', 'Reading', 'Wine', 'Board Games'],
    compatibilityScore: 90,
    compatibilityHighlights: ['Intellectual equals', 'Mercury conjunction'],
    isOnline: true, mode: 'self',
  },
  {
    userId: '8', displayName: 'Kidist', age: 29, primaryPhotoUrl: '',
    photos: [], bio: 'World traveler. 32 countries and counting.',
    interests: ['Travel', 'Photography', 'Languages', 'Swimming'],
    compatibilityScore: 76,
    compatibilityHighlights: ['Wanderlust connection', 'Jupiter blessing'],
    isOnline: false, mode: 'self',
  },
  {
    userId: '9', displayName: 'Rahel', age: 25, primaryPhotoUrl: '',
    photos: [], bio: 'Simple soul. Good food, good company, good vibes.',
    interests: ['Cooking', 'Ethiopian Food', 'Gardening', 'Pets'],
    compatibilityScore: 88,
    compatibilityHighlights: ['Domestic harmony', 'Moon trine Moon'],
    isOnline: true, mode: 'self',
  },
  {
    userId: '10', displayName: 'Yordanos', age: 27, primaryPhotoUrl: '',
    photos: [], bio: 'Artist, dancer, and eternal optimist',
    interests: ['Art', 'Dancing', 'Music', 'Volunteering'],
    compatibilityScore: 81,
    compatibilityHighlights: ['Creative spark', 'Venus in harmony'],
    isOnline: true, mode: 'self',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function DiscoveryScreen() {
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyViewed, setDailyViewed] = useState(0);
  const [dailyCap, setDailyCap] = useState(DAILY_LIMIT);
  const { balance: points, spendPoints } = usePointsStore();
  const [matchModal, setMatchModal] = useState<MatchCandidate | null>(null);
  const [mode, setMode] = useState<'self' | 'referral'>('self');

  const position = useRef(new Animated.ValueXY()).current;

  const isLimitReached = dailyViewed >= dailyCap;
  const currentCandidate = candidates[currentIndex];
  const remaining = dailyCap - dailyViewed;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeOut('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeOut('left');
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          swipeOut('up');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 5,
          }).start();
        }
      },
    }),
  ).current;

  const swipeOut = (direction: 'left' | 'right' | 'up') => {
    const x = direction === 'left' ? -SCREEN_WIDTH * 1.5 : direction === 'right' ? SCREEN_WIDTH * 1.5 : 0;
    const y = direction === 'up' ? -SCREEN_HEIGHT : 0;

    Animated.timing(position, {
      toValue: { x, y },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      const action = direction === 'left' ? 'pass' : direction === 'right' ? 'like' : 'super_like';
      handleSwipeAction(action);
    });
  };

  const handleSwipeAction = (action: 'like' | 'pass' | 'super_like') => {
    const candidate = candidates[currentIndex];

    // Simulate match on like/super_like with 30% chance
    if ((action === 'like' || action === 'super_like') && candidate && Math.random() < 0.3) {
      setMatchModal(candidate);
    }

    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
    setDailyViewed((prev) => prev + 1);
  };

  const handleUnlock = () => {
    const spent = spendPoints(UNLOCK_COST);
    if (!spent) {
      Alert.alert('Not enough points', `You need ${UNLOCK_COST} points to unlock more profiles. Visit the Shop to buy points.`);
      return;
    }
    setDailyCap((prev) => prev + UNLOCK_COUNT);
    Alert.alert('Unlocked!', `${UNLOCK_COUNT} more profiles unlocked for today.`);
  };

  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH * 0.25],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.25, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const superLikeOpacity = position.y.interpolate({
    inputRange: [-SCREEN_HEIGHT * 0.15, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  /* ---- Daily limit reached ---- */
  if (isLimitReached || !currentCandidate) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.limitContainer}>
          <Text style={styles.limitEmoji}>✦</Text>
          <Text style={styles.limitTitle}>
            {isLimitReached ? "You've seen today's matches" : 'No more profiles'}
          </Text>
          <Text style={styles.limitSubtitle}>
            {isLimitReached
              ? `You've viewed all ${dailyCap} profiles for today. Unlock more or come back tomorrow.`
              : 'Check back later for new matches.'}
          </Text>

          {isLimitReached && (
            <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock} activeOpacity={0.8}>
              <Text style={styles.unlockBtnText}>
                Unlock {UNLOCK_COUNT} more — {UNLOCK_COST} pts
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.limitStats}>
            <View style={styles.limitStat}>
              <Text style={styles.limitStatValue}>{dailyViewed}</Text>
              <Text style={styles.limitStatLabel}>Viewed today</Text>
            </View>
            <View style={styles.limitStatDivider} />
            <View style={styles.limitStat}>
              <Text style={styles.limitStatValue}>{points}</Text>
              <Text style={styles.limitStatLabel}>Points</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ---- Main discovery view ---- */
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'self' && styles.modeBtnActive]}
            onPress={() => setMode('self')}
          >
            <Text style={[styles.modeBtnText, mode === 'self' && styles.modeBtnTextActive]}>
              For You
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'referral' && styles.modeBtnActive]}
            onPress={() => setMode('referral')}
          >
            <Text style={[styles.modeBtnText, mode === 'referral' && styles.modeBtnTextActive]}>
              Referrals
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{remaining} left</Text>
        </View>
      </View>

      {/* Card stack */}
      <View style={styles.cardStack}>
        {/* Next card (behind) */}
        {candidates[currentIndex + 1] && (
          <View style={[styles.card, styles.cardBehind]}>
            <CardContent candidate={candidates[currentIndex + 1]!} />
          </View>
        )}

        {/* Current card (swipable) */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate: rotation },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Swipe labels */}
          <Animated.View style={[styles.swipeLabel, styles.swipeLabelLike, { opacity: likeOpacity }]}>
            <Text style={styles.swipeLabelText}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[styles.swipeLabel, styles.swipeLabelPass, { opacity: passOpacity }]}>
            <Text style={[styles.swipeLabelText, styles.swipeLabelPassText]}>PASS</Text>
          </Animated.View>
          <Animated.View style={[styles.swipeLabel, styles.swipeLabelSuper, { opacity: superLikeOpacity }]}>
            <Text style={[styles.swipeLabelText, styles.swipeLabelSuperText]}>SUPER LIKE</Text>
          </Animated.View>

          <CardContent candidate={currentCandidate} />
        </Animated.View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.passBtn]}
          onPress={() => swipeOut('left')}
        >
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.superLikeBtn]}
          onPress={() => swipeOut('up')}
        >
          <Text style={styles.actionIconStar}>★</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn]}
          onPress={() => swipeOut('right')}
        >
          <Text style={styles.actionIconHeart}>♥</Text>
        </TouchableOpacity>
      </View>

      {/* Match modal */}
      <Modal visible={matchModal !== null} transparent animationType="fade">
        <View style={styles.matchOverlay}>
          <View style={styles.matchModal}>
            <Text style={styles.matchEmoji}>✦</Text>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>
              You and {matchModal?.displayName} liked each other
            </Text>
            <View style={styles.matchScore}>
              <Text style={styles.matchScoreValue}>{matchModal?.compatibilityScore}%</Text>
              <Text style={styles.matchScoreLabel}>Compatible</Text>
            </View>
            <TouchableOpacity
              style={styles.matchChatBtn}
              onPress={() => setMatchModal(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.matchChatBtnText}>Send a Message</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMatchModal(null)}>
              <Text style={styles.matchKeepText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/*  Card content                                                        */
/* ------------------------------------------------------------------ */

function CardContent({ candidate }: { candidate: MatchCandidate }) {
  return (
    <View style={styles.cardInner}>
      {/* Photo area with gradient */}
      <View style={styles.photoArea}>
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoInitial}>{candidate.displayName[0]}</Text>
        </View>

        {/* Compatibility badge */}
        <View style={styles.compatBadge}>
          <Text style={styles.compatScore}>{Math.round(candidate.compatibilityScore)}%</Text>
          <Text style={styles.compatLabel}>Match</Text>
        </View>

        {/* Online indicator */}
        {candidate.isOnline && <View style={styles.onlineBadge} />}
      </View>

      {/* Info section */}
      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{candidate.displayName}</Text>
          <Text style={styles.age}>{candidate.age}</Text>
        </View>

        {candidate.bio && (
          <Text style={styles.bio} numberOfLines={2}>{candidate.bio}</Text>
        )}

        {/* Compatibility highlights */}
        {candidate.compatibilityHighlights.length > 0 && (
          <View style={styles.highlights}>
            {candidate.compatibilityHighlights.slice(0, 2).map((h, i) => (
              <View key={i} style={styles.highlightChip}>
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Interests */}
        <View style={styles.interests}>
          {candidate.interests.slice(0, 4).map((interest, i) => (
            <View key={i} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 3,
  },
  modeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: colors.gold,
  },
  modeBtnText: {
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    fontSize: 13,
  },
  modeBtnTextActive: {
    fontFamily: fontFamily.bodySemibold,
    color: colors.background,
  },
  counterBadge: {
    backgroundColor: 'rgba(212,165,74,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.2)',
  },
  counterText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 12,
    color: colors.gold,
  },

  // Card stack
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.08)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardBehind: {
    transform: [{ scale: 0.95 }],
    opacity: 0.5,
  },
  cardInner: {
    flex: 1,
  },

  // Swipe labels
  swipeLabel: {
    position: 'absolute',
    top: 40,
    zIndex: 10,
    borderWidth: 3,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  swipeLabelLike: {
    left: 20,
    borderColor: colors.success,
  },
  swipeLabelPass: {
    right: 20,
    borderColor: colors.error,
  },
  swipeLabelSuper: {
    alignSelf: 'center',
    left: CARD_WIDTH / 2 - 60,
    borderColor: '#fbbf24',
  },
  swipeLabelText: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: colors.success,
    letterSpacing: 2,
  },
  swipeLabelPassText: {
    color: colors.error,
  },
  swipeLabelSuperText: {
    color: '#fbbf24',
    fontSize: 20,
  },

  // Card content
  photoArea: {
    flex: 1,
    backgroundColor: 'rgba(212,165,74,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212,165,74,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitial: {
    fontFamily: fontFamily.displayExtrabold,
    fontSize: 44,
    color: colors.gold,
  },
  compatBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(212,165,74,0.9)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  compatScore: {
    fontFamily: fontFamily.accentBold,
    color: colors.background,
    fontSize: 18,
  },
  compatLabel: {
    fontFamily: fontFamily.body,
    color: 'rgba(12,41,72,0.7)',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  onlineBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  infoSection: {
    padding: 16,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  name: {
    fontFamily: fontFamily.displayBold,
    color: '#faf5eb',
    fontSize: 24,
  },
  age: {
    fontFamily: fontFamily.body,
    color: 'rgba(232,221,208,0.6)',
    fontSize: 20,
  },
  bio: {
    fontFamily: fontFamily.body,
    color: 'rgba(232,221,208,0.5)',
    fontSize: 14,
    lineHeight: 20,
  },
  highlights: {
    flexDirection: 'row',
    gap: 6,
  },
  highlightChip: {
    backgroundColor: 'rgba(212,165,74,0.1)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.2)',
  },
  highlightText: {
    fontFamily: fontFamily.body,
    color: colors.gold,
    fontSize: 11,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestTag: {
    backgroundColor: 'rgba(232,221,208,0.08)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  interestText: {
    fontFamily: fontFamily.body,
    color: 'rgba(232,221,208,0.5)',
    fontSize: 12,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  passBtn: {
    borderColor: 'rgba(239,68,68,0.4)',
  },
  superLikeBtn: {
    borderColor: 'rgba(251,191,36,0.4)',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeBtn: {
    borderColor: 'rgba(16,185,129,0.4)',
  },
  actionIcon: {
    fontSize: 24,
    color: colors.error,
  },
  actionIconStar: {
    fontSize: 22,
    color: '#fbbf24',
  },
  actionIconHeart: {
    fontSize: 24,
    color: colors.success,
  },

  // Daily limit
  limitContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  limitEmoji: {
    fontSize: 48,
    color: colors.gold,
    marginBottom: 8,
  },
  limitTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: '#faf5eb',
    textAlign: 'center',
  },
  limitSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: 'rgba(232,221,208,0.4)',
    textAlign: 'center',
    lineHeight: 22,
  },
  unlockBtn: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  unlockBtnText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 15,
    color: colors.background,
  },
  limitStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 16,
  },
  limitStat: {
    alignItems: 'center',
  },
  limitStatValue: {
    fontFamily: fontFamily.accentBold,
    fontSize: 22,
    color: colors.goldLight,
  },
  limitStatLabel: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  limitStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(232,221,208,0.1)',
  },

  // Match modal
  matchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchModal: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: SCREEN_WIDTH - 64,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.2)',
  },
  matchEmoji: {
    fontSize: 48,
    color: colors.gold,
    marginBottom: 12,
  },
  matchTitle: {
    fontFamily: fontFamily.displayExtrabold,
    fontSize: 28,
    color: colors.gold,
    marginBottom: 4,
  },
  matchSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: 'rgba(232,221,208,0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  matchScore: {
    alignItems: 'center',
    marginBottom: 20,
  },
  matchScoreValue: {
    fontFamily: fontFamily.accentBold,
    fontSize: 36,
    color: colors.goldLight,
  },
  matchScoreLabel: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  matchChatBtn: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  matchChatBtnText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 16,
    color: colors.background,
  },
  matchKeepText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
