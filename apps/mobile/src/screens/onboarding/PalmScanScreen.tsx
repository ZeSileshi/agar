import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAMERA_SIZE = SCREEN_WIDTH - 80;

/* ---------- Palm line data (mirrors palmistry.ts types) ---------- */

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
  { value: 'starts_from_life', label: 'Starts from Life Line', description: 'Branches off from the life line' },
  { value: 'joins_life_middle', label: 'Joins Life Line', description: 'Merges with life line partway' },
  { value: 'faint', label: 'Faint / Barely Visible', description: 'Hard to see or very light' },
];

interface StepConfig {
  key: string;
  title: string;
  subtitle: string;
  highlightLine: 'heart' | 'head' | 'life' | 'fate';
  options: LineOption[];
  optional?: boolean;
}

const STEPS: StepConfig[] = [
  {
    key: 'heart',
    title: 'Heart Line',
    subtitle: 'The top horizontal line across your upper palm. It reveals your emotional style.',
    highlightLine: 'heart',
    options: HEART_LINE_OPTIONS,
  },
  {
    key: 'head',
    title: 'Head Line',
    subtitle: 'The middle horizontal line below the heart line. It reflects how you think.',
    highlightLine: 'head',
    options: HEAD_LINE_OPTIONS,
  },
  {
    key: 'life',
    title: 'Life Line',
    subtitle: 'The curved line arcing around your thumb. It shows your vitality and energy.',
    highlightLine: 'life',
    options: LIFE_LINE_OPTIONS,
  },
  {
    key: 'fate',
    title: 'Fate Line (Optional)',
    subtitle: 'A vertical line running up the center of your palm. Not everyone has one — skip if you can\'t see it.',
    highlightLine: 'fate',
    options: FATE_LINE_OPTIONS,
    optional: true,
  },
];

/* ---------- Props ---------- */

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

/* ---------- Component ---------- */

