import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

interface LogoHeaderProps {
  size?: 'small' | 'large';
  showText?: boolean;
}

/**
 * Consistent logo matching the web nav:
 *  [logo.png] Agar አጋር
 */
export default function LogoHeader({ size = 'small', showText = true }: LogoHeaderProps) {
  const isLarge = size === 'large';

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/icon.png')}
        style={isLarge ? styles.logoLarge : styles.logoSmall}
        resizeMode="contain"
      />
      {showText && (
        <>
          <Text style={isLarge ? styles.brandNameLarge : styles.brandName}>Agar</Text>
          <Text style={isLarge ? styles.amharicLarge : styles.amharic}>አጋር</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Small — for screen headers (matches web nav)
  logoSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  brandName: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    color: colors.goldLight,
    letterSpacing: -0.5,
  },
  amharic: {
    fontFamily: fontFamily.ethiopic,
    fontSize: 12,
    color: colors.gold,
    opacity: 0.6,
    marginLeft: 2,
  },
  // Large — for splash/welcome
  logoLarge: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  brandNameLarge: {
    fontFamily: fontFamily.displayBold,
    fontSize: 21,
    color: colors.goldLight,
    letterSpacing: -0.5,
  },
  amharicLarge: {
    fontFamily: fontFamily.ethiopic,
    fontSize: 14,
    color: colors.gold,
    opacity: 0.6,
    marginLeft: 2,
  },
});
