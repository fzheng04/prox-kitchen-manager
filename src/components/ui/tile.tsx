import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Border, Colors, Fonts, Radius, ShadowDepth } from '@/constants/theme';

import { AppText } from './text';

/**
 * The design system's tile: 2px ink outline plus a straight-down, unblurred ink shadow.
 * The shadow is a real ink block under the surface (works the same on iOS, Android and web).
 * Pressing drops the surface by the shadow height and collapses the shadow.
 */
export function Tile({
  children,
  pressed = false,
  depth = ShadowDepth.md,
  radius = Radius.lg,
  fill = Colors.surfaceRaised,
  style,
  innerStyle,
}: {
  children: ReactNode;
  pressed?: boolean;
  depth?: number;
  radius?: number;
  fill?: string;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        { borderRadius: radius, backgroundColor: Colors.ink, paddingBottom: pressed ? 0 : depth, marginTop: pressed ? depth : 0 },
        style,
      ]}>
      <View
        style={[
          { borderRadius: radius, borderWidth: Border.width, borderColor: Colors.borderStrong, backgroundColor: fill },
          innerStyle,
        ]}>
        {children}
      </View>
    </View>
  );
}

const BUTTON_VARIANTS = {
  primary: { bg: Colors.accent, bgPressed: Colors.accentPressed, fg: Colors.white },
  dark: { bg: Colors.surfaceDeep, bgPressed: Colors.night800, fg: Colors.white },
  secondary: { bg: Colors.surfaceRaised, bgPressed: Colors.oat100, fg: Colors.textPrimary },
  ghost: { bg: 'transparent', bgPressed: Colors.oat200, fg: Colors.textPrimary },
} as const;

const BUTTON_SIZES = { sm: { h: 36, px: 14, fs: 13 }, md: { h: 48, px: 20, fs: 15 }, lg: { h: 56, px: 26, fs: 18 } } as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled,
  fullWidth,
  accessibilityLabel,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  icon?: LucideIcon;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const v = BUTTON_VARIANTS[variant];
  const s = BUTTON_SIZES[size];
  const content = (pressed: boolean) => (
    <View style={[styles.buttonRow, { height: s.h, paddingHorizontal: s.px, backgroundColor: pressed ? v.bgPressed : v.bg }]}>
      {Icon ? <Icon size={s.fs + 3} color={v.fg} strokeWidth={2.25} /> : null}
      <AppText variant="label" style={{ fontSize: s.fs, color: v.fg, fontFamily: Fonts.display }}>
        {label}
      </AppText>
    </View>
  );
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      style={[{ opacity: disabled ? 0.45 : 1, alignSelf: fullWidth ? 'stretch' : 'flex-start' }, style]}>
      {({ pressed }) =>
        variant === 'ghost' ? (
          <View style={{ borderRadius: Radius.md, overflow: 'hidden' }}>{content(pressed)}</View>
        ) : (
          <Tile pressed={pressed && !disabled} radius={Radius.md} fill={v.bg} innerStyle={{ overflow: 'hidden' }}>
            {content(pressed && !disabled)}
          </Tile>
        )
      }
    </Pressable>
  );
}

/** Square icon button. `glass` is the 14% white style for night headers. */
export function IconButton({
  icon: Icon,
  onPress,
  label,
  glass,
  size = 40,
}: {
  icon: LucideIcon;
  onPress?: () => void;
  label: string;
  glass?: boolean;
  size?: number;
}) {
  if (glass) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={4}
        style={({ pressed }) => [styles.glass, { width: size, height: size, opacity: pressed ? 0.7 : 1 }]}>
        <Icon size={20} color={Colors.white} />
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}>
      {({ pressed }) => (
        <Tile pressed={pressed} depth={ShadowDepth.sm} radius={Radius.sm}>
          <View style={{ width: size - 4, height: size - 6, alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={Colors.ink} />
          </View>
        </Tile>
      )}
    </Pressable>
  );
}

/** A static card surface with the tile outline and shadow. */
export function Card({ children, style, fill }: { children: ReactNode; style?: StyleProp<ViewStyle>; fill?: string }) {
  return (
    <Tile fill={fill ?? Colors.surfaceCard} style={style} innerStyle={{ overflow: 'hidden' }}>
      {children}
    </Tile>
  );
}

const styles = StyleSheet.create({
  buttonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  glass: {
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
