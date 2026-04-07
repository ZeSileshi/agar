import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

type Gender = 'male' | 'female' | 'nonbinary';
type LookingFor = 'men' | 'women' | 'everyone';

interface BasicInfoScreenProps {
  onContinue: (data: {
    firstName: string;
    dateOfBirth: Date;
    gender: Gender;
    lookingFor: LookingFor;
    city: string;
  }) => void;
  onBack: () => void;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'nonbinary', label: 'Non-binary' },
];

const LOOKING_FOR_OPTIONS: { value: LookingFor; label: string }[] = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'everyone', label: 'Everyone' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BasicInfoScreen({ onContinue, onBack }: BasicInfoScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [lookingFor, setLookingFor] = useState<LookingFor | null>(null);
  const [city, setCity] = useState('');

  // Date of birth state
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const isFormValid =
    firstName.trim().length >= 2 &&
    birthDay !== '' &&
    birthMonth !== '' &&
    birthYear.length === 4 &&
    gender !== null &&
    lookingFor !== null &&
    city.trim().length >= 2;

  const handleContinue = () => {
    if (!isFormValid || !gender || !lookingFor) return;

    const monthIndex = MONTHS.indexOf(birthMonth);
    const dob = new Date(
      parseInt(birthYear, 10),
      monthIndex,
      parseInt(birthDay, 10)
    );

    // Basic age validation (18+)
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 18) {
      return; // Silently reject, could add alert
    }

    onContinue({
      firstName: firstName.trim(),
      dateOfBirth: dob,
      gender,
      lookingFor,
      city: city.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>{'<'} Back</Text>
          </TouchableOpacity>

          {/* Progress indicator */}
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>

          <Text style={styles.heading}>Tell us about you</Text>
          <Text style={styles.subheading}>
            This helps us find your best matches
          </Text>

          {/* First Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.textInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Your first name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              maxLength={30}
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.textInput, styles.dateInputDay]}
                value={birthDay}
                onChangeText={(text) =>
                  setBirthDay(text.replace(/\D/g, '').slice(0, 2))
                }
                placeholder="DD"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />

              <TouchableOpacity
                style={[styles.textInput, styles.dateInputMonth]}
                onPress={() => setShowMonthPicker(true)}
              >
                <Text
                  style={
                    birthMonth
                      ? styles.dateMonthText
                      : styles.dateMonthPlaceholder
                  }
                >
                  {birthMonth || 'Month'}
                </Text>
              </TouchableOpacity>

              <TextInput
                style={[styles.textInput, styles.dateInputYear]}
                value={birthYear}
                onChangeText={(text) =>
                  setBirthYear(text.replace(/\D/g, '').slice(0, 4))
                }
                placeholder="YYYY"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </View>

          {/* Gender */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>I am</Text>
            <View style={styles.chipRow}>
              {GENDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    gender === opt.value && styles.chipSelected,
                  ]}
                  onPress={() => setGender(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      gender === opt.value && styles.chipTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Looking For */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Looking for</Text>
            <View style={styles.chipRow}>
              {LOOKING_FOR_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    lookingFor === opt.value && styles.chipSelected,
                  ]}
                  onPress={() => setLookingFor(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      lookingFor === opt.value && styles.chipTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* City */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.textInput}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Addis Ababa"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>

          {/* Continue */}
          <TouchableOpacity
            style={[
              styles.continueBtn,
              !isFormValid && styles.continueBtnDisabled,
            ]}
            onPress={handleContinue}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Month Picker Modal */}
      <Modal visible={showMonthPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {MONTHS.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthRow,
                    birthMonth === month && styles.monthRowSelected,
                  ]}
                  onPress={() => {
                    setBirthMonth(month);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.monthRowText,
                      birthMonth === month && styles.monthRowTextSelected,
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
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
    marginBottom: 32,
    lineHeight: 22,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.1)',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 16,
    color: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInputDay: {
    width: 64,
    textAlign: 'center',
  },
  dateInputMonth: {
    flex: 1,
    justifyContent: 'center',
  },
  dateInputYear: {
    width: 80,
    textAlign: 'center',
  },
  dateMonthText: {
    fontSize: 16,
    color: colors.text,
  },
  dateMonthPlaceholder: {
    fontSize: 16,
    color: colors.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(232,221,208,0.1)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,165,74,0.1)',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.goldLight,
  },
  continueBtn: {
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 12,
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '50%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,221,208,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.goldLight,
  },
  monthRow: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  monthRowSelected: {
    backgroundColor: 'rgba(212,165,74,0.1)',
  },
  monthRowText: {
    fontSize: 16,
    color: colors.text,
  },
  monthRowTextSelected: {
    color: colors.goldLight,
    fontWeight: '600',
  },
});
