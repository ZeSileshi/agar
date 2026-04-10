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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { COUNTRIES, getCitiesForCountry } from '../../data/locations';

type Gender = 'male' | 'female' | 'nonbinary';
type LookingFor = 'men' | 'women' | 'everyone';

interface BasicInfoScreenProps {
  onContinue: (data: {
    firstName: string;
    dateOfBirth: Date;
    gender: Gender;
    lookingFor: LookingFor;
    country: string;
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

/** Returns the number of days in a given month/year */
function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Validates date and returns error message or null */
function validateDate(day: string, monthName: string, year: string): string | null {
  if (!day || !monthName || year.length < 4) return null; // not complete yet

  const d = parseInt(day, 10);
  const y = parseInt(year, 10);
  const m = MONTHS.indexOf(monthName);

  if (m === -1) return 'Invalid month';
  if (y < 1920 || y > new Date().getFullYear()) return 'Invalid year';
  if (d < 1 || d > daysInMonth(m, y)) return `${monthName} ${y} only has ${daysInMonth(m, y)} days`;

  const dob = new Date(y, m, d);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  if (age < 18) return 'You must be at least 18 years old';
  if (age > 120) return 'Please enter a valid birth year';

  return null;
}

export default function BasicInfoScreen({ onContinue, onBack }: BasicInfoScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [lookingFor, setLookingFor] = useState<LookingFor | null>(null);

  // Date of birth
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);

  // Location
  const [countryCode, setCountryCode] = useState('');
  const [city, setCity] = useState('');

  // Modal state
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode);
  const cities = countryCode ? getCitiesForCountry(countryCode) : [];

  // Re-validate date on change
  const updateDate = (day: string, month: string, year: string) => {
    const err = validateDate(day, month, year);
    setDateError(err);
  };

  const isFormValid =
    firstName.trim().length >= 2 &&
    birthDay !== '' &&
    birthMonth !== '' &&
    birthYear.length === 4 &&
    !dateError &&
    gender !== null &&
    lookingFor !== null &&
    countryCode !== '' &&
    city !== '';

  const handleContinue = () => {
    if (!isFormValid || !gender || !lookingFor) return;

    const monthIndex = MONTHS.indexOf(birthMonth);
    const dob = new Date(parseInt(birthYear, 10), monthIndex, parseInt(birthDay, 10));

    // Final age check
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const md = today.getMonth() - dob.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < dob.getDate())) age--;

    if (age < 18) {
      Alert.alert('Age Requirement', 'You must be at least 18 years old to use Agar.');
      return;
    }

