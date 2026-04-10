import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

interface LockScreenProps {
  onUnlocked: () => void;
  onLogout: () => void;
}

export default function LockScreen({ onUnlocked, onLogout }: LockScreenProps) {
  const [authType, setAuthType] = useState<string>('device passcode');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometricType();
    // Auto-prompt on mount
    authenticate();
  }, []);

  const checkBiometricType = async () => {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      setAuthType('Face ID');
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      setAuthType('fingerprint');
    } else {
      setAuthType('device passcode');
    }
  };

  const authenticate = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      // Fallback: device has no biometric — use device passcode
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Agar',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      setIsAuthenticating(false);
      if (result.success) {
        onUnlocked();
      }
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Agar',
      subtitle: 'Use biometrics or your device PIN to continue',
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    setIsAuthenticating(false);

    if (result.success) {
      onUnlocked();
    } else if (result.error === 'user_cancel') {
      // User cancelled — stay on lock screen
    } else if (result.error) {
      Alert.alert('Authentication Failed', 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* App branding */}
        <View style={styles.brandSection}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Agar</Text>
        </View>

        {/* Lock message */}
        <View style={styles.lockSection}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Welcome Back</Text>
          <Text style={styles.lockSubtitle}>
            Use {authType} to unlock your account
          </Text>
        </View>

        {/* Unlock button */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.unlockBtn}
            onPress={authenticate}
            activeOpacity={0.8}
            disabled={isAuthenticating}
          >
            <Text style={styles.unlockBtnText}>
              {isAuthenticating ? 'Authenticating...' : `Unlock with ${authType}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'This will sign you out. You\'ll need to verify your phone number again.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive', onPress: onLogout },
                ],
              );
            }}
          >
            <Text style={styles.logoutText}>Use a different account</Text>
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
    paddingHorizontal: 32,
    justifyContent: 'center',
  },

  // Brand
  brandSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: 12,
  },
  appName: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    color: colors.goldLight,
    letterSpacing: -0.5,
  },
  // Lock
  lockSection: {
    alignItems: 'center',
    marginBottom: 48,
    gap: 8,
  },
  lockIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  lockTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: '#faf5eb',
  },
  lockSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: 'rgba(232,221,208,0.5)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Actions
  actions: {
    gap: 16,
    alignItems: 'center',
  },
  unlockBtn: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 17,
    alignSelf: 'stretch',
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  unlockBtnText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 17,
    color: colors.background,
  },
  logoutBtn: {
    paddingVertical: 8,
  },
  logoutText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
