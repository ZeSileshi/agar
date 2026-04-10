import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Text as SvgText, Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAMERA_SIZE = SCREEN_WIDTH - 48;

/* ------------------------------------------------------------------ */
/*  Palm line options                                                   */
/* ------------------------------------------------------------------ */

interface LineOption {
  value: string;
  label: string;
  description: string;
}

const HEART_LINE_OPTIONS: LineOption[] = [
  { value: 'long_curved', label: 'Long & Curved', description: 'Sweeps across palm in a wide curve' },
  { value: 'short_straight', label: 'Short & Straight', description: 'Short line, mostly straight' },
  { value: 'long_straight', label: 'Long & Straight', description: 'Reaches across palm, stays straight' },
  { value: 'curved_to_index', label: 'Curves to Index Finger', description: 'Curves upward toward index finger' },
  { value: 'curved_to_middle', label: 'Curves to Middle Finger', description: 'Curves upward toward middle finger' },
  { value: 'short', label: 'Short', description: 'Barely extends across the palm' },
];

const HEAD_LINE_OPTIONS: LineOption[] = [
  { value: 'long_straight', label: 'Long & Straight', description: 'Runs straight across the middle of palm' },
  { value: 'short', label: 'Short', description: 'Only extends partway across palm' },
  { value: 'curved', label: 'Curved', description: 'Curves downward toward the wrist' },
  { value: 'deep', label: 'Deep & Clear', description: 'Very visible, deeply etched line' },
  { value: 'wavy', label: 'Wavy', description: 'Undulates instead of staying straight' },
  { value: 'broken', label: 'Broken / Split', description: 'Has gaps or splits into branches' },
];

const LIFE_LINE_OPTIONS: LineOption[] = [
  { value: 'long_deep', label: 'Long & Deep', description: 'Sweeps wide around thumb, very clear' },
  { value: 'short_shallow', label: 'Short & Shallow', description: 'Faint and doesn\'t extend far' },
  { value: 'curved', label: 'Curved', description: 'Forms a wide semicircle around thumb' },
  { value: 'close_to_thumb', label: 'Close to Thumb', description: 'Stays tight near the thumb' },
  { value: 'wide_arc', label: 'Wide Arc', description: 'Arcs far out toward center of palm' },
  { value: 'broken', label: 'Broken / Split', description: 'Has breaks or branches off' },
];

const FATE_LINE_OPTIONS: LineOption[] = [
  { value: 'deep_clear', label: 'Deep & Clear', description: 'Runs straight up the center, very visible' },
  { value: 'broken', label: 'Broken', description: 'Has gaps or shifts direction' },
  { value: 'starts_from_life', label: 'From Life Line', description: 'Branches off from the life line' },
  { value: 'joins_life_middle', label: 'Joins Life Line', description: 'Merges with life line partway' },
  { value: 'faint', label: 'Faint / None', description: 'Hard to see or very light' },
];

interface StepConfig {
  key: string;
  title: string;
  aiTip: string;
  findIt: string;
  highlightLine: 'heart' | 'head' | 'life' | 'fate';
  options: LineOption[];
  optional?: boolean;
}

