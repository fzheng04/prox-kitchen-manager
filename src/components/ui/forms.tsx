import { Minus, Plus, Search, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Border, Colors, Fonts, Radius } from '@/constants/theme';
import { parseQuantity } from '@/logic/units';

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

/**
 * Quantity with -/+ buttons and a number you can tap to type. While typing, the field holds the
 * raw text; it's applied on blur or return. Text that isn't a valid number reverts to the old value.
 */
export function QuantityStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  unitLabel,
  label = 'Quantity',
}: {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  unitLabel?: string;
  /** Spoken name for the field, e.g. "Whole milk quantity". */
  label?: string;
}) {
  const round = (n: number) => Math.round(n * 100) / 100;
  // null while not editing, so the field always shows the current value (which can change with the clock).
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const next = parseQuantity(draft, min);
    if (next !== null && next !== round(value)) onChange(next);
    setDraft(null);
  };

  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(Math.max(min, round(value - step)))}
        disabled={value <= min}
        accessibilityLabel={`Decrease ${label.toLowerCase()}`}
        hitSlop={6}
        style={[styles.stepButton, value <= min && { opacity: 0.35 }]}>
        <Minus size={16} color={Colors.ink} />
      </Pressable>
      <View style={styles.stepValue}>
        <TextInput
          value={draft ?? String(round(value))}
          onChangeText={setDraft}
          onFocus={() => setDraft(String(round(value)))}
          onBlur={commit}
          onSubmitEditing={commit}
          keyboardType="decimal-pad"
          returnKeyType="done"
          selectTextOnFocus
          maxLength={7}
          accessibilityLabel={label}
          accessibilityHint="Type a number"
          style={[styles.stepInput, draft !== null && styles.stepInputEditing]}
        />
        {unitLabel ? (
          <AppText variant="xs" tone="secondary">
            {unitLabel}
          </AppText>
        ) : null}
      </View>
      <Pressable
        onPress={() => onChange(round(value + step))}
        accessibilityLabel={`Increase ${label.toLowerCase()}`}
        hitSlop={6}
        style={styles.stepButton}>
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
  stepValue: { flexDirection: 'row', alignItems: 'center', gap: 3, minWidth: 56, justifyContent: 'center' },
  stepInput: {
    minWidth: 30,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: Radius.sm,
    textAlign: 'center',
    fontFamily: Fonts.display,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  stepInputEditing: { backgroundColor: Colors.oat100 },
});
