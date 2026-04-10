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
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { useProfileStore } from '../store/profile-store';
import { COUNTRIES, getCitiesForCountry } from '../data/locations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_PHOTO_SLOTS = 6;

const INTERESTS = [
  'Cooking', 'Fitness', 'Yoga', 'Meditation', 'Reading', 'Photography',
  'Travel', 'Hiking', 'Dancing', 'Coffee', 'Wine', 'Movies',
  'Gaming', 'Music', 'Art', 'Sports', 'Tech', 'Fashion',
  'Pets', 'Volunteering', 'Languages', 'Astronomy', 'Writing', 'Running',
  'Swimming', 'Camping', 'Gardening', 'Board Games', 'Ethiopian Food', 'Traditional Music',
];

type Gender = 'Male' | 'Female' | 'Non-binary';
type LookingFor = 'Men' | 'Women' | 'Everyone';

interface ProfileScreenProps {
  onLogout?: () => void;
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const { firstName: storedName, primaryPhoto, photos: storedPhotos, setPhotos } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('Coffee lover and stargazer. Looking for someone to explore the cosmos with.');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Coffee', 'Astronomy', 'Hiking', 'Photography', 'Ethiopian Food',
  ]);

  // Editable preferences
  const [gender, setGender] = useState<Gender>('Male');
  const [lookingFor, setLookingFor] = useState<LookingFor>('Women');
  const [ageMin, setAgeMin] = useState('22');
  const [ageMax, setAgeMax] = useState('35');

  // Match location preference
  const [matchCountryCode, setMatchCountryCode] = useState('');
  const [matchCity, setMatchCity] = useState('');
  const [distanceMiles, setDistanceMiles] = useState(50);

  // Modals
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showLookingForPicker, setShowLookingForPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const matchCountry = COUNTRIES.find((c) => c.code === matchCountryCode);
  const matchCities = matchCountryCode ? getCitiesForCountry(matchCountryCode) : [];

  // Build photo slots
  const photoSlots: (string | null)[] = [
    ...storedPhotos,
    ...Array(Math.max(0, TOTAL_PHOTO_SLOTS - storedPhotos.length)).fill(null),
  ];

  const profileName = storedName || 'User';

  /* ---- Photo picker ---- */
  const handlePhotoTap = async (index: number) => {
    if (!isEditing) return;

    const existing = photoSlots[index];

    if (existing) {
      Alert.alert('Photo Options', '', [
        { text: 'Replace', onPress: () => pickPhoto(index) },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = storedPhotos.filter((_, i) => i !== index);
            setPhotos(updated);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    await pickPhoto(index);
  };

  const pickPhoto = async (index: number) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }

    const emptySlots = photoSlots.slice(index).filter((p) => p === null).length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: emptySlots > 1,
      selectionLimit: emptySlots,
      allowsEditing: emptySlots <= 1,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newPhotos = [...photoSlots];
      let slotIdx = index;
      for (const asset of result.assets) {
        while (slotIdx < TOTAL_PHOTO_SLOTS && newPhotos[slotIdx] !== null) slotIdx++;
        if (slotIdx >= TOTAL_PHOTO_SLOTS) break;
        newPhotos[slotIdx] = asset.uri;
        slotIdx++;
      }
      setPhotos(newPhotos.filter((p): p is string => p !== null));
    }
  };

  /* ---- Interests ---- */
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 10
          ? [...prev, interest]
          : prev
    );
  };

  /* ---- Save ---- */
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
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => isEditing && pickPhoto(0)}
            activeOpacity={isEditing ? 0.7 : 1}
          >
            {primaryPhoto ? (
              <Image source={{ uri: primaryPhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profileName[0]}</Text>
              </View>
            )}
            {isEditing && (
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditIcon}>📷</Text>
              </View>
            )}
            <View style={styles.onlineDot} />
          </TouchableOpacity>
          <Text style={styles.profileName}>{profileName}, 28</Text>
          <Text style={styles.profileLocation}>
            {matchCountry ? `${matchCountry.flag} ${matchCity || matchCountry.name}` : 'Set your location'}
          </Text>
          <View style={styles.profileBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>♌ Leo</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🐉 Dragon</Text>
            </View>
            <View style={[styles.badge, styles.badgeGold]}>
              <Text style={styles.badgeTextGold}>🤚 Palm Read</Text>
            </View>
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
          {isEditing && <Text style={styles.charCount}>{bio.length}/500</Text>}
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos {isEditing && '(tap to change)'}</Text>
          <View style={styles.photoGrid}>
            {photoSlots.map((photo, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.photoSlot,
                  photo && styles.photoSlotFilled,
                  isEditing && styles.photoSlotEditing,
                ]}
                onPress={() => handlePhotoTap(i)}
                activeOpacity={isEditing ? 0.7 : 1}
              >
                {photo ? (
                  <>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    {isEditing && (
                      <View style={styles.photoEditOverlay}>
                        <Text style={styles.photoEditIcon}>✎</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlus}>{isEditing ? '+' : ''}</Text>
                    <Text style={styles.photoLabel}>{i < 3 ? 'Required' : 'Optional'}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Astrology */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Astrology Profile</Text>
          <View style={styles.astroCards}>
            <AstroCard emoji="♌" label="Western" value="Leo" sub="Fire Sign" />
            <AstroCard emoji="🐉" label="Chinese" value="Dragon" sub="Wood Element" />
            <AstroCard emoji="🤚" label="Palmistry" value="Complete" sub="4 lines read" />
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
            <EditablePrefRow
              label="Gender"
              value={gender}
              isEditing={isEditing}
              onPress={() => setShowGenderPicker(true)}
            />
            <EditablePrefRow
              label="Looking for"
              value={lookingFor}
              isEditing={isEditing}
              onPress={() => setShowLookingForPicker(true)}
            />
            {isEditing ? (
              <View style={styles.prefRow}>
                <Text style={styles.prefLabel}>Age range</Text>
                <View style={styles.ageInputRow}>
                  <TextInput
                    style={styles.ageInput}
                    value={ageMin}
                    onChangeText={(t) => setAgeMin(t.replace(/\D/g, '').slice(0, 2))}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={styles.ageDash}>—</Text>
                  <TextInput
                    style={styles.ageInput}
                    value={ageMax}
                    onChangeText={(t) => setAgeMax(t.replace(/\D/g, '').slice(0, 2))}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>
            ) : (
              <PrefRow label="Age range" value={`${ageMin} — ${ageMax}`} />
            )}
          </View>
        </View>

        {/* Match Location Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Location</Text>
          <Text style={styles.sectionSubtitle}>Find matches in a specific country or city</Text>
          <View style={styles.prefList}>
            <EditablePrefRow
              label="Country"
              value={matchCountry ? `${matchCountry.flag} ${matchCountry.name}` : 'Any country'}
              isEditing={isEditing}
              onPress={() => setShowCountryPicker(true)}
            />
            <EditablePrefRow
              label="City"
              value={matchCity || 'Any city'}
              isEditing={isEditing}
              onPress={() => {
                if (!matchCountryCode) {
                  Alert.alert('Select Country', 'Choose a country first.');
                  return;
                }
                setShowCityPicker(true);
              }}
            />
          </View>

          {/* Distance slider */}
          <View style={styles.distanceWrap}>
            <View style={styles.distanceHeader}>
              <Text style={styles.distanceLabel}>Distance</Text>
              <Text style={styles.distanceValue}>
                {distanceMiles >= 500 ? 'Unlimited' : `${distanceMiles} mi`}
              </Text>
            </View>
            {isEditing ? (
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={500}
                step={5}
                value={distanceMiles}
                onValueChange={setDistanceMiles}
                minimumTrackTintColor={colors.gold}
                maximumTrackTintColor="rgba(232,221,208,0.12)"
                thumbTintColor={colors.gold}
              />
            ) : (
              <View style={styles.distanceBarBg}>
                <View style={[styles.distanceBarFill, { width: `${Math.min((distanceMiles / 500) * 100, 100)}%` }]} />
              </View>
            )}
            <View style={styles.distanceTicks}>
              <Text style={styles.distanceTick}>5 mi</Text>
              <Text style={styles.distanceTick}>250 mi</Text>
              <Text style={styles.distanceTick}>500+</Text>
            </View>
          </View>

          {isEditing && matchCountryCode && (
            <TouchableOpacity
              style={styles.clearLocationBtn}
              onPress={() => { setMatchCountryCode(''); setMatchCity(''); }}
            >
              <Text style={styles.clearLocationText}>Clear location preference</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Picker modals */}
      <OptionPicker
        visible={showGenderPicker}
        title="I am"
        options={['Male', 'Female', 'Non-binary']}
        selected={gender}
        onSelect={(v) => { setGender(v as Gender); setShowGenderPicker(false); }}
        onClose={() => setShowGenderPicker(false)}
      />
      <OptionPicker
        visible={showLookingForPicker}
        title="Looking for"
        options={['Men', 'Women', 'Everyone']}
        selected={lookingFor}
        onSelect={(v) => { setLookingFor(v as LookingFor); setShowLookingForPicker(false); }}
        onClose={() => setShowLookingForPicker(false)}
      />
      <SearchablePicker
        visible={showCountryPicker}
        title="Preferred Country"
        items={[
          { key: '', label: 'Any country' },
          ...COUNTRIES.map((c) => ({ key: c.code, label: `${c.flag}  ${c.name}` })),
        ]}
        selected={matchCountryCode}
        onSelect={(v) => { setMatchCountryCode(v); setMatchCity(''); setShowCountryPicker(false); }}
        onClose={() => setShowCountryPicker(false)}
      />
      <SearchablePicker
        visible={showCityPicker}
        title="Preferred City"
        items={[
          { key: '', label: 'Any city' },
          ...matchCities.map((c) => ({ key: c, label: c })),
        ]}
        selected={matchCity}
        onSelect={(v) => { setMatchCity(v); setShowCityPicker(false); }}
        onClose={() => setShowCityPicker(false)}
      />
    </SafeAreaView>
  );
}

/* ---------- Helper components ---------- */

function AstroCard({ emoji, label, value, sub }: { emoji: string; label: string; value: string; sub: string }) {
  return (
    <View style={styles.astroCard}>
      <Text style={styles.astroEmoji}>{emoji}</Text>
      <Text style={styles.astroLabel}>{label}</Text>
      <Text style={styles.astroValue}>{value}</Text>
      <Text style={styles.astroSub}>{sub}</Text>
    </View>
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

function EditablePrefRow({ label, value, isEditing, onPress }: {
  label: string; value: string; isEditing: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.prefRow}
      onPress={isEditing ? onPress : undefined}
      activeOpacity={isEditing ? 0.7 : 1}
    >
      <Text style={styles.prefLabel}>{label}</Text>
      <View style={styles.prefValueRow}>
        <Text style={[styles.prefValue, isEditing && styles.prefValueEditable]}>{value}</Text>
        {isEditing && <Text style={styles.prefChevron}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}

function OptionPicker({ visible, title, options, selected, onSelect, onClose }: {
  visible: boolean; title: string; options: string[]; selected: string;
  onSelect: (v: string) => void; onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.modalRow, selected === opt && styles.modalRowSelected]}
              onPress={() => onSelect(opt)}
            >
              <Text style={[styles.modalRowText, selected === opt && styles.modalRowTextSelected]}>
                {opt}
              </Text>
              {selected === opt && <Text style={styles.modalCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

function SearchablePicker({ visible, title, items, selected, onSelect, onClose }: {
  visible: boolean; title: string;
  items: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void; onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = search
    ? items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '65%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          {items.length > 6 && (
            <View style={styles.searchWrap}>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                placeholderTextColor={colors.textMuted}
              />
            </View>
          )}
          <ScrollView keyboardShouldPersistTaps="handled">
            {filtered.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.modalRow, selected === item.key && styles.modalRowSelected]}
                onPress={() => { onSelect(item.key); setSearch(''); }}
              >
                <Text style={[styles.modalRowText, selected === item.key && styles.modalRowTextSelected]}>
                  {item.label}
                </Text>
                {selected === item.key && <Text style={styles.modalCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16,
  },
  headerTitle: { fontFamily: fontFamily.displayBold, fontSize: 28, color: '#faf5eb' },
  editBtn: { fontFamily: fontFamily.bodySemibold, fontSize: 15, color: colors.gold },

  // Profile card
  profileCard: {
    alignItems: 'center', backgroundColor: colors.surface, borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: 'rgba(212,165,74,0.1)', marginBottom: 20,
  },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(212,165,74,0.15)',
    borderWidth: 2, borderColor: colors.gold, justifyContent: 'center', alignItems: 'center',
  },
  avatarImage: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: colors.gold },
  avatarText: { fontFamily: fontFamily.displayExtrabold, fontSize: 36, color: colors.gold },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: -4, width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.surface,
  },
  avatarEditIcon: { fontSize: 14 },
  onlineDot: {
    position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.success, borderWidth: 3, borderColor: colors.surface,
  },
  profileName: { fontFamily: fontFamily.displayBold, fontSize: 22, color: '#faf5eb', marginBottom: 4 },
  profileLocation: { fontFamily: fontFamily.body, fontSize: 14, color: colors.textMuted, marginBottom: 12 },
  profileBadges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    backgroundColor: 'rgba(232,221,208,0.06)', borderRadius: 999, paddingHorizontal: 12,
    paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(232,221,208,0.1)',
  },
  badgeGold: { borderColor: 'rgba(212,165,74,0.25)', backgroundColor: 'rgba(212,165,74,0.08)' },
  badgeText: { fontFamily: fontFamily.bodyMedium, fontSize: 12, color: 'rgba(232,221,208,0.6)' },
  badgeTextGold: { fontFamily: fontFamily.bodyMedium, fontSize: 12, color: colors.gold },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: {
    fontFamily: fontFamily.bodySemibold, fontSize: 14, color: colors.goldLight,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  sectionSubtitle: {
    fontFamily: fontFamily.body, fontSize: 13, color: colors.textMuted, marginBottom: 12, marginTop: -8,
  },
  sectionCount: { fontFamily: fontFamily.body, fontSize: 12, color: colors.textMuted, marginBottom: 12 },

  // Bio
  bioText: { fontFamily: fontFamily.body, fontSize: 15, color: 'rgba(232,221,208,0.7)', lineHeight: 22 },
  bioInput: {
    fontFamily: fontFamily.body, fontSize: 15, color: colors.text, lineHeight: 22,
    backgroundColor: colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(232,221,208,0.1)', minHeight: 100, textAlignVertical: 'top',
  },
  charCount: { fontFamily: fontFamily.body, fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 4 },

  // Photos
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoSlot: {
    width: (SCREEN_WIDTH - 48 - 20) / 3, aspectRatio: 3 / 4, borderRadius: 14, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(232,221,208,0.1)', borderStyle: 'dashed', backgroundColor: colors.surface,
  },
  photoSlotFilled: { borderStyle: 'solid', borderColor: 'rgba(212,165,74,0.2)', borderWidth: 1 },
  photoSlotEditing: { borderColor: colors.gold },
  photoImage: { width: '100%', height: '100%', borderRadius: 13 },
  photoEditOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center', borderRadius: 13,
  },
  photoEditIcon: { fontSize: 20, color: '#fff' },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
  photoPlus: { fontSize: 24, color: colors.goldLight, fontWeight: '300' },
  photoLabel: {
    fontFamily: fontFamily.body, fontSize: 9, color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Astrology
  astroCards: { flexDirection: 'row', gap: 10 },
  astroCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(212,165,74,0.1)', gap: 4,
  },
  astroEmoji: { fontSize: 28, marginBottom: 4 },
  astroLabel: { fontFamily: fontFamily.body, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  astroValue: { fontFamily: fontFamily.bodySemibold, fontSize: 14, color: colors.goldLight },
  astroSub: { fontFamily: fontFamily.body, fontSize: 11, color: colors.textMuted },

  // Interests
  interestsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip: {
    backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(232,221,208,0.08)',
  },
  interestChipSelected: { borderColor: colors.gold, backgroundColor: 'rgba(212,165,74,0.1)' },
  interestText: { fontFamily: fontFamily.body, fontSize: 13, color: colors.textMuted },
  interestTextSelected: { fontFamily: fontFamily.bodyMedium, color: colors.goldLight },

  // Preferences
  prefList: {
    backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.06)', overflow: 'hidden',
  },
  prefRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,221,208,0.05)',
  },
  prefLabel: { fontFamily: fontFamily.body, fontSize: 14, color: colors.textMuted },
  prefValue: { fontFamily: fontFamily.bodyMedium, fontSize: 14, color: colors.text },
  prefValueEditable: { color: colors.gold },
  prefValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  prefChevron: { fontFamily: fontFamily.body, fontSize: 18, color: colors.gold },
  ageInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ageInput: {
    width: 44, backgroundColor: 'rgba(232,221,208,0.06)', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 10, fontFamily: fontFamily.bodyMedium,
    fontSize: 14, color: colors.gold, textAlign: 'center',
  },
  ageDash: { fontFamily: fontFamily.body, fontSize: 14, color: colors.textMuted },
  distanceWrap: {
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.06)',
  },
  distanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceLabel: { fontFamily: fontFamily.body, fontSize: 14, color: colors.textMuted },
  distanceValue: { fontFamily: fontFamily.bodySemibold, fontSize: 16, color: colors.gold },
  slider: { width: '100%', height: 40 },
  distanceBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(232,221,208,0.12)',
    marginVertical: 16,
  },
  distanceBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  distanceTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceTick: { fontFamily: fontFamily.body, fontSize: 11, color: colors.textMuted },
  clearLocationBtn: { alignItems: 'center', marginTop: 10 },
  clearLocationText: { fontFamily: fontFamily.body, fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },

  // Logout
  logoutBtn: {
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.06)',
    borderRadius: 999, paddingVertical: 15, alignItems: 'center',
  },
  logoutText: { fontFamily: fontFamily.bodySemibold, fontSize: 15, color: '#ef4444' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '50%', paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 18, borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,221,208,0.1)',
  },
  modalTitle: { fontFamily: fontFamily.displayBold, fontSize: 18, color: colors.text },
  modalClose: { fontFamily: fontFamily.bodySemibold, fontSize: 16, color: colors.goldLight },
  modalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 14,
  },
  modalRowSelected: { backgroundColor: 'rgba(212,165,74,0.1)' },
  modalRowText: { fontFamily: fontFamily.body, fontSize: 16, color: colors.text },
  modalRowTextSelected: { fontFamily: fontFamily.bodySemibold, color: colors.goldLight },
  modalCheck: { fontFamily: fontFamily.bodySemibold, fontSize: 16, color: colors.gold },
  searchWrap: {
    paddingHorizontal: 24, paddingVertical: 10, borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,221,208,0.06)',
  },
  searchInput: {
    backgroundColor: 'rgba(232,221,208,0.06)', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, fontFamily: fontFamily.body, fontSize: 15, color: colors.text,
  },
});
