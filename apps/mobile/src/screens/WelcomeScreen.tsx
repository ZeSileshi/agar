import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const scrollRef = useRef<ScrollView>(null);

  const scrollToHowItWorks = () => {
    scrollRef.current?.scrollTo({ y: SCREEN_HEIGHT - 120, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ============ HERO SECTION (first screen) ============ */}
        <View style={styles.heroScreen}>
          {/* Nav */}
          <View style={styles.navRow}>
            <View style={styles.navLogo}>
              <Image source={require('../assets/icon.png')} style={styles.navLogoImage} resizeMode="contain" />
              <Text style={styles.navBrandName}>Agar</Text>
            </View>
          </View>

          {/* Hero */}
          <View style={styles.heroSection}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Astrology meets AI</Text>
            </View>

            <Text style={styles.headline}>
              Let the cosmos find{'\n'}
              <Text style={styles.headlineAccent}>your person.</Text>
            </Text>

            <Text style={styles.subtitle}>
              Agar combines three astrology systems, personality science, and cultural intelligence to find matches that actually make sense.
            </Text>

            {/* Dual path callout */}
            <View style={styles.dualPathRow}>
              <View style={styles.dualPathCard}>
                <Text style={styles.dualPathIcon}>✦</Text>
                <Text style={styles.dualPathLabel}>Find your match</Text>
              </View>
              <View style={styles.dualPathDivider}>
                <Text style={styles.dualPathOr}>or</Text>
              </View>
              <View style={styles.dualPathCard}>
                <Text style={styles.dualPathIcon}>♥</Text>
                <Text style={styles.dualPathLabel}>Refer someone you know</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatItem value="50K+" label="active members" />
            <View style={styles.statDivider} />
            <StatItem value="12K+" label="matches made" />
            <View style={styles.statDivider} />
            <StatItem value="4.8" label="average rating" />
          </View>

          {/* CTAs */}
          <View style={styles.ctaSection}>
            <TouchableOpacity style={styles.ctaPrimary} onPress={onGetStarted} activeOpacity={0.85}>
              <Text style={styles.ctaPrimaryText}>Start matching — it's free</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.ctaSecondary} onPress={scrollToHowItWorks} activeOpacity={0.7}>
              <Text style={styles.ctaSecondaryText}>How it works ↓</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============ HOW IT WORKS ============ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>How Agar works</Text>
          <Text style={styles.sectionTitle}>Two ways to find love</Text>

          {/* Path 1: Find Your Match */}
          <View style={styles.pathCard}>
            <Text style={styles.pathHeading}>✦ Find Your Match</Text>
            <Step num="01" title="Create your account" desc="Sign up with your phone number and build your profile in minutes." />
            <Step num="02" title="Scan your palm" desc="Optionally scan your palm for deeper compatibility insights powered by AI." />
            <Step num="03" title="Browse daily matches" desc="See 10 curated matches every day. Like, love, gift, or skip." />
            <Step num="04" title="Start chatting" desc="Mutual likes unlock private chat so you can connect for real." />
          </View>

          {/* Path 2: Refer Someone */}
          <View style={styles.pathCard}>
            <Text style={styles.pathHeading}>♥ Refer Someone</Text>
            <Step num="01" title="Know a great match?" desc="Know someone who deserves love? Refer them to Agar." />
            <Step num="02" title="Add their details" desc="Just text details — no photos needed. Quick and respectful." />
            <Step num="03" title="They get discovered" desc="Your referral appears for other referrals to find and connect with." />
          </View>
        </View>

        {/* ============ WHY AGAR ============ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Why Agar</Text>
          <Text style={styles.sectionTitle}>Not another swiping app</Text>

          <View style={styles.featureGrid}>
            <FeatureCard icon="⚛" title="Triple astrology engine" desc="Western, Vedic, and Chinese systems combined for deeper insight." />
            <FeatureCard icon="🧠" title="Behavioral science" desc="Personality matching based on how you actually communicate." />
            <FeatureCard icon="👥" title="Community referrals" desc="Your friends and family can help find matches for you." />
            <FeatureCard icon="🌍" title="Cultural intelligence" desc="Built for the Ethiopian diaspora — understands your world." />
            <FeatureCard icon="🔒" title="Privacy first" desc="Your data stays yours. No selling, no sharing, ever." />
            <FeatureCard icon="💬" title="Guided conversations" desc="AI-powered icebreakers that actually lead somewhere." />
          </View>
        </View>

        {/* ============ HONESTY DISCLAIMER ============ */}
        <View style={styles.section}>
          <View style={styles.honestyCard}>
            <Text style={styles.honestyTitle}>A quick note on honesty</Text>
            <Text style={styles.honestyText}>
              For the best results, be truthful with your birth details, personality answers, and palm photos. The more honest you are, the better our matching works.
            </Text>
            <Text style={styles.honestyDisclaimer}>
              Also — let's be real: this is just our algorithm. It's pretty good, but it's not perfect. Think of it as a very smart friend who sometimes gets it wrong. ❤️
            </Text>
          </View>
        </View>

        {/* ============ BOTTOM CTA ============ */}
        <View style={styles.section}>
          <Text style={styles.bottomCtaTitle}>
            Ready to meet someone{'\n'}who gets you?
          </Text>
          <Text style={styles.bottomCtaSubtitle}>
            Join thousands finding real connection through compatibility science.
          </Text>
          <TouchableOpacity style={styles.ctaPrimary} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.ctaPrimaryText}>Get started free</Text>
          </TouchableOpacity>
        </View>

        {/* ============ FOOTER ============ */}
        <View style={styles.footer}>
          <Text style={styles.footerTagline}>Where stars align and hearts connect.</Text>
          <View style={styles.footerLinks}>
            {['About', 'Privacy', 'Terms', 'Support'].map((link) => (
              <Text key={link} style={styles.footerLink}>{link}</Text>
            ))}
          </View>
          <Text style={styles.footerCopy}>© 2026 Agar. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Sub-components ---------- */

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{num}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },

  // Hero screen — fills first viewport
  heroScreen: {
    minHeight: SCREEN_HEIGHT - 100,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32,
  },
  navLogo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navLogoImage: { width: 44, height: 44, borderRadius: 12 },
  navBrandName: {
    fontFamily: fontFamily.displayBold, fontSize: 21, color: colors.goldLight, letterSpacing: -0.5,
  },
  heroSection: { flex: 1, justifyContent: 'center' },
  badge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8,
    borderWidth: 1, borderColor: 'rgba(212,165,74,0.2)', backgroundColor: 'rgba(212,165,74,0.05)',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, marginBottom: 20,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  badgeText: { fontFamily: fontFamily.bodyMedium, fontSize: 14, color: colors.goldLight },
  headline: {
    fontFamily: fontFamily.displayExtrabold,
    fontSize: SCREEN_WIDTH < 380 ? 32 : 36,
    lineHeight: SCREEN_WIDTH < 380 ? 38 : 42,
    letterSpacing: -1, color: '#faf5eb', marginBottom: 16,
  },
  headlineAccent: { color: colors.gold },
  subtitle: {
    fontFamily: fontFamily.body, fontSize: 16, lineHeight: 24,
    color: 'rgba(232,221,208,0.5)', marginBottom: 16,
  },
  dualPathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dualPathCard: {
    flex: 1,
    backgroundColor: 'rgba(212,165,74,0.06)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.15)',
    alignItems: 'center',
    gap: 6,
  },
  dualPathIcon: {
    fontSize: 18,
    color: colors.gold,
  },
  dualPathLabel: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 12,
    color: 'rgba(232,221,208,0.6)',
    textAlign: 'center',
  },
  dualPathDivider: {
    justifyContent: 'center',
  },
  dualPathOr: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: 'rgba(232,221,208,0.25)',
  },
  statsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 16, paddingVertical: 20, marginBottom: 8,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: fontFamily.accentBold, fontSize: 18, color: colors.gold, letterSpacing: -0.5 },
  statLabel: { fontFamily: fontFamily.body, fontSize: 11, color: 'rgba(232,221,208,0.4)', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(232,221,208,0.1)' },
  ctaSection: { gap: 12, marginBottom: 20 },
  ctaPrimary: {
    backgroundColor: colors.gold, borderRadius: 999, paddingVertical: 16, alignItems: 'center',
    shadowColor: colors.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25,
    shadowRadius: 16, elevation: 8,
  },
  ctaPrimaryText: { fontFamily: fontFamily.bodySemibold, fontSize: 16, color: colors.background },
  ctaSecondary: {
    borderWidth: 1, borderColor: 'rgba(212,165,74,0.2)', backgroundColor: 'rgba(212,165,74,0.05)',
    borderRadius: 999, paddingVertical: 16, alignItems: 'center',
  },
  ctaSecondaryText: { fontFamily: fontFamily.bodyMedium, fontSize: 16, color: colors.goldLight },

  // Sections
  section: { paddingHorizontal: 24, marginTop: 48 },
  sectionLabel: {
    fontFamily: fontFamily.bodySemibold, fontSize: 12, color: colors.gold,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fontFamily.displayBold, fontSize: 26, color: '#faf5eb',
    letterSpacing: -0.5, marginBottom: 24,
  },

  // How it works — path cards
  pathCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(212,165,74,0.1)', marginBottom: 16,
  },
  pathHeading: {
    fontFamily: fontFamily.displayBold, fontSize: 18, color: colors.goldLight, marginBottom: 16,
  },
  step: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(212,165,74,0.1)', borderWidth: 1, borderColor: 'rgba(212,165,74,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumText: { fontFamily: fontFamily.accentBold, fontSize: 12, color: colors.gold },
  stepContent: { flex: 1 },
  stepTitle: { fontFamily: fontFamily.bodySemibold, fontSize: 15, color: '#faf5eb', marginBottom: 2 },
  stepDesc: { fontFamily: fontFamily.body, fontSize: 13, color: 'rgba(232,221,208,0.45)', lineHeight: 19 },

  // Features
  featureGrid: { gap: 12 },
  featureCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(232,221,208,0.06)',
  },
  featureIcon: { fontSize: 24, marginBottom: 8 },
  featureTitle: { fontFamily: fontFamily.bodySemibold, fontSize: 15, color: '#faf5eb', marginBottom: 4 },
  featureDesc: { fontFamily: fontFamily.body, fontSize: 13, color: 'rgba(232,221,208,0.45)', lineHeight: 19 },

  // Honesty disclaimer
  honestyCard: {
    backgroundColor: 'rgba(212,165,74,0.06)', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: 'rgba(212,165,74,0.15)',
  },
  honestyTitle: {
    fontFamily: fontFamily.displayBold, fontSize: 20, color: '#faf5eb', marginBottom: 12,
  },
  honestyText: {
    fontFamily: fontFamily.body, fontSize: 14, color: 'rgba(232,221,208,0.55)',
    lineHeight: 22, marginBottom: 12,
  },
  honestyDisclaimer: {
    fontFamily: fontFamily.body, fontSize: 13, color: 'rgba(232,221,208,0.35)',
    lineHeight: 20, fontStyle: 'italic',
  },

  // Bottom CTA
  bottomCtaTitle: {
    fontFamily: fontFamily.displayExtrabold, fontSize: 28, color: '#faf5eb',
    letterSpacing: -0.8, textAlign: 'center', marginBottom: 12,
  },
  bottomCtaSubtitle: {
    fontFamily: fontFamily.body, fontSize: 15, color: 'rgba(232,221,208,0.45)',
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },

  // Footer
  footer: { paddingHorizontal: 24, marginTop: 48, alignItems: 'center', paddingBottom: 16 },
  footerTagline: {
    fontFamily: fontFamily.body, fontSize: 13, color: 'rgba(232,221,208,0.3)',
    marginBottom: 16,
  },
  footerLinks: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  footerLink: { fontFamily: fontFamily.bodyMedium, fontSize: 13, color: 'rgba(232,221,208,0.25)' },
  footerCopy: { fontFamily: fontFamily.body, fontSize: 11, color: 'rgba(232,221,208,0.15)' },
});
