import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuthStore, UserType } from '../../store/auth-store';

interface UserTypeScreenProps {
  onContinue: () => void;
}

function HeartIcon({ size = 32, color = colors.goldLight }: { size?: number; color?: string }) {
  return (
    <Text style={{ fontSize: size, color, lineHeight: size + 4 }}>
      {'\u2665'}
    </Text>
  );
}

function PeopleIcon({ size = 32, color = colors.goldLight }: { size?: number; color?: string }) {
  return (
    <Text style={{ fontSize: size, color, lineHeight: size + 4 }}>
      {'\u{1F46B}'}
    </Text>
  );
}

const USER_TYPE_OPTIONS: {
  type: UserType;
  title: string;
  description: string;
  icon: 'heart' | 'people';
}[] = [
  {
    type: 'direct',
    title: 'Find My Match',
    description:
      'Build your profile, see 10 matches daily, connect with people who truly get you',
    icon: 'heart',
  },
  {
    type: 'referrer',
    title: 'Refer Someone',
    description:
      'Know someone special? Create a profile for them and help them find love',
    icon: 'people',
  },
];

export default function UserTypeScreen({ onContinue }: UserTypeScreenProps) {
  const { setUserType } = useAuthStore();
  const [selected, setSelected] = useState<UserType | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setUserType(selected);
    onContinue();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.heading}>How do you want to{'\n'}use Agar?</Text>
          <Text style={styles.subheading}>
            Choose your path to meaningful connections
          </Text>
        </View>

        {/* Cards */}
        <View style={styles.cardsContainer}>
          {USER_TYPE_OPTIONS.map((option) => {
            const isSelected = selected === option.type;
            return (
              <TouchableOpacity
                key={option.type}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(option.type)}
                activeOpacity={0.7}
              >
                {/* Glow effect on selected */}
                {isSelected && <View style={styles.cardGlow} />}

                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      isSelected && styles.iconContainerSelected,
                    ]}
                  >
                    {option.icon === 'heart' ? (
                      <HeartIcon
                        size={28}
                        color={isSelected ? colors.gold : colors.goldLight}
                      />
                    ) : (
                      <PeopleIcon
                        size={28}
                        color={isSelected ? colors.gold : colors.goldLight}
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.cardTitle,
                      isSelected && styles.cardTitleSelected,
                    ]}
                  >
                    {option.title}
                  </Text>

                  <Text style={styles.cardDescription}>
                    {option.description}
                  </Text>
                </View>

                {/* Selection indicator */}
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!selected}
            activeOpacity={0.8}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  headerSection: {
    marginBottom: 36,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.goldLight,
    marginBottom: 10,
    lineHeight: 36,
  },
  subheading: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 16,
    flex: 1,
    justifyContent: 'center',
    marginTop: -40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(232,221,208,0.08)',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,165,74,0.06)',
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212,165,74,0.08)',
  },
  cardContent: {
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(212,165,74,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(212,165,74,0.18)',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  cardTitleSelected: {
    color: colors.goldLight,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(232,221,208,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.gold,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gold,
  },
  bottomSection: {
    paddingBottom: 24,
    paddingTop: 16,
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
