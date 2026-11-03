import { Minus, Plus, Search, X } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Border, Colors, Fonts, Radius } from '@/constants/theme';

import { AppText } from './text';

export function SearchField({
  value,
  onChangeText,
  placeholder,
  onSubmitEditing,
  autoFocus,
  testID,
}: Pick<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'onSubmitEditing' | 'autoFocus' | 'testID'>) {
  return (
    <View style={styles.search}>
      <Search size={18} color={Colors.textMuted} />
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textPlaceholder}
        onSubmitEditing={onSubmitEditing}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        style={styles.searchInput}
      />
      {value ? (
        <Pressable onPress={() => onChangeText?.('')} accessibilityLabel="Clear search" hitSlop={8}>
          <X size={18} color={Colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  dark,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  dark?: boolean;
}) {
  return (
    <View style={[styles.segment, dark && { backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'transparent' }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.segmentItem, active && { backgroundColor: dark ? Colors.mustard300 : Colors.night900 }]}>
            <AppText
              variant="label"
              style={{ color: active ? (dark ? Colors.ink : Colors.white) : dark ? Colors.textOnDarkMuted : Colors.textPrimary }}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function QuantityStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  unitLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  unitLabel?: string;
}) {
  const round = (n: number) => Math.round(n * 100) / 100;
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(Math.max(min, round(value - step)))}
        disabled={value <= min}
        accessibilityLabel="Decrease"
        hitSlop={6}
        style={[styles.stepButton, value <= min && { opacity: 0.35 }]}>
        <Minus size={16} color={Colors.ink} />
      </Pressable>
      <AppText variant="title" style={{ minWidth: 56, textAlign: 'center' }}>
        {round(value)}
        {unitLabel ? <AppText variant="xs" tone="secondary">{` ${unitLabel}`}</AppText> : null}
      </AppText>
      <Pressable onPress={() => onChange(round(value + step))} accessibilityLabel="Increase" hitSlop={6} style={styles.stepButton}>
        <Plus size={16} color={Colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: Border.width,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.white,
  },
  searchInput: { flex: 1, fontFamily: Fonts.body, fontSize: 16, color: Colors.textPrimary, height: '100%' },
  segment: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: Border.width,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.white,
    padding: 3,
    gap: 3,
  },
  segmentItem: { flex: 1, height: 34, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: Border.width,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.white,
    height: 40,
  },
  stepButton: { width: 38, height: '100%', alignItems: 'center', justifyContent: 'center' },
});
