import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Border, CategoryColors, Colors, Radius } from '@/constants/theme';
import type { Category } from '@/logic/types';

import { AppText } from './text';

const BADGE_TONES = {
  gold: { bg: Colors.mustard500, fg: Colors.ink },
  green: { bg: Colors.money100, fg: Colors.money600 },
  red: { bg: Colors.red100, fg: Colors.red500 },
  neutral: { bg: Colors.oat200, fg: Colors.inkSoft },
  dark: { bg: Colors.night700, fg: Colors.mustard300 },
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

/** Small uppercase status badge ("BEST DEAL", "MISSING 2", "STALE"). */
export function Badge({ children, tone = 'neutral' }: { children: string; tone?: BadgeTone }) {
  const t = BADGE_TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <AppText variant="label" style={{ color: t.fg, fontSize: 11, textTransform: 'uppercase' }}>
        {children}
      </AppText>
    </View>
  );
}

/** Sentence-case pill used for reasons and soft tags. */
export function Pill({ children, icon: Icon, tone = 'neutral' }: { children: string; icon?: LucideIcon; tone?: BadgeTone }) {
  const t = BADGE_TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      {Icon ? <Icon size={13} color={t.fg} /> : null}
      <AppText variant="xs" style={{ color: t.fg, fontFamily: 'SplineSans_600SemiBold' }}>
        {children}
      </AppText>
    </View>
  );
}

/** Selectable chip for filters. */
export function Chip({
  label,
  selected,
  onPress,
  category,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  category?: Category;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? Colors.night900 : Colors.surfaceRaised,
          borderColor: selected ? Colors.night900 : Colors.borderStrong,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      {category ? <Swatch category={category} size={10} /> : null}
      <AppText variant="label" style={{ color: selected ? Colors.white : Colors.textPrimary }}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Category swatch: a 6px-radius colored square (no product photos ship). */
export function Swatch({ category, size = 40 }: { category: Category; size?: number }) {
  const c = CategoryColors[category];
  if (size <= 14) return <View style={{ width: size, height: size, borderRadius: 3, backgroundColor: c.swatch }} />;
  return (
    <View style={[styles.swatchTile, { width: size, height: size, backgroundColor: c.bg }]}>
      <View style={{ width: size * 0.4, height: size * 0.4, borderRadius: Radius.xs, backgroundColor: c.swatch }} />
    </View>
  );
}

export function ProgressBar({ value, tone = Colors.money600 }: { value: number; tone?: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.progressTrack}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: tone, borderRadius: Radius.pill }} />
    </View>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyDisc}>
        <Icon size={28} color={Colors.night700} />
      </View>
      <AppText variant="h3" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText variant="sm" tone="secondary" style={{ textAlign: 'center' }}>
        {body}
      </AppText>
      {action}
    </View>
  );
}

/** Inline notice for errors and status (persistence failures, simulated reminders). */
export function Notice({
  tone = 'info',
  icon: Icon,
  title,
  body,
  action,
}: {
  tone?: 'info' | 'error' | 'success';
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  const palette =
    tone === 'error'
      ? { bg: Colors.red100, fg: Colors.red500 }
      : tone === 'success'
        ? { bg: Colors.money100, fg: Colors.money600 }
        : { bg: Colors.sage300, fg: Colors.night900 };
  return (
    <View style={[styles.notice, { backgroundColor: palette.bg }]} accessibilityRole="alert">
      {Icon ? <Icon size={20} color={palette.fg} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="smStrong" style={{ color: palette.fg }}>
          {title}
        </AppText>
        {body ? (
          <AppText variant="xs" tone="secondary">
            {body}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    borderWidth: Border.width,
    paddingHorizontal: 14,
    height: 36,
  },
  swatchTile: { borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 8, borderRadius: Radius.pill, backgroundColor: Colors.oat200, overflow: 'hidden' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 28, paddingHorizontal: 24 },
  emptyDisc: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.sage300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: Radius.md, padding: 12 },
});
