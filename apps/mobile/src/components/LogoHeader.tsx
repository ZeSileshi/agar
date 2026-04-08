import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

interface LogoHeaderProps {
  size?: 'small' | 'large';
}

export default function LogoHeader({ size = 'small' }: LogoHeaderProps) {
  const isLarge = size === 'large';

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/icon.png')}
        style={isLarge ? styles.logoLarge : styles.logoSmall}
        resizeMode="contain"
      />
      {isLarge && (
        <>
          <Text style={styles.brandName}>Agar</Text>
          <Text style={styles.brandAmharic}>አጋር</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  logoLarge: {
    width: 120,
    height: 120,
    borderRadius: 28,
    marginBottom: 16,
  },
  brandName: {
    fontFamily: fontFamily.displayBold,
    fontSize: 38,
    color: colors.goldLight,
    letterSpacing: -1,
  },
  brandAmharic: {
    fontFamily: fontFamily.ethiopic,
    fontSize: 20,
    color: colors.gold,
    marginTop: 2,
    opacity: 0.7,
  },
});
