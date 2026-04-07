import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Image, Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import type { MatchCandidate } from '@agar/shared';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;

interface SwipeCardProps {
  candidate: MatchCandidate;
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
}

export function SwipeCard({ candidate, onLike, onPass, onSuperLike }: SwipeCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: candidate.primaryPhotoUrl || 'https://via.placeholder.com/400x600' }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Gradient overlay */}
        <View style={styles.gradient} />

        {/* Compatibility badge */}
        <View style={styles.compatBadge}>
          <Text style={styles.compatScore}>
            {Math.round(candidate.compatibilityScore)}%
          </Text>
          <Text style={styles.compatLabel}>
            {t('discovery.compatibility', { score: Math.round(candidate.compatibilityScore) }).split('%')[0]}
          </Text>
        </View>
      </View>

      {/* Info overlay */}
      <View style={styles.infoOverlay}>
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

        {/* Interest tags */}
        <View style={styles.interests}>
          {candidate.interests.slice(0, 4).map((interest, i) => (
            <View key={i} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.passBtn]} onPress={onPass}>
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.superLikeBtn]} onPress={onSuperLike}>
          <Text style={styles.actionIcon}>★</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={onLike}>
          <Text style={styles.actionIcon}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DiscoveryScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'self' | 'referral'>('self');

  // Placeholder candidate
  const mockCandidate: MatchCandidate = {
    userId: '1',
    displayName: 'Hanna',
    age: 26,
    primaryPhotoUrl: '',
    photos: [],
    bio: 'Coffee lover, bookworm, and stargazer',
    interests: ['Coffee', 'Reading', 'Hiking', 'Photography'],
    compatibilityScore: 87,
    compatibilityHighlights: ['Sun signs in harmony', 'Strong Venus-Mars chemistry'],
    isOnline: true,
    mode: 'self',
  };

  return (
    <View style={styles.screen}>
      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'self' && styles.modeBtnActive]}
          onPress={() => setMode('self')}
        >
          <Text style={[styles.modeBtnText, mode === 'self' && styles.modeBtnTextActive]}>
            {t('discovery.selfMatch')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'referral' && styles.modeBtnActive]}
          onPress={() => setMode('referral')}
        >
          <Text style={[styles.modeBtnText, mode === 'referral' && styles.modeBtnTextActive]}>
            {t('discovery.referralMatch')}
          </Text>
        </TouchableOpacity>
      </View>

      <SwipeCard
        candidate={mockCandidate}
        onLike={() => {}}
        onPass={() => {}}
        onSuperLike={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f0f23',
    alignItems: 'center',
    paddingTop: 60,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  modeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: colors.primary[500],
  },
  modeBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: '#fff',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  compatBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(108, 92, 231, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  compatScore: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  compatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '500',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  age: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 22,
    fontWeight: '500',
  },
  bio: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 8,
  },
  highlights: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  highlightChip: {
    backgroundColor: 'rgba(108, 92, 231, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  highlightText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '500',
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  interestText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a2e',
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  passBtn: {
    backgroundColor: '#27272a',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  superLikeBtn: {
    backgroundColor: '#27272a',
    borderWidth: 2,
    borderColor: '#ffd93d',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  likeBtn: {
    backgroundColor: '#27272a',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  actionIcon: {
    fontSize: 24,
    color: '#fff',
  },
});
