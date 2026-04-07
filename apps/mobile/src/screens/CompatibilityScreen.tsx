import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import type { CompatibilityReport } from '@agar/shared';
import { getCompatibilityLevel } from '@agar/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function ScoreRing({ score, size = 160, strokeWidth = 12, label }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const level = getCompatibilityLevel(score);
  const levelColors = {
    excellent: colors.gold[300],
    good: colors.primary[400],
    moderate: colors.accent[400],
    challenging: colors.neutral[400],
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={levelColors[level]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference / 4}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.scoreNumber, { color: levelColors[level] }]}>{score}</Text>
        <Text style={styles.scorePercent}>%</Text>
      </View>
      {label && <Text style={styles.ringLabel}>{label}</Text>}
    </View>
  );
}

interface BreakdownBarProps {
  label: string;
  score: number;
  maxScore?: number;
  color: string;
}

function BreakdownBar({ label, score, maxScore = 100, color }: BreakdownBarProps) {
  return (
    <View style={styles.barContainer}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={[styles.barScore, { color }]}>{Math.round(score)}%</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${(score / maxScore) * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function CompatibilityScreen() {
  const { t } = useTranslation();

  // Mock data
  const report: CompatibilityReport = {
    user1Id: '1',
    user2Id: '2',
    overallScore: 82,
    confidence: 0.85,
    breakdown: {
      behavioral: {
        score: 78,
        personalityMatch: 82,
        interestSimilarity: 75,
        communicationStyle: 80,
        lifestyleMatch: 74,
        insights: ['Compatible communication styles'],
      },
      western: {
        score: 88,
        aspects: [],
        elementCompatibility: 90,
        modalityCompatibility: 80,
        insights: ['Sun signs in trine — natural harmony'],
      },
      vedic: {
        totalScore: 26,
        normalizedScore: 72,
        kootas: [],
        doshas: [{ name: 'None', detected: false, severity: 'none', description: 'No doshas' }],
        verdict: 'good',
        insights: ['Good Vedic compatibility'],
      },
      chinese: {
        score: 85,
        animalCompatibility: 90,
        elementCompatibility: 80,
        yinYangBalance: 85,
        relationship: 'best_match',
        insights: ['Zodiac soulmates'],
      },
      profile: {
        score: 75,
        sharedInterests: ['Coffee', 'Hiking', 'Photography'],
        locationProximity: 80,
        ageCompatibility: 90,
        goalAlignment: 85,
      },
    },
    insights: [],
    strengths: ['Celestial harmony', 'Many shared interests', 'Compatible lifestyles'],
    challenges: ['Different social energy levels'],
    advice: ['Exceptional match — be open and authentic'],
    calculatedAt: new Date().toISOString(),
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Overall Score */}
      <View style={styles.overallSection}>
        <Text style={styles.sectionTitle}>{t('compatibility.overallScore')}</Text>
        <ScoreRing score={report.overallScore} size={180} />
        <Text style={styles.verdictText}>
          {report.overallScore >= 80 ? t('compatibility.excellent') :
           report.overallScore >= 60 ? t('compatibility.good') :
           t('compatibility.moderate')}
        </Text>
      </View>

      {/* Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('compatibility.whyYouMatch')}</Text>
        <View style={styles.breakdownCard}>
          <BreakdownBar label={t('compatibility.behavioral')} score={report.breakdown.behavioral.score} color={colors.primary[400]} />
          {report.breakdown.western && <BreakdownBar label={t('compatibility.western')} score={report.breakdown.western.score} color={colors.gold[300]} />}
          {report.breakdown.vedic && <BreakdownBar label={t('compatibility.vedic')} score={report.breakdown.vedic.normalizedScore} color="#ff9e99" />}
          {report.breakdown.chinese && <BreakdownBar label={t('compatibility.chinese')} score={report.breakdown.chinese.score} color="#10b981" />}
        </View>
      </View>

      {/* Strengths */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('compatibility.strengths')}</Text>
        {report.strengths.map((s, i) => (
          <View key={i} style={styles.insightRow}>
            <Text style={styles.insightIcon}>+</Text>
            <Text style={styles.insightText}>{s}</Text>
          </View>
        ))}
      </View>

      {/* Advice */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('compatibility.advice')}</Text>
        {report.advice.map((a, i) => (
          <View key={i} style={styles.adviceCard}>
            <Text style={styles.adviceText}>{a}</Text>
          </View>
        ))}
      </View>

      {/* Disclaimer — friendly but honest */}
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerEmoji}>*</Text>
        <Text style={styles.disclaimerText}>{t('compatibility.disclaimer')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f0f23' },
  content: { padding: 20, paddingBottom: 40 },
  overallSection: { alignItems: 'center', marginBottom: 32, paddingTop: 20 },
  section: { marginBottom: 28 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  verdictText: { color: colors.gold[300], fontSize: 18, fontWeight: '600', marginTop: 12 },
  scoreNumber: { fontSize: 48, fontWeight: '800' },
  scorePercent: { fontSize: 18, color: 'rgba(255,255,255,0.5)', marginTop: -4 },
  ringLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 8 },
  breakdownCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, gap: 16 },
  barContainer: { gap: 6 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  barScore: { fontSize: 14, fontWeight: '700' },
  barTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  insightRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  insightIcon: { color: '#10b981', fontSize: 18, fontWeight: '700', width: 20 },
  insightText: { color: 'rgba(255,255,255,0.8)', fontSize: 15, flex: 1 },
  adviceCard: { backgroundColor: 'rgba(108,92,231,0.15)', borderRadius: 12, padding: 16, borderLeftWidth: 3, borderLeftColor: colors.primary[500] },
  adviceText: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 22 },
  disclaimerCard: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  disclaimerEmoji: { color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 2 },
  disclaimerText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 18, flex: 1, fontStyle: 'italic' },
});
