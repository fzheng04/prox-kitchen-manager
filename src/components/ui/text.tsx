import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

const variants = StyleSheet.create({
  display: { fontFamily: Fonts.displayHeavy, fontSize: 28, lineHeight: 30, letterSpacing: -0.3 },
  h1: { fontFamily: Fonts.displayHeavy, fontSize: 26, lineHeight: 29 },
  h2: { fontFamily: Fonts.display, fontSize: 21, lineHeight: 24 },
  h3: { fontFamily: Fonts.display, fontSize: 18, lineHeight: 22 },
  title: { fontFamily: Fonts.display, fontSize: 17, lineHeight: 20 },
  body: { fontFamily: Fonts.body, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: Fonts.bodySemibold, fontSize: 16, lineHeight: 22 },
  sm: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 19 },
  smStrong: { fontFamily: Fonts.bodySemibold, fontSize: 14, lineHeight: 19 },
  xs: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: Fonts.display, fontSize: 13, lineHeight: 16, letterSpacing: 0.3 },
  price: { fontFamily: Fonts.display, fontSize: 18, lineHeight: 22 },
  priceXl: { fontFamily: Fonts.displayHeavy, fontSize: 40, lineHeight: 44 },
});

export type TextVariant = keyof typeof variants;

const tones = {
  primary: Colors.textPrimary,
  secondary: Colors.textSecondary,
  muted: Colors.textMuted,
  onDark: Colors.textOnDark,
  onDarkMuted: Colors.textOnDarkMuted,
  price: Colors.price,
  priceOnDark: Colors.priceOnDark,
  accent: Colors.accent,
  danger: Colors.danger,
} as const;

export type TextTone = keyof typeof tones;

export function AppText({
  variant = 'body',
  tone = 'primary',
  style,
  ...rest
}: TextProps & { variant?: TextVariant; tone?: TextTone }) {
  return <Text style={[variants[variant], { color: tones[tone] }, style]} {...rest} />;
}
