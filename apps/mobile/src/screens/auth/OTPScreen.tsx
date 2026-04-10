import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/auth-store';

const OTP_LENGTH = 6;
const RESEND_INTERVAL = 60;

interface OTPScreenProps {
  onVerified: () => void;
  onBack: () => void;
}

export default function OTPScreen({ onVerified, onBack }: OTPScreenProps) {
  const { phone, setOtp } = useAuthStore();
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [resendTimer, setResendTimer] = useState(RESEND_INTERVAL);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = useCallback(
    async (fullCode: string) => {
      setIsVerifying(true);
      setOtp(fullCode);

      // Verify OTP via Supabase
      const { verifyOtp } = useAuthStore.getState();
      const { error } = await verifyOtp(phone, fullCode);

      setIsVerifying(false);

      if (error) {
        Alert.alert('Verification Failed', error);
        setCode(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        setFocusedIndex(0);
        return;
      }

      onVerified();
    },
    [phone, setOtp, onVerified]
  );

  const handleDigitChange = (text: string, index: number) => {
    // Handle paste of full code
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);

      const nextFocus = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      setFocusedIndex(nextFocus);

      // Auto-submit if all digits filled
      if (newCode.every((d) => d !== '')) {
        handleVerify(newCode.join(''));
      }
      return;
    }

    const digit = text.replace(/\D/g, '');
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    // Auto-submit on last digit
    if (digit && index === OTP_LENGTH - 1 && newCode.every((d) => d !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(RESEND_INTERVAL);
    setCode(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    setFocusedIndex(0);

    // Resend OTP via Supabase
    const { sendOtp } = useAuthStore.getState();
    const { error } = await sendOtp(phone);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Code Sent', 'A new verification code has been sent.');
    }
  };

  const maskedPhone =
    phone.length > 4
      ? phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4)
      : phone;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>{'<'} Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <Text style={styles.heading}>Verify Your Number</Text>
          <Text style={styles.subheading}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
          </Text>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {code.map((digit, index) => (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  focusedIndex === index && styles.otpBoxFocused,
                  digit !== '' && styles.otpBoxFilled,
                ]}
              >
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleDigitChange(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  onFocus={() => setFocusedIndex(index)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  autoFocus={index === 0}
                  editable={!isVerifying}
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>

          {/* Verifying indicator */}
          {isVerifying && (
            <Text style={styles.verifyingText}>Verifying...</Text>
          )}

          {/* Resend */}
          <View style={styles.resendContainer}>
            {resendTimer > 0 ? (
              <Text style={styles.resendTimer}>
                Resend code in{' '}
                <Text style={styles.resendTimerHighlight}>
                  {resendTimer}s
                </Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 24,
  },
  backBtnText: {
    fontSize: 16,
    color: colors.goldLight,
    fontWeight: '500',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.goldLight,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: 40,
  },
  phoneHighlight: {
    color: colors.text,
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(232,221,208,0.15)',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFocused: {
    borderColor: colors.goldLight,
    backgroundColor: 'rgba(212,165,74,0.08)',
  },
  otpBoxFilled: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,165,74,0.05)',
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.goldLight,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  verifyingText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.gold,
    fontWeight: '500',
    marginBottom: 16,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendTimer: {
    fontSize: 14,
    color: colors.textMuted,
  },
  resendTimerHighlight: {
    color: colors.goldLight,
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 15,
    color: colors.goldLight,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