    onContinue({
      firstName: firstName.trim(),
      dateOfBirth: dob,
      gender,
      lookingFor,
      country: countryCode,
      city,
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

          {/* Progress */}
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
                style={[styles.textInput, styles.dateInputDay, dateError && styles.inputError]}
                value={birthDay}
                onChangeText={(text) => {
                  const val = text.replace(/\D/g, '').slice(0, 2);
                  setBirthDay(val);
                  updateDate(val, birthMonth, birthYear);
                }}
                placeholder="DD"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />

              <TouchableOpacity
                style={[styles.textInput, styles.dateInputMonth, dateError && styles.inputError]}
                onPress={() => setShowMonthPicker(true)}
              >
                <Text style={birthMonth ? styles.dateMonthText : styles.dateMonthPlaceholder}>
                  {birthMonth || 'Month'}
                </Text>
              </TouchableOpacity>

              <TextInput
                style={[styles.textInput, styles.dateInputYear, dateError && styles.inputError]}
                value={birthYear}
                onChangeText={(text) => {
                  const val = text.replace(/\D/g, '').slice(0, 4);
                  setBirthYear(val);
                  updateDate(birthDay, birthMonth, val);
                }}
                placeholder="YYYY"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            {dateError && <Text style={styles.errorText}>{dateError}</Text>}
          </View>

          {/* Gender */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>I am</Text>
            <View style={styles.chipRow}>
              {GENDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, gender === opt.value && styles.chipSelected]}
                  onPress={() => setGender(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, gender === opt.value && styles.chipTextSelected]}>
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
                  style={[styles.chip, lookingFor === opt.value && styles.chipSelected]}
                  onPress={() => setLookingFor(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, lookingFor === opt.value && styles.chipTextSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Country */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Country</Text>
            <TouchableOpacity
              style={styles.textInput}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={selectedCountry ? styles.dropdownText : styles.dropdownPlaceholder}>
                {selectedCountry ? `${selectedCountry.flag}  ${selectedCountry.name}` : 'Select country'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* City */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>City</Text>
            <TouchableOpacity
              style={[styles.textInput, !countryCode && styles.inputDisabled]}
              onPress={() => {
                if (!countryCode) {
                  Alert.alert('Select Country', 'Please select your country first.');
                  return;
                }
                setShowCityPicker(true);
              }}
            >
              <Text style={city ? styles.dropdownText : styles.dropdownPlaceholder}>
                {city || (countryCode ? 'Select city' : 'Select country first')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Continue */}
          <TouchableOpacity
            style={[styles.continueBtn, !isFormValid && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Month Picker Modal */}
      <PickerModal
        visible={showMonthPicker}
        title="Select Month"
        items={MONTHS.map((m) => ({ key: m, label: m }))}
        selected={birthMonth}
        onSelect={(val) => {
          setBirthMonth(val);
          updateDate(birthDay, val, birthYear);
          setShowMonthPicker(false);
        }}
        onClose={() => setShowMonthPicker(false)}
      />

      {/* Country Picker Modal */}
      <PickerModal
        visible={showCountryPicker}
        title="Select Country"
        items={COUNTRIES.map((c) => ({ key: c.code, label: `${c.flag}  ${c.name}` }))}
        selected={countryCode}
        onSelect={(val) => {
          setCountryCode(val);
          setCity(''); // reset city when country changes
          setShowCountryPicker(false);
        }}
        onClose={() => setShowCountryPicker(false)}
      />

      {/* City Picker Modal */}
      <PickerModal
        visible={showCityPicker}
        title="Select City"
        items={cities.map((c) => ({ key: c, label: c }))}
        selected={city}
        onSelect={(val) => {
          setCity(val);
          setShowCityPicker(false);
        }}
        onClose={() => setShowCityPicker(false)}
      />
    </SafeAreaView>
  );
}

/* ---------- Reusable picker modal ---------- */

function PickerModal({
  visible,
  title,
  items,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = search
    ? items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
    : items;

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
          {items.length > 8 && (
            <View style={styles.searchWrap}>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                placeholderTextColor={colors.textMuted}
                autoCorrect={false}
              />
            </View>
          )}
          <ScrollView keyboardShouldPersistTaps="handled">
            {filtered.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.pickerRow, selected === item.key && styles.pickerRowSelected]}
                onPress={() => {
                  onSelect(item.key);
                  setSearch('');
                }}
              >
                <Text style={[styles.pickerRowText, selected === item.key && styles.pickerRowTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
            {filtered.length === 0 && (
              <Text style={styles.noResults}>No results found</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
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
    fontFamily: fontFamily.bodyMedium,
    fontSize: 16,
    color: colors.goldLight,
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
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    color: colors.goldLight,
    marginBottom: 8,
  },
  subheading: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 32,
    lineHeight: 22,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 13,
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
    fontFamily: fontFamily.body,
    color: colors.text,
  },
  inputError: {
    borderColor: 'rgba(244,63,94,0.6)',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: '#f43f5e',
    marginTop: 6,
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
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.text,
  },
  dateMonthPlaceholder: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.textMuted,
  },
  dropdownText: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.text,
  },
  dropdownPlaceholder: {
    fontFamily: fontFamily.body,
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
    fontFamily: fontFamily.bodySemibold,
    fontSize: 15,
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.goldLight,
  },
  continueBtn: {
    backgroundColor: colors.gold,
    borderRadius: 999,
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
    fontFamily: fontFamily.bodySemibold,
    fontSize: 17,
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
    maxHeight: '60%',
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
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    color: colors.text,
  },
  modalClose: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 16,
    color: colors.goldLight,
  },
  searchWrap: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,221,208,0.06)',
  },
  searchInput: {
    backgroundColor: 'rgba(232,221,208,0.06)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: colors.text,
  },
  pickerRow: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  pickerRowSelected: {
    backgroundColor: 'rgba(212,165,74,0.1)',
  },
  pickerRowText: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.text,
  },
  pickerRowTextSelected: {
    fontFamily: fontFamily.bodySemibold,
    color: colors.goldLight,
  },
  noResults: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