const STEPS: StepConfig[] = [
  {
    key: 'heart',
    title: 'Heart Line',
    aiTip: 'This line reveals your emotional nature and how you experience love.',
    findIt: 'The top horizontal line across your upper palm, just below your fingers.',
    highlightLine: 'heart',
    options: HEART_LINE_OPTIONS,
  },
  {
    key: 'head',
    title: 'Head Line',
    aiTip: 'This line reflects your thinking style — intuitive vs analytical.',
    findIt: 'The line running horizontally across the middle of your palm, just below the heart line.',
    highlightLine: 'head',
    options: HEAD_LINE_OPTIONS,
  },
  {
    key: 'life',
    title: 'Life Line',
    aiTip: 'Your life line shows vitality and energy — not lifespan, but how fully you live.',
    findIt: 'The curved line arcing around the base of your thumb.',
    highlightLine: 'life',
    options: LIFE_LINE_OPTIONS,
  },
  {
    key: 'fate',
    title: 'Fate Line',
    aiTip: 'The fate line reflects life direction and purpose. Not everyone has one — that\'s normal.',
    findIt: 'A vertical line running up the center of your palm toward your middle finger.',
    highlightLine: 'fate',
    options: FATE_LINE_OPTIONS,
    optional: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Types & Props                                                       */
/* ------------------------------------------------------------------ */

type Phase = 'camera' | 'analyzing' | 'lines';

interface PalmReading {
  heartLine: string;
  headLine: string;
  lifeLine: string;
  fateLine: string | null;
}

interface PalmScanScreenProps {
  onContinue: (palmReading: PalmReading | null) => void;
  onBack: () => void;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export default function PalmScanScreen({ onContinue, onBack }: PalmScanScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [phase, setPhase] = useState<Phase>('camera');
  const [stepIndex, setStepIndex] = useState(0);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selections, setSelections] = useState({
    heart: null as string | null,
    head: null as string | null,
    life: null as string | null,
    fate: null as string | null,
  });

  // Auto-capture readiness state
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(1)).current;
  const analyzeProgress = useRef(new Animated.Value(0)).current;

  // Pulsing ring animation for camera overlay
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1.06, duration: 1500, useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    ).start();
  }, [ringPulse]);

  // Start hold-to-capture countdown
  const startHold = useCallback(() => {
    if (isHolding) return;
    setIsHolding(true);
    setHoldProgress(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start();

    let elapsed = 0;
    holdTimerRef.current = setInterval(() => {
      elapsed += 100;
      setHoldProgress(elapsed / 2500);
      if (elapsed >= 2500) {
        clearInterval(holdTimerRef.current!);
        holdTimerRef.current = null;
        // Auto-capture
        capturePhoto();
      }
    }, 100);
  }, [isHolding]);

  const cancelHold = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
    progressAnim.setValue(0);
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, [progressAnim]);

  const capturePhoto = async () => {
    if (!cameraRef.current) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo) {
      setPhotoUri(photo.uri);
      setPhase('analyzing');
      runAnalysis();
    }
  };

  // Simulate AI analysis with progress
  const runAnalysis = () => {
    analyzeProgress.setValue(0);
    Animated.timing(analyzeProgress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase('lines');
    });
  };

  const currentStep = STEPS[stepIndex]!;
  const stepKey = currentStep.key as keyof typeof selections;
  const selected = selections[stepKey];

  const handleSelect = (value: string) => {
    setSelections((prev) => ({ ...prev, [stepKey]: value }));
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onContinue({
        heartLine: selections.heart!,
        headLine: selections.head!,
        lifeLine: selections.life!,
        fateLine: selections.fate,
      });
    }
  };

  const handleBack = () => {
    if (phase === 'lines' && stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    } else if (phase === 'lines' && stepIndex === 0) {
      // Retake
      setPhase('camera');
      setPhotoUri(null);
      setHoldProgress(0);
      setIsHolding(false);
    } else {
      onBack();
    }
  };

  const handleSkipLine = () => {
    setSelections((prev) => ({ ...prev, [stepKey]: null }));
    handleNext();
  };

  const handleSkipAll = () => onContinue(null);

  const handleRetake = () => {
    setPhase('camera');
    setPhotoUri(null);
    setHoldProgress(0);
    setIsHolding(false);
    setStepIndex(0);
    setSelections({ heart: null, head: null, life: null, fate: null });
  };

  /* ---- Permission gates ---- */
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.loadingText}>Checking camera access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>{'<'} Back</Text>
          </TouchableOpacity>
          <View style={styles.centered}>
            <View style={styles.aiBadge}>
              <View style={styles.aiBadgeDot} />
              <Text style={styles.aiBadgeText}>AI Palm Reading</Text>
            </View>
            <Text style={styles.permTitle}>Camera Access Needed</Text>
            <Text style={styles.permSubtitle}>
              Our AI needs to photograph your palm to detect and analyze your lines automatically.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
              <Text style={styles.primaryBtnText}>Allow Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkipAll}>
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ---- Camera phase ---- */
  if (phase === 'camera') {
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>{'<'} Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.cameraHeader}>
            <View style={styles.aiBadge}>
              <View style={styles.aiBadgeDot} />
              <Text style={styles.aiBadgeText}>AI Palm Reading</Text>
            </View>
            <Text style={styles.cameraTitle}>Position Your Palm</Text>
            <Text style={styles.cameraSubtitle}>
              Place your open palm inside the guide. Hold steady — AI will capture when ready.
            </Text>
          </View>

          {/* Camera with overlay */}
          <View style={styles.cameraContainer}>
            <Animated.View style={[styles.cameraRing, { transform: [{ scale: ringPulse }] }]}>
              <View style={styles.cameraView}>
                <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

                {/* Hand silhouette overlay */}
                <View style={styles.handOverlay}>
                  <PalmGuideSvg size={CAMERA_SIZE * 0.65} isActive={isHolding} progress={holdProgress} />
                </View>

                {/* Corner guides */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
            </Animated.View>

            {/* Hold progress bar */}
            {isHolding && (
              <View style={styles.holdBarWrap}>
                <Animated.View style={[styles.holdBar, { width: progressWidth }]} />
              </View>
            )}
          </View>

          {/* Status text */}
          <Text style={styles.statusText}>
            {isHolding
              ? holdProgress < 0.5
                ? 'Detecting palm... hold steady'
                : holdProgress < 0.9
                  ? 'Almost there... keep holding'
                  : 'Capturing...'
              : 'Tap & hold the button when your palm is aligned'}
          </Text>

          {/* Capture button */}
          <View style={styles.buttonsBottom}>
            <TouchableOpacity
              style={[styles.captureBtn, isHolding && styles.captureBtnActive]}
              onPressIn={startHold}
              onPressOut={cancelHold}
              activeOpacity={0.9}
            >
              <View style={[styles.captureBtnInner, isHolding && styles.captureBtnInnerActive]}>
                {isHolding ? (
                  <Text style={styles.captureBtnText}>{Math.round(holdProgress * 100)}%</Text>
                ) : (
                  <Text style={styles.captureBtnText}>Hold to Scan</Text>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkipAll}>
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ---- Analyzing phase ---- */
  if (phase === 'analyzing') {
    const analyzeWidth = analyzeProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, styles.centered]}>
          {/* Captured palm thumbnail */}
          {photoUri && (
            <View style={styles.analyzePhotoWrap}>
              <Image source={{ uri: photoUri }} style={styles.analyzePhoto} />
              <View style={styles.analyzeScanLine}>
                <Animated.View
                  style={[
                    styles.scanLineBar,
                    {
                      width: analyzeWidth,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.aiBadge}>
            <View style={[styles.aiBadgeDot, styles.aiBadgeDotPulse]} />
            <Text style={styles.aiBadgeText}>AI Analyzing</Text>
          </View>

          <Text style={styles.analyzeTitle}>Reading Your Palm</Text>
          <Text style={styles.analyzeSubtitle}>
            Detecting heart line, head line, life line, and fate line...
          </Text>

          {/* Progress bar */}
          <View style={styles.analyzeBarWrap}>
            <Animated.View style={[styles.analyzeBar, { width: analyzeWidth }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ---- Line review phase ---- */
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>{'<'} Back</Text>
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.progressDot, i <= stepIndex && styles.progressDotActive]} />
          ))}
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Side-by-side: captured photo + reference diagram */}
          <View style={styles.referenceRow}>
            {photoUri && (
              <View style={styles.refCard}>
                <Image source={{ uri: photoUri }} style={styles.refPhoto} />
                <Text style={styles.refLabel}>Your Palm</Text>
              </View>
            )}
            <View style={styles.refCard}>
              <View style={styles.refDiagram}>
                <PalmLineSvg highlight={currentStep.highlightLine} size={100} />
              </View>
              <Text style={styles.refLabel}>AI Guide</Text>
            </View>
          </View>

          {/* AI guidance card */}
          <View style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <View style={styles.aiBadgeDot} />
              <Text style={styles.aiCardHeaderText}>AI Detected — {currentStep.title}</Text>
            </View>
            <Text style={styles.aiCardTip}>{currentStep.aiTip}</Text>
            <View style={styles.findItBox}>
              <Text style={styles.findItLabel}>Where to look</Text>
              <Text style={styles.findItText}>{currentStep.findIt}</Text>
            </View>
          </View>

          {/* Selection prompt */}
          <Text style={styles.selectPrompt}>Confirm what yours looks like:</Text>

          {/* Options */}
          <View style={styles.optionsGrid}>
            {currentStep.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionCard, selected === opt.value && styles.optionCardSelected]}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionLabel, selected === opt.value && styles.optionLabelSelected]}>
                  {opt.label}
                </Text>
                <Text style={styles.optionDesc}>{opt.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom buttons */}
        <View style={styles.buttonsBottom}>
          <TouchableOpacity
            style={[styles.primaryBtn, !selected && !currentStep.optional && styles.primaryBtnDisabled]}
            onPress={handleNext}
            disabled={!selected && !currentStep.optional}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>
              {stepIndex === STEPS.length - 1 ? 'Complete Reading' : 'Next Line'}
            </Text>
          </TouchableOpacity>
          <View style={styles.bottomRow}>
            {currentStep.optional && (
              <TouchableOpacity onPress={handleSkipLine}>
                <Text style={styles.skipLineBtnText}>I don't have this line</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleRetake}>
              <Text style={styles.retakeText}>Retake photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/*  Palm guide SVG — shown over camera as a hand silhouette             */
/* ------------------------------------------------------------------ */

function PalmGuideSvg({ size, isActive, progress }: { size: number; isActive: boolean; progress: number }) {
  const outlineColor = isActive
    ? `rgba(212,165,74,${0.3 + progress * 0.6})`
    : 'rgba(232,221,208,0.25)';

  return (
    <Svg width={size} height={size * 1.22} viewBox="0 0 512 625" fill="none">
      <Path
        d={`
          M 200 590
          C 170 580, 130 560, 115 530
          C 100 500, 95 460, 95 420
          L 75 420
          C 55 420, 40 410, 30 395
          C 18 375, 20 355, 35 340
          C 45 330, 60 330, 75 335
          L 95 342
          L 95 200
          C 95 180, 100 162, 112 152
          C 124 142, 138 142, 148 152
          C 158 162, 162 180, 162 200
          L 162 300
          L 170 300
          L 170 120
          C 170 95, 176 75, 190 65
          C 204 55, 220 55, 232 65
          C 244 75, 248 95, 248 120
          L 248 300
          L 256 300
          L 256 80
          C 256 55, 262 35, 276 25
          C 290 15, 306 15, 318 25
          C 330 35, 335 55, 335 80
          L 335 300
          L 343 300
          L 343 135
          C 343 112, 348 94, 360 84
          C 372 74, 386 74, 398 84
          C 410 94, 415 112, 415 135
          L 415 360
          C 415 380, 418 395, 425 405
          C 432 415, 438 410, 440 395
          L 448 340
          C 452 320, 462 308, 478 310
          C 494 312, 500 328, 496 348
          L 465 440
          C 445 490, 420 520, 390 545
          C 360 570, 330 585, 300 590
          Z
        `}
        stroke={outlineColor}
        strokeWidth={isActive ? 3 : 2}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={isActive ? '0' : '12 6'}
        fill="none"
      />

      {/* Show line hints when actively scanning */}
      {isActive && progress > 0.3 && (
        <>
          <Path d="M 130 370 C 170 345, 250 335, 340 355" stroke="rgba(212,165,74,0.3)" strokeWidth={1.5} strokeLinecap="round" fill="none" />
          <Path d="M 125 410 C 180 400, 260 395, 370 385" stroke="rgba(212,165,74,0.2)" strokeWidth={1.5} strokeLinecap="round" fill="none" />
          <Path d="M 200 320 C 185 380, 160 440, 140 500" stroke="rgba(212,165,74,0.2)" strokeWidth={1.5} strokeLinecap="round" fill="none" />
        </>
      )}
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Palm line reference SVG — shown during line review                  */
/* ------------------------------------------------------------------ */

function PalmLineSvg({ highlight, size }: { highlight: 'heart' | 'head' | 'life' | 'fate'; size: number }) {
  const lineColor = (line: string) => (highlight === line ? 'rgba(212,165,74,0.9)' : 'rgba(212,165,74,0.1)');
  const strokeW = (line: string) => (highlight === line ? 3 : 1.5);

  return (
    <Svg width={size} height={size * 1.22} viewBox="0 0 512 625" fill="none">
      <Path
        d={`
          M 200 590 C 170 580, 130 560, 115 530 C 100 500, 95 460, 95 420
          L 75 420 C 55 420, 40 410, 30 395 C 18 375, 20 355, 35 340
          C 45 330, 60 330, 75 335 L 95 342 L 95 200
          C 95 180, 100 162, 112 152 C 124 142, 138 142, 148 152
          C 158 162, 162 180, 162 200 L 162 300 L 170 300
          L 170 120 C 170 95, 176 75, 190 65 C 204 55, 220 55, 232 65
          C 244 75, 248 95, 248 120 L 248 300 L 256 300
          L 256 80 C 256 55, 262 35, 276 25 C 290 15, 306 15, 318 25
          C 330 35, 335 55, 335 80 L 335 300 L 343 300
          L 343 135 C 343 112, 348 94, 360 84 C 372 74, 386 74, 398 84
          C 410 94, 415 112, 415 135 L 415 360
          C 415 380, 418 395, 425 405 C 432 415, 438 410, 440 395
          L 448 340 C 452 320, 462 308, 478 310 C 494 312, 500 328, 496 348
          L 465 440 C 445 490, 420 520, 390 545
          C 360 570, 330 585, 300 590 Z
        `}
        stroke="rgba(232,221,208,0.15)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="rgba(232,221,208,0.02)"
      />
      <Path d="M 130 370 C 170 345, 250 335, 340 355" stroke={lineColor('heart')} strokeWidth={strokeW('heart')} strokeLinecap="round" fill="none" />
      <Path d="M 125 410 C 180 400, 260 395, 370 385" stroke={lineColor('head')} strokeWidth={strokeW('head')} strokeLinecap="round" fill="none" />
      <Path d="M 200 320 C 185 380, 160 440, 140 500" stroke={lineColor('life')} strokeWidth={strokeW('life')} strokeLinecap="round" fill="none" />
      <Path d="M 260 500 C 258 460, 255 420, 250 370" stroke={lineColor('fate')} strokeWidth={strokeW('fate')} strokeLinecap="round" strokeDasharray={highlight === 'fate' ? '0' : '6 4'} fill="none" />
      {highlight && (
        <SvgText
          x={highlight === 'life' ? 100 : highlight === 'fate' ? 310 : 240}
          y={highlight === 'heart' ? 322 : highlight === 'head' ? 430 : highlight === 'life' ? 425 : 465}
          fill="rgba(212,165,74,0.9)"
          fontSize="20"
          fontWeight="bold"
          textAnchor="middle"
        >
          {highlight === 'heart' ? 'Heart' : highlight === 'head' ? 'Head' : highlight === 'life' ? 'Life' : 'Fate'}
        </SvgText>
      )}
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 8,
  },
  backBtnText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 16,
    color: colors.goldLight,
  },
  loadingText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },

  /* ---- Permission ---- */
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.25)',
    backgroundColor: 'rgba(212,165,74,0.06)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  aiBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  aiBadgeDotPulse: {
    opacity: 0.7,
  },
  aiBadgeText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 13,
    color: colors.gold,
    letterSpacing: 0.3,
  },
  permTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    color: '#faf5eb',
    textAlign: 'center',
  },
  permSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: 'rgba(232,221,208,0.5)',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  /* ---- Camera phase ---- */
  cameraHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cameraTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: '#faf5eb',
    letterSpacing: -0.5,
  },
  cameraSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: 'rgba(232,221,208,0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
  cameraContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  cameraRing: {
    borderRadius: 28,
    padding: 3,
    borderWidth: 2,
    borderColor: 'rgba(212,165,74,0.2)',
  },
  cameraView: {
    width: CAMERA_SIZE - 10,
    height: CAMERA_SIZE - 10,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  handOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: colors.gold,
    zIndex: 2,
  },
  cornerTL: { top: 14, left: 14, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 8 },
  cornerTR: { top: 14, right: 14, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 8 },
  cornerBL: { bottom: 14, left: 14, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 14, right: 14, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 8 },
  holdBarWrap: {
    width: CAMERA_SIZE - 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(232,221,208,0.1)',
    marginTop: 12,
    overflow: 'hidden',
  },
  holdBar: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  statusText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
    color: 'rgba(232,221,208,0.5)',
    textAlign: 'center',
    marginTop: 12,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(212,165,74,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  captureBtnActive: {
    borderColor: colors.gold,
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212,165,74,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInnerActive: {
    backgroundColor: 'rgba(212,165,74,0.3)',
  },
  captureBtnText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 12,
    color: colors.gold,
    textAlign: 'center',
  },

  /* ---- Analyzing phase ---- */
  analyzePhotoWrap: {
    width: 180,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(212,165,74,0.2)',
    marginBottom: 8,
  },
  analyzePhoto: {
    width: '100%',
    height: '100%',
  },
  analyzeScanLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(212,165,74,0.1)',
  },
  scanLineBar: {
    height: '100%',
    backgroundColor: colors.gold,
  },
  analyzeTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: '#faf5eb',
    letterSpacing: -0.5,
  },
  analyzeSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: 'rgba(232,221,208,0.5)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  analyzeBarWrap: {
    width: SCREEN_WIDTH - 100,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(232,221,208,0.1)',
    overflow: 'hidden',
    marginTop: 8,
  },
  analyzeBar: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 2,
  },

  /* ---- Line review phase ---- */
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  referenceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    justifyContent: 'center',
  },
  refCard: {
    alignItems: 'center',
    gap: 6,
  },
  refPhoto: {
    width: 110,
    height: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.1)',
  },
  refDiagram: {
    width: 110,
    height: 140,
    borderRadius: 14,
    backgroundColor: 'rgba(16,52,86,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refLabel: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiCard: {
    backgroundColor: 'rgba(212,165,74,0.06)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.15)',
    marginBottom: 14,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiCardHeaderText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 14,
    color: colors.gold,
  },
  aiCardTip: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: 'rgba(232,221,208,0.55)',
    lineHeight: 19,
    marginBottom: 10,
  },
  findItBox: {
    backgroundColor: 'rgba(232,221,208,0.04)',
    borderRadius: 10,
    padding: 10,
  },
  findItLabel: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  findItText: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: 'rgba(232,221,208,0.65)',
    lineHeight: 17,
  },
  selectPrompt: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 14,
    color: 'rgba(232,221,208,0.5)',
    marginBottom: 8,
  },
  optionsGrid: {
    gap: 8,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(232,221,208,0.06)',
  },
  optionCardSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,165,74,0.08)',
  },
  optionLabel: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 15,
    color: colors.text,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: colors.gold,
  },
  optionDesc: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },

  /* ---- Shared buttons ---- */
  buttonsBottom: {
    paddingTop: 12,
    paddingBottom: 32,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(212,165,74,0.3)',
    shadowOpacity: 0,
  },
  primaryBtnText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 17,
    color: colors.background,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipBtnText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  skipLineBtnText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  retakeText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.gold,
    textDecorationLine: 'underline',
  },
});
