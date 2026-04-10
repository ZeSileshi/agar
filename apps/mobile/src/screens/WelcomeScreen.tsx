import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Nav area — logo + language */}
        <View style={styles.navRow}>
          <View style={styles.navLogo}>
            <Image source={require('../assets/icon.png')} style={styles.navLogoImage} resizeMode="contain" />
            <Text style={styles.navBrandName}>Agar</Text>
            <Text style={styles.navAmharic}>አጋር</Text>
          </View>
        </View>

        {/* Hero section */}
        <View style={styles.heroSection}>
          {/* Badge */}
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Astrology meets AI</Text>
          </View>

          {/* Headline — matches web exactly */}
          <Text style={styles.headline}>
            Let the cosmos find{'\n'}
            <Text style={styles.headlineAccent}>your person.</Text>
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Agar combines three astrology systems, personality science, and cultural intelligence to find matches that actually make sense.
          </Text>
        </View>

        {/* Social proof */}
        <View style={styles.statsRow}>
          <StatItem value="50K+" label="active members" />
          <View style={styles.statDivider} />
          <StatItem value="12K+" label="matches made" />
          <View style={styles.statDivider} />
          <StatItem value="4.8" label="average rating" />
        </View>

        {/* CTA buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.ctaPrimary} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.ctaPrimaryText}>Start matching — it's free</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.7}>
            <Text style={styles.ctaSecondaryText}>How it works</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Where stars align and hearts connect.
        </Text>
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
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  // Nav
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  navLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLogoImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  navBrandName: {
    fontFamily: fontFamily.displayBold,
    fontSize: 21,
    color: colors.goldLight,
    letterSpacing: -0.5,
  },
  navAmharic: {
    fontFamily: fontFamily.ethiopic,
    fontSize: 14,
    color: colors.gold,
    opacity: 0.6,
    marginLeft: 2,
  },

  // Hero
  heroSection: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.2)',
    backgroundColor: 'rgba(212,165,74,0.05)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 20,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  badgeText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 14,
    color: colors.goldLight,
  },
  headline: {
    fontFamily: fontFamily.displayExtrabold,
    fontSize: SCREEN_WIDTH < 380 ? 32 : 36,
    lineHeight: SCREEN_WIDTH < 380 ? 38 : 42,
    letterSpacing: -1,
    color: '#faf5eb',
    marginBottom: 16,
  },
  headlineAccent: {
    color: colors.gold,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(232,221,208,0.5)',
    marginBottom: 8,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fontFamily.accentBold,
    fontSize: 18,
    color: colors.gold,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: fontFamily.body,
    fontSize: 11,
    color: 'rgba(232,221,208,0.4)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(232,221,208,0.1)',
  },

  // CTAs
  ctaSection: {
    gap: 12,
    marginBottom: 20,
  },
  ctaPrimary: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaPrimaryText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 16,
    color: colors.background,
  },
  ctaSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.2)',
    backgroundColor: 'rgba(212,165,74,0.05)',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaSecondaryText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 16,
    color: colors.goldLight,
  },

  // Footer
  footerText: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: 'rgba(232,221,208,0.2)',
    textAlign: 'center',
    paddingBottom: 16,
  },
});
