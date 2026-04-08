import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import LogoHeader from '../components/LogoHeader';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top spacer */}
        <View style={styles.topSection}>
          <LogoHeader size="large" />
        </View>

        {/* Tagline */}
        <View style={styles.taglineSection}>
          <Text style={styles.tagline}>
            Where stars align{'\n'}& hearts connect
          </Text>
          <Text style={styles.subtitle}>
            Astrology, palmistry & behavioral science{'\n'}working together to find your match.
          </Text>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          {/* Social proof */}
          <View style={styles.statsRow}>
            <StatItem value="50K+" label="members" />
            <View style={styles.statDivider} />
            <StatItem value="12K+" label="matches" />
            <View style={styles.statDivider} />
            <StatItem value="4.8" label="rating" />
          </View>

          <TouchableOpacity style={styles.ctaBtn} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.ctaBtnText}>Get Started</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: SCREEN_HEIGHT * 0.35,
  },
  taglineSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tagline: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSection: {
    paddingBottom: 36,
    gap: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fontFamily.accentBold,
    fontSize: 20,
    color: colors.gold,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(232,221,208,0.1)',
  },
  ctaBtn: {
    backgroundColor: colors.gold,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBtnText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 18,
    color: colors.background,
    letterSpacing: 0.2,
  },
  termsText: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    opacity: 0.6,
  },
});
