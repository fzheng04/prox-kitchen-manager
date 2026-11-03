import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

import { AppText } from './text';

/** Night header: left-aligned title, actions on the right, optional docked content below. */
export function AppHeader({
  title,
  subtitle,
  left,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        {left}
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="display" tone="onDark" accessibilityRole="header">
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="sm" tone="onDarkMuted" style={{ marginTop: 4 }}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {right ? <View style={styles.headerActions}>{right}</View> : null}
      </View>
      {children ? <View style={{ marginTop: 16 }}>{children}</View> : null}
    </View>
  );
}

/** Oat ground with a scrolling, width-capped content column. */
export function Screen({
  header,
  children,
  contentStyle,
}: {
  header?: ReactNode;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={styles.screen}>
      {header}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        // The iOS number pad has no return key, so scrolling is one way to finish typing a quantity.
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never">
        <View style={[styles.column, contentStyle]}>{children}</View>
      </ScrollView>
    </View>
  );
}

export function Section({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.sectionHead}>
        <AppText variant="h2" accessibilityRole="header" style={{ flex: 1 }}>
          {title}
        </AppText>
        {right}
      </View>
      {children}
    </View>
  );
}

export function Divider() {
  return <View style={{ height: 1.5, backgroundColor: Colors.borderSubtle }} />;
}

const styles = StyleSheet.create({
  header: { backgroundColor: Colors.surfaceHeader, paddingHorizontal: 18, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  screen: { flex: 1, backgroundColor: Colors.surfaceApp },
  scrollContent: { paddingBottom: 120 },
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.five,
    gap: Spacing.six,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
