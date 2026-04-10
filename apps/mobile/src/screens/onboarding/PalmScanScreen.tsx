import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAMERA_SIZE = SCREEN_WIDTH - 48;

/* ------------------------------------------------------------------ */
/*  AI-detected reading result (simulated for now)                      */
/* ------------------------------------------------------------------ */

interface PalmReading {
  heartLine: string;
  headLine: string;
  lifeLine: string;
  fateLine: string | null;
}

const AI_RESULTS: { line: string; type: string; meaning: string }[] = [
  { line: 'Heart Line', type: 'Long & Curved', meaning: 'You love deeply and express emotions freely' },
  { line: 'Head Line', type: 'Long & Straight', meaning: 'Analytical thinker with clear focus' },
  { line: 'Life Line', type: 'Deep & Curved', meaning: 'Strong vitality and adventurous spirit' },
  { line: 'Fate Line', type: 'Clear', meaning: 'Strong sense of purpose and direction' },
];

type Phase = 'camera' | 'analyzing' | 'results';

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
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Hold-to-capture state
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(1)).current;

  // Analyze animation
  const analyzeProgress = useRef(new Animated.Value(0)).current;
  const [analyzeStep, setAnalyzeStep] = useState(0);

  // Results animations
  const resultsFade = useRef(new Animated.Value(0)).current;

  // Pulsing ring
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1.04, duration: 1500, useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    ).start();
  }, [ringPulse]);

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

  // Simulate AI analysis — steps through each line detection
  const runAnalysis = () => {
    analyzeProgress.setValue(0);
    setAnalyzeStep(0);

    // Step through line detections
    const stepTimers = [800, 1600, 2400, 3200];
    stepTimers.forEach((ms, i) => {
      setTimeout(() => {
        setAnalyzeStep(i + 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, ms);
    });

    Animated.timing(analyzeProgress, {
      toValue: 1,
      duration: 3800,
      useNativeDriver: false,
    }).start(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase('results');
      Animated.timing(resultsFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleFinish = () => {
    onContinue({
      heartLine: 'long_curved',
      headLine: 'long_straight',
      lifeLine: 'long_deep',
      fateLine: 'deep_clear',
    });
  };

  const handleRetake = () => {
    setPhase('camera');
    setPhotoUri(null);
    setHoldProgress(0);
    setIsHolding(false);
    setAnalyzeStep(0);
    resultsFade.setValue(0);
  };

  const handleSkipAll = () => onContinue(null);

  /* ---- Permission states ---- */
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, styles.centered]}>
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

          <View style={styles.cameraHeader}>
            <View style={styles.aiBadge}>
              <View style={styles.aiBadgeDot} />
              <Text style={styles.aiBadgeText}>AI Palm Reading</Text>
            </View>
            <Text style={styles.cameraTitle}>Position Your Palm</Text>
            <Text style={styles.cameraSubtitle}>
              Open your hand, palm facing the camera. Hold steady and AI will capture automatically.
            </Text>
          </View>

          <View style={styles.cameraContainer}>
            <Animated.View style={[styles.cameraRing, { transform: [{ scale: ringPulse }] }]}>
              <View style={styles.cameraView}>
                <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

                {/* Realistic hand silhouette overlay */}
                <View style={styles.handOverlay}>
                  <HandGuideSvg size={CAMERA_SIZE * 0.7} isActive={isHolding} progress={holdProgress} />
                </View>

                {/* Corner guides */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
            </Animated.View>

            {isHolding && (
              <View style={styles.holdBarWrap}>
                <Animated.View style={[styles.holdBar, { width: progressWidth }]} />
              </View>
            )}
          </View>

          <Text style={styles.statusText}>
            {isHolding
              ? holdProgress < 0.4
                ? 'Detecting palm... hold steady'
                : holdProgress < 0.8
                  ? 'Aligning... keep holding'
                  : 'Capturing...'
              : 'Tap & hold when your palm is aligned'}
          </Text>

          <View style={styles.buttonsBottom}>
            <TouchableOpacity
              style={[styles.captureBtn, isHolding && styles.captureBtnActive]}
              onPressIn={startHold}
              onPressOut={cancelHold}
              activeOpacity={0.9}
            >
              <View style={[styles.captureBtnInner, isHolding && styles.captureBtnInnerActive]}>
                <Text style={styles.captureBtnText}>
                  {isHolding ? `${Math.round(holdProgress * 100)}%` : 'Hold to Scan'}
                </Text>
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

    const lineNames = ['Heart Line', 'Head Line', 'Life Line', 'Fate Line'];

    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, styles.centered]}>
          {photoUri && (
            <View style={styles.analyzePhotoWrap}>
              <Image source={{ uri: photoUri }} style={styles.analyzePhoto} />
            </View>
          )}

          <View style={styles.aiBadge}>
            <View style={styles.aiBadgeDot} />
            <Text style={styles.aiBadgeText}>AI Analyzing</Text>
          </View>

          <Text style={styles.analyzeTitle}>Reading Your Palm</Text>

          {/* Line detection steps */}
          <View style={styles.analyzeSteps}>
            {lineNames.map((name, i) => (
              <View key={name} style={styles.analyzeStepRow}>
                <View style={[styles.analyzeStepDot, analyzeStep > i && styles.analyzeStepDotDone]} />
                <Text style={[styles.analyzeStepText, analyzeStep > i && styles.analyzeStepTextDone]}>
                  {analyzeStep > i ? `${name} detected` : analyzeStep === i ? `Scanning ${name.toLowerCase()}...` : name}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.analyzeBarWrap}>
            <Animated.View style={[styles.analyzeBar, { width: analyzeWidth }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ---- Results phase — AI shows what it found, no manual input ---- */
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.resultsFlex, { opacity: resultsFade }]}>
          {/* Header with photo */}
          <View style={styles.resultsHeader}>
            {photoUri && (
              <Image source={{ uri: photoUri }} style={styles.resultsPhoto} />
            )}
            <View style={styles.resultsHeaderText}>
              <View style={styles.aiBadge}>
                <View style={styles.aiBadgeDot} />
                <Text style={styles.aiBadgeText}>Reading Complete</Text>
              </View>
              <Text style={styles.resultsTitle}>Your Palm Reading</Text>
            </View>
          </View>

          {/* Detected lines */}
          <View style={styles.resultsCards}>
            {AI_RESULTS.map((result, i) => (
              <View key={result.line} style={styles.resultCard}>
                <View style={styles.resultCardTop}>
                  <View style={styles.resultDot} />
                  <Text style={styles.resultLineName}>{result.line}</Text>
                  <Text style={styles.resultType}>{result.type}</Text>
                </View>
                <Text style={styles.resultMeaning}>{result.meaning}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.resultsNote}>
            These readings will be used to enhance your compatibility matching.
          </Text>
        </Animated.View>

        <View style={styles.buttonsBottom}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRetake}>
            <Text style={styles.retakeText}>Retake photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/*  Realistic hand guide SVG for camera overlay                         */
/* ------------------------------------------------------------------ */

function HandGuideSvg({ size, isActive, progress }: { size: number; isActive: boolean; progress: number }) {
  const outlineColor = isActive
    ? `rgba(212,165,74,${0.3 + progress * 0.5})`
    : 'rgba(232,221,208,0.3)';

  // More realistic open hand — wider palm, natural finger spacing & proportions
  const handPath = `
    M 248 580
    C 220 575, 175 555, 150 520
    C 130 492, 120 455, 118 420
    C 116 395, 112 375, 100 365
    C 85 352, 68 345, 58 330
    C 45 310, 48 288, 62 278
    C 76 268, 92 275, 105 290
    L 118 310

    L 118 195
    C 118 168, 122 148, 132 138
    C 142 128, 154 130, 162 140
    C 170 152, 172 170, 172 195
    L 172 290

    L 185 290
    L 185 105
    C 185 72, 192 48, 206 38
    C 218 28, 232 30, 242 42
    C 250 54, 254 72, 254 105
    L 254 280

    L 270 280
    L 270 70
    C 270 38, 278 15, 292 6
    C 306 -3, 322 0, 332 12
    C 342 24, 346 45, 346 70
    L 346 280

    L 362 280
    L 362 115
    C 362 85, 368 62, 380 52
    C 392 42, 406 45, 414 56
    C 422 67, 426 85, 426 115
    L 426 345

    C 428 365, 435 380, 445 388
    C 455 396, 462 390, 466 375
    L 475 328
    C 480 308, 492 298, 506 302
    C 520 306, 524 322, 518 342
    L 490 425
    C 472 470, 450 505, 420 530
    C 390 555, 358 570, 330 578
    C 310 582, 275 583, 248 580
    Z
  `;

  return (
    <Svg width={size} height={size * 1.15} viewBox="0 0 580 670" fill="none">
      <Path
        d={handPath}
        stroke={outlineColor}
        strokeWidth={isActive ? 2.5 : 1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={isActive ? '0' : '10 6'}
        fill={isActive ? 'rgba(212,165,74,0.03)' : 'none'}
      />

      {/* Show palm line hints during active scan */}
      {isActive && progress > 0.3 && (
        <>
          {/* Heart line */}
          <Path
            d="M 140 385 C 200 365, 300 355, 400 370"
            stroke={`rgba(212,165,74,${0.15 + progress * 0.2})`}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          {/* Head line */}
          <Path
            d="M 145 420 C 220 410, 320 405, 410 400"
            stroke={`rgba(212,165,74,${0.1 + progress * 0.15})`}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          {/* Life line */}
          <Path
            d="M 215 335 C 195 390, 175 450, 155 510"
            stroke={`rgba(212,165,74,${0.1 + progress * 0.15})`}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        </>
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

  /* ---- Badge ---- */
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
  aiBadgeText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 13,
    color: colors.gold,
    letterSpacing: 0.3,
  },

  /* ---- Permission ---- */
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
    width: 160,
    height: 200,
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
  analyzeTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: '#faf5eb',
    letterSpacing: -0.5,
  },
  analyzeSteps: {
    gap: 10,
    width: '80%',
  },
  analyzeStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  analyzeStepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(232,221,208,0.2)',
    backgroundColor: 'transparent',
  },
  analyzeStepDotDone: {
    borderColor: colors.gold,
    backgroundColor: colors.gold,
  },
  analyzeStepText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: 'rgba(232,221,208,0.35)',
  },
  analyzeStepTextDone: {
    fontFamily: fontFamily.bodySemibold,
    color: 'rgba(232,221,208,0.7)',
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

  /* ---- Results phase ---- */
  resultsFlex: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  resultsPhoto: {
    width: 80,
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.2)',
  },
  resultsHeaderText: {
    flex: 1,
    gap: 8,
  },
  resultsTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: '#faf5eb',
    letterSpacing: -0.5,
  },
  resultsCards: {
    gap: 10,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: 'rgba(212,165,74,0.06)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.12)',
  },
  resultCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  resultLineName: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 15,
    color: colors.goldLight,
  },
  resultType: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.gold,
    marginLeft: 'auto',
  },
  resultMeaning: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: 'rgba(232,221,208,0.55)',
    lineHeight: 19,
    marginLeft: 16,
  },
  resultsNote: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: 'rgba(232,221,208,0.3)',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* ---- Shared buttons ---- */
  buttonsBottom: {
    paddingTop: 12,
    paddingBottom: 32,
    gap: 10,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
    alignSelf: 'stretch',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  retakeText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.gold,
    textDecorationLine: 'underline',
  },
});