export default function PalmScanScreen({ onContinue, onBack }: PalmScanScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // 'camera' → capture photo, then step 0-3 for each line
  const [phase, setPhase] = useState<'camera' | 'lines'>('camera');
  const [stepIndex, setStepIndex] = useState(0);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selections, setSelections] = useState({
    heart: null as string | null,
    head: null as string | null,
    life: null as string | null,
    fate: null as string | null,
  });

  const currentStep = STEPS[stepIndex]!;

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    if (photo) {
      setPhotoUri(photo.uri);
      setPhase('lines');
    }
  };

  const stepKey = currentStep.key as keyof typeof selections;

  const handleSelect = (value: string) => {
    setSelections((prev) => ({ ...prev, [stepKey]: value }));
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Done — pass reading to parent
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
      setPhase('camera');
      setPhotoUri(null);
    } else {
      onBack();
    }
  };

  const handleSkipLine = () => {
    setSelections((prev) => ({ ...prev, [stepKey]: null }));
    handleNext();
  };

  const handleSkipAll = () => {
    onContinue(null);
  };

  // --- Permission states ---
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.subheading}>Checking camera access...</Text>
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
            <Text style={styles.heading}>Camera Access Needed</Text>
            <Text style={[styles.subheading, { textAlign: 'center' }]}>
              Take a photo of your palm so you can compare it with the reference guides.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
              <Text style={styles.primaryBtnText}>Grant Access</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkipAll}>
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- Camera phase ---
  if (phase === 'camera') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>{'<'} Back</Text>
          </TouchableOpacity>

          <View style={styles.progressRow}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.progressDot, i === 0 && styles.progressDotActive]} />
            ))}
          </View>

          <Text style={styles.heading}>Scan Your Palm</Text>
          <Text style={styles.subheading}>
            Take a photo of your open palm in good lighting. You'll use it to identify your lines.
          </Text>

          <View style={styles.cameraContainer}>
            <View style={styles.cameraView}>
              <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

              {/* Hand guide overlay */}
              <View style={styles.handGuideOverlay}>
                <PalmHandSvg highlight={null} size={180} />
              </View>

              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />

              <Text style={styles.cameraInstruction}>
                Place your open palm in the frame
              </Text>
            </View>
          </View>

          <View style={styles.buttonsBottom}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCapture} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkipAll}>
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- Line selection phase ---
  const selected = selections[stepKey];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>{'<'} Back</Text>
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.progressDot, i <= stepIndex && styles.progressDotActive]} />
          ))}
        </View>

        <Text style={styles.heading}>{currentStep.title}</Text>
        <Text style={styles.subheading}>{currentStep.subtitle}</Text>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Side-by-side: user photo + reference diagram */}
          <View style={styles.referenceRow}>
            {photoUri && (
              <View style={styles.photoThumb}>
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
                <Text style={styles.photoLabel}>Your palm</Text>
              </View>
            )}
            <View style={styles.diagramThumb}>
              <PalmHandSvg highlight={currentStep.highlightLine} size={140} />
              <Text style={styles.photoLabel}>Reference</Text>
            </View>
          </View>

          {/* Options */}
          <View style={styles.optionsGrid}>
            {currentStep.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionCard,
                  selected === opt.value && styles.optionCardSelected,
                ]}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    selected === opt.value && styles.optionLabelSelected,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.optionDesc}>{opt.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonsBottom}>
          <TouchableOpacity
            style={[styles.primaryBtn, !selected && !currentStep.optional && styles.primaryBtnDisabled]}
            onPress={handleNext}
            disabled={!selected && !currentStep.optional}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>
              {stepIndex === STEPS.length - 1 ? 'Finish Reading' : 'Next'}
            </Text>
          </TouchableOpacity>
          {currentStep.optional && (
            <TouchableOpacity style={styles.skipLineBtn} onPress={handleSkipLine}>
              <Text style={styles.skipLineBtnText}>I don't have this line</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ---------- Palm SVG with line highlighting ---------- */

function PalmHandSvg({ highlight, size }: { highlight: 'heart' | 'head' | 'life' | 'fate' | null; size: number }) {
  const dim = (line: string) => (highlight && highlight !== line ? 0.08 : 0.35);
  const bright = (line: string) => (highlight === line ? 'rgba(212,165,74,0.9)' : `rgba(212,165,74,${dim(line)})`);
  const strokeW = (line: string) => (highlight === line ? 3 : 1.5);

  return (
    <Svg width={size} height={size * 1.22} viewBox="0 0 512 625" fill="none">
      {/* Hand outline */}
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
        stroke={highlight ? 'rgba(232,221,208,0.2)' : 'rgba(232,221,208,0.35)'}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="rgba(232,221,208,0.04)"
      />

      {/* Heart line */}
      <Path
        d="M 130 370 C 170 345, 250 335, 340 355"
        stroke={bright('heart')}
        strokeWidth={strokeW('heart')}
        strokeLinecap="round"
        fill="none"
      />
      {highlight === 'heart' && (
        <SvgText x="235" y="322" fill="rgba(212,165,74,0.9)" fontSize="22" fontWeight="bold" textAnchor="middle">
          Heart Line
        </SvgText>
      )}

      {/* Head line */}
      <Path
        d="M 125 410 C 180 400, 260 395, 370 385"
        stroke={bright('head')}
        strokeWidth={strokeW('head')}
        strokeLinecap="round"
        fill="none"
      />
      {highlight === 'head' && (
        <SvgText x="250" y="430" fill="rgba(212,165,74,0.9)" fontSize="22" fontWeight="bold" textAnchor="middle">
          Head Line
        </SvgText>
      )}

      {/* Life line */}
      <Path
        d="M 200 320 C 185 380, 160 440, 140 500"
        stroke={bright('life')}
        strokeWidth={strokeW('life')}
        strokeLinecap="round"
        fill="none"
      />
      {highlight === 'life' && (
        <SvgText x="100" y="430" fill="rgba(212,165,74,0.9)" fontSize="22" fontWeight="bold" textAnchor="middle">
          Life Line
        </SvgText>
      )}

      {/* Fate line */}
      <Path
        d="M 260 500 C 258 460, 255 420, 250 370"
        stroke={bright('fate')}
        strokeWidth={strokeW('fate')}
        strokeLinecap="round"
        strokeDasharray={highlight === 'fate' ? '0' : '6 4'}
        fill="none"
      />
      {highlight === 'fate' && (
        <SvgText x="310" y="470" fill="rgba(212,165,74,0.9)" fontSize="22" fontWeight="bold" textAnchor="middle">
          Fate Line
        </SvgText>
      )}
    </Svg>
  );
}

/* ---------- Styles ---------- */

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 16,
    color: colors.goldLight,
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
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
    fontSize: 26,
    fontWeight: '700',
    color: colors.goldLight,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: 16,
  },

  // Camera phase
  cameraContainer: {
    alignItems: 'center',
    marginBottom: 20,
    flex: 1,
  },
  cameraView: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(232,221,208,0.1)',
    backgroundColor: '#000',
    position: 'relative',
  },
  handGuideOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.goldLight,
    zIndex: 2,
  },
  cornerTopLeft: {
    top: 16,
    left: 16,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 16,
    right: 16,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomRightRadius: 8,
  },
  cameraInstruction: {
    position: 'absolute',
    bottom: 28,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    zIndex: 2,
  },

  // Line selection phase
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  referenceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  photoThumb: {
    alignItems: 'center',
    gap: 6,
  },
  photoImage: {
    width: 120,
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.1)',
  },
  diagramThumb: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,52,86,0.5)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.08)',
  },
  photoLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsGrid: {
    gap: 10,
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 3,
  },
  optionLabelSelected: {
    color: colors.gold,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },

  // Buttons
  buttonsBottom: {
    paddingTop: 12,
    paddingBottom: 32,
    gap: 10,
  },
  primaryBtn: {
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
  primaryBtnDisabled: {
    backgroundColor: 'rgba(212,165,74,0.3)',
    shadowOpacity: 0,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.background,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipBtnText: {
    fontSize: 15,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  skipLineBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  skipLineBtnText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
