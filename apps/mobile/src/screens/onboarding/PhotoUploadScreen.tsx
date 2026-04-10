import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';

const TOTAL_SLOTS = 6;
const REQUIRED_PHOTOS = 3;

interface PhotoUploadScreenProps {
  onContinue: (photos: string[]) => void;
  onBack: () => void;
  optional?: boolean;
}

export default function PhotoUploadScreen({
  onContinue,
  onBack,
  optional = false,
}: PhotoUploadScreenProps) {
  const [photos, setPhotos] = useState<(string | null)[]>(
    Array(TOTAL_SLOTS).fill(null)
  );

  const photoCount = photos.filter((p) => p !== null).length;
  const minRequired = optional ? 0 : REQUIRED_PHOTOS;
  const canContinue = photoCount >= minRequired;

  const pickImage = async (index: number) => {
    // If photo exists at this slot, offer to remove it
    if (photos[index]) {
      Alert.alert('Photo Options', 'What would you like to do?', [
        {
          text: 'Replace',
          onPress: () => launchPicker(index),
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newPhotos = [...photos];
            newPhotos[index] = null;
            setPhotos(newPhotos);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    await launchPicker(index);
  };

  const launchPicker = async (index: number) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload photos.'
      );
      return;
    }

    // Calculate how many empty slots remain from this index onward
    const emptySlots = photos.slice(index).filter((p) => p === null).length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: emptySlots > 1,
      selectionLimit: emptySlots,
      allowsEditing: emptySlots <= 1,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newPhotos = [...photos];
      let slotIndex = index;
      for (const asset of result.assets) {
        // Find next empty slot from slotIndex
        while (slotIndex < TOTAL_SLOTS && newPhotos[slotIndex] !== null) {
          slotIndex++;
        }
        if (slotIndex >= TOTAL_SLOTS) break;
        newPhotos[slotIndex] = asset.uri;
        slotIndex++;
      }
      setPhotos(newPhotos);
    }
  };

  const handleContinue = () => {
    const validPhotos = photos.filter((p): p is string => p !== null);
    onContinue(validPhotos);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>{'<'} Back</Text>
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          {!optional && <View style={styles.progressDot} />}
        </View>

        <Text style={styles.heading}>{optional ? 'Add Photos (Optional)' : 'Add Your Photos'}</Text>
        <Text style={styles.subheading}>
          {optional
            ? 'Photos are optional for referrers. You can add them later or skip this step.'
            : 'Show your best self. First 3 are required.'}
        </Text>

        {/* Photo Grid */}
        <View style={styles.grid}>
          {photos.map((photo, index) => {
            const isRequired = !optional && index < REQUIRED_PHOTOS;
            const hasPhoto = photo !== null;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.photoSlot,
                  isRequired && !hasPhoto && styles.photoSlotRequired,
                  !isRequired && !hasPhoto && styles.photoSlotOptional,
                  hasPhoto && styles.photoSlotFilled,
                ]}
                onPress={() => pickImage(index)}
                activeOpacity={0.7}
              >
                {hasPhoto ? (
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.plusIcon}>+</Text>
                    <Text style={styles.slotLabel}>
                      {isRequired ? 'Required' : 'Optional'}
                    </Text>
                  </View>
                )}

                {/* Photo number badge */}
                <View
                  style={[
                    styles.numberBadge,
                    hasPhoto && styles.numberBadgeFilled,
                  ]}
                >
                  <Text
                    style={[
                      styles.numberBadgeText,
                      hasPhoto && styles.numberBadgeTextFilled,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Helper text */}
        <View style={styles.helperRow}>
          <Text style={styles.helperText}>
            {optional
              ? photoCount === 0
                ? 'No photos added — you can skip'
                : `${photoCount} photo${photoCount > 1 ? 's' : ''} added`
              : photoCount < REQUIRED_PHOTOS
                ? `${REQUIRED_PHOTOS - photoCount} more photo${REQUIRED_PHOTOS - photoCount > 1 ? 's' : ''} required`
                : `${photoCount} photo${photoCount > 1 ? 's' : ''} added`}
          </Text>
          {canContinue && (
            <Text style={styles.helperSuccess}>Ready to continue</Text>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Photo Tips</Text>
          <Text style={styles.tipItem}>
            {'\u2022'} Use clear, well-lit photos of your face
          </Text>
          <Text style={styles.tipItem}>
            {'\u2022'} Include at least one full-body photo
          </Text>
          <Text style={styles.tipItem}>
            {'\u2022'} Show your personality and interests
          </Text>
          <Text style={styles.tipItem}>
            {'\u2022'} Avoid group photos as your main photo
          </Text>
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>
            {optional && photoCount === 0 ? 'Skip Photos' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 16,
    color: colors.goldLight,
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(232,221,208,0.12)',
  },
  progressDotActive: {
    backgroundColor: colors.gold,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.goldLight,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 28,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  photoSlot: {
    width: '31%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photoSlotRequired: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  photoSlotOptional: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(232,221,208,0.15)',
    borderStyle: 'dashed',
  },
  photoSlotFilled: {
    borderWidth: 0,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  plusIcon: {
    fontSize: 28,
    color: colors.goldLight,
    fontWeight: '300',
    lineHeight: 32,
  },
  slotLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  numberBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(12,41,72,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeFilled: {
    backgroundColor: colors.gold,
  },
  numberBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  numberBadgeTextFilled: {
    color: colors.background,
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  helperText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  helperSuccess: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.06)',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.goldLight,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tipItem: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 22,
    paddingLeft: 4,
  },
  continueBtn: {
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueBtnDisabled: {
    backgroundColor: 'rgba(212,165,74,0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.background,
  },
});
