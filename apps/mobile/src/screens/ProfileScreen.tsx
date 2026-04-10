import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { useProfileStore } from '../store/profile-store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INTERESTS = [
  'Cooking', 'Fitness', 'Yoga', 'Meditation', 'Reading', 'Photography',
  'Travel', 'Hiking', 'Dancing', 'Coffee', 'Wine', 'Movies',
  'Gaming', 'Music', 'Art', 'Sports', 'Tech', 'Fashion',
  'Pets', 'Volunteering', 'Languages', 'Astronomy', 'Writing', 'Running',
  'Swimming', 'Camping', 'Gardening', 'Board Games', 'Ethiopian Food', 'Traditional Music',
];

interface ProfileScreenProps {
  onLogout?: () => void;
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const { firstName: storedName, primaryPhoto, photos: storedPhotos } = useProfileStore();
  const [displayName, setDisplayName] = useState(storedName || 'Dawit');
  const [bio, setBio] = useState('Coffee lover and stargazer. Looking for someone to explore the cosmos with.');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Coffee', 'Astronomy', 'Hiking', 'Photography', 'Ethiopian Food',
  ]);
  const [isEditing, setIsEditing] = useState(false);

  const mockProfile = {
    firstName: storedName || 'Dawit',
    age: 28,
    location: 'Addis Ababa, Ethiopia',
    gender: 'Male',
    lookingFor: 'Women',
    sunSign: 'Leo',
    sunSignEmoji: '♌',
    chineseZodiac: 'Dragon',
    chineseEmoji: '🐉',
    palmReading: true,
    joinedDate: 'March 2026',
    photos: [
      ...storedPhotos,
      ...Array(Math.max(0, 6 - storedPhotos.length)).fill(null),
    ] as (string | null)[],
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 10
          ? [...prev, interest]
          : prev
    );
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Profile Updated', 'Your changes have been saved.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
            <Text style={styles.editBtn}>{isEditing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {primaryPhoto ? (
              <Image source={{ uri: primaryPhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{mockProfile.firstName[0]}</Text>
              </View>
            )}
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.profileName}>{mockProfile.firstName}, {mockProfile.age}</Text>
          <Text style={styles.profileLocation}>{mockProfile.location}</Text>
          <View style={styles.profileBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{mockProfile.sunSignEmoji} {mockProfile.sunSign}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{mockProfile.chineseEmoji} {mockProfile.chineseZodiac}</Text>
            </View>
            {mockProfile.palmReading && (
              <View style={[styles.badge, styles.badgeGold]}>
                <Text style={styles.badgeTextGold}>🤚 Palm Read</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {isEditing ? (
            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={500}
              placeholder="Tell people about yourself..."
              placeholderTextColor={colors.textMuted}
            />
          ) : (
            <Text style={styles.bioText}>{bio}</Text>
          )}
          {isEditing && (
            <Text style={styles.charCount}>{bio.length}/500</Text>
          )}
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.photoGrid}>
            {mockProfile.photos.map((photo, i) => (
              <TouchableOpacity key={i} style={[styles.photoSlot, photo && styles.photoSlotFilled]} activeOpacity={0.7}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlus}>+</Text>
                    <Text style={styles.photoLabel}>{i < 3 ? 'Required' : 'Optional'}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Astrology & Compatibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Astrology Profile</Text>
          <View style={styles.astroCards}>
            <View style={styles.astroCard}>
              <Text style={styles.astroEmoji}>{mockProfile.sunSignEmoji}</Text>
              <Text style={styles.astroLabel}>Western</Text>
              <Text style={styles.astroValue}>{mockProfile.sunSign}</Text>
              <Text style={styles.astroSub}>Fire Sign</Text>
            </View>
            <View style={styles.astroCard}>
              <Text style={styles.astroEmoji}>{mockProfile.chineseEmoji}</Text>
              <Text style={styles.astroLabel}>Chinese</Text>
              <Text style={styles.astroValue}>{mockProfile.chineseZodiac}</Text>
              <Text style={styles.astroSub}>Wood Element</Text>
            </View>
            <View style={styles.astroCard}>
              <Text style={styles.astroEmoji}>🤚</Text>
              <Text style={styles.astroLabel}>Palmistry</Text>
              <Text style={styles.astroValue}>Complete</Text>
              <Text style={styles.astroSub}>4 lines read</Text>
            </View>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <Text style={styles.sectionCount}>{selectedInterests.length}/10</Text>
          </View>
          <View style={styles.interestsWrap}>
            {(isEditing ? INTERESTS : selectedInterests).map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  style={[styles.interestChip, isSelected && styles.interestChipSelected]}
                  onPress={() => isEditing && toggleInterest(interest)}
                  activeOpacity={isEditing ? 0.7 : 1}
                >
                  <Text style={[styles.interestText, isSelected && styles.interestTextSelected]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.prefList}>
            <PrefRow label="Gender" value={mockProfile.gender} />
            <PrefRow label="Looking for" value={mockProfile.lookingFor} />
            <PrefRow label="Age range" value="22 — 35" />
            <PrefRow label="Distance" value="Within 50 km" />
            <PrefRow label="Joined" value={mockProfile.joinedDate} />
          </View>
        </View>

        {/* Account actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PrefRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.prefRow}>
      <Text style={styles.prefLabel}>{label}</Text>
      <Text style={styles.prefValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    color: '#faf5eb',
  },
  editBtn: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 15,
    color: colors.gold,
  },

  // Profile card
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.1)',
    marginBottom: 20,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(212,165,74,0.15)',
    borderWidth: 2,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  avatarText: {
    fontFamily: fontFamily.displayExtrabold,
    fontSize: 36,
    color: colors.gold,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  profileName: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: '#faf5eb',
    marginBottom: 4,
  },
  profileLocation: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(232,221,208,0.06)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.1)',
  },
  badgeGold: {
    borderColor: 'rgba(212,165,74,0.25)',
    backgroundColor: 'rgba(212,165,74,0.08)',
  },
  badgeText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: 'rgba(232,221,208,0.6)',
  },
  badgeTextGold: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: colors.gold,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 14,
    color: colors.goldLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  sectionCount: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },

  // Bio
  bioText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: 'rgba(232,221,208,0.7)',
    lineHeight: 22,
  },
  bioInput: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.1)',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },

  // Photos
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoSlot: {
    width: (SCREEN_WIDTH - 48 - 20) / 3,
    aspectRatio: 3 / 4,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(232,221,208,0.1)',
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
  },
  photoSlotFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(212,165,74,0.2)',
    borderWidth: 1,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  photoPlus: {
    fontSize: 24,
    color: colors.goldLight,
    fontWeight: '300',
  },
  photoLabel: {
    fontFamily: fontFamily.body,
    fontSize: 9,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Astrology
  astroCards: {
    flexDirection: 'row',
    gap: 10,
  },
  astroCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.1)',
    gap: 4,
  },
  astroEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  astroLabel: {
    fontFamily: fontFamily.body,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  astroValue: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 14,
    color: colors.goldLight,
  },
  astroSub: {
    fontFamily: fontFamily.body,
    fontSize: 11,
    color: colors.textMuted,
  },

  // Interests
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.08)',
  },
  interestChipSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,165,74,0.1)',
  },
  interestText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  interestTextSelected: {
    fontFamily: fontFamily.bodyMedium,
    color: colors.goldLight,
  },

  // Preferences
  prefList: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.06)',
    overflow: 'hidden',
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,221,208,0.05)',
  },
  prefLabel: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  prefValue: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },

  // Logout
  logoutBtn: {
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 15,
    color: '#ef4444',
  },
});
