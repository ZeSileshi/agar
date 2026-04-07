import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAMERA_SIZE = SCREEN_WIDTH - 80;

interface PalmScanScreenProps {
  onContinue: (palmPhotoUri: string | null) => void;
  onBack: () => void;
}

export default function PalmScanScreen({
  onContinue,
  onBack,
}: PalmScanScreenProps) {
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    // Mock capture - actual camera integration is future work
    setIsCapturing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCapturedUri('mock://palm-scan-captured');
    setIsCapturing(false);
  };

  const handleRetake = () => {
    setCapturedUri(null);
  };

  const handleContinue = () => {
    onContinue(capturedUri);
  };

  const handleSkip = () => {
    onContinue(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>{'<'} Back</Text>
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>

        {/* Header */}
        <Text style={styles.heading}>Scan Your Palm</Text>
        <Text style={styles.subheading}>
          Optional — adds palmistry-based compatibility insights to your profile
        </Text>

        {/* Camera View Placeholder */}
        <View style={styles.cameraContainer}>
          <View
            style={[
              styles.cameraView,
              capturedUri && styles.cameraViewCaptured,
            ]}
          >
            {capturedUri ? (
              <View style={styles.capturedOverlay}>
                <Text style={styles.checkmark}>{'\u2713'}</Text>
                <Text style={styles.capturedText}>Palm Captured</Text>
              </View>
            ) : (
              <>
                {/* Hand outline guide */}
                <View style={styles.handGuide}>
                  <Text style={styles.handIcon}>{'\u270B'}</Text>
                </View>

                {/* Corner guides */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />

                {/* Instruction */}
                <Text style={styles.cameraInstruction}>
                  {isCapturing
                    ? 'Hold still...'
                    : 'Place your open palm in the frame'}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            Our AI analyzes key lines on your palm to generate a unique
            compatibility signature. This is used alongside astrology and
            behavioral data for deeper matching accuracy.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {capturedUri ? (
            <>
              <TouchableOpacity
                style={styles.continueBtn}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.continueBtnText}>Continue with Scan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={handleRetake}
                activeOpacity={0.7}
              >
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.captureBtn,
                isCapturing && styles.captureBtnActive,
              ]}
              onPress={handleCapture}
              disabled={isCapturing}
              activeOpacity={0.8}
            >
              <View style={styles.captureBtnInner}>
                {isCapturing ? (
                  <Text style={styles.captureBtnText}>Scanning...</Text>
                ) : (
                  <Text style={styles.captureBtnText}>Take Photo</Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Skip */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipBtnText}>Skip for now</Text>
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
    paddingTop: 16,
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
    lineHeight: 22,
    marginBottom: 24,
  },
  cameraContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraView: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: 24,
    backgroundColor: 'rgba(16,52,86,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(232,221,208,0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  cameraViewCaptured: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,165,74,0.08)',
  },
  handGuide: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(232,221,208,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.08)',
    borderStyle: 'dashed',
  },
  handIcon: {
    fontSize: 72,
    opacity: 0.25,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.goldLight,
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
    color: colors.textMuted,
    fontWeight: '500',
  },
  capturedOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  checkmark: {
    fontSize: 48,
    color: colors.gold,
    fontWeight: '700',
  },
  capturedText: {
    fontSize: 18,
    color: colors.goldLight,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.06)',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.goldLight,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32,
    gap: 12,
  },
  captureBtn: {
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
  captureBtnActive: {
    backgroundColor: 'rgba(212,165,74,0.6)',
  },
  captureBtnInner: {
    alignItems: 'center',
  },
  captureBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.background,
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
  continueBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.background,
  },
  retakeBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(232,221,208,0.15)',
  },
  retakeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
});
