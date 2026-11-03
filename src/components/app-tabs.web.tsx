import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { ChefHat, ListChecks, Scale, ShoppingCart, Sparkles, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Colors } from '@/constants/theme';

/** Web tab bar built with expo-router/ui. Keep in sync with the native app-tabs.tsx. */
export default function AppTabs() {
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList style={styles.bar}>
        <TabTrigger name="list" href="/list" asChild>
          <TabButton icon={ListChecks} label="List" />
        </TabTrigger>
        <TabTrigger name="compare" href="/compare" asChild>
          <TabButton icon={Scale} label="Compare" />
        </TabTrigger>
        <TabTrigger name="index" href="/" asChild>
          <TabButton icon={ChefHat} label="Kitchen" />
        </TabTrigger>
        <TabTrigger name="discover" href="/discover" asChild>
          <TabButton icon={Sparkles} label="Discover" />
        </TabTrigger>
        <TabTrigger name="trips" href="/trips" asChild>
          <TabButton icon={ShoppingCart} label="Trips" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  icon: Icon,
  label,
  isFocused,
  onPress,
  onLongPress,
}: TabTriggerSlotProps & { icon: LucideIcon; label: string }) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} accessibilityRole="tab" accessibilityState={{ selected: !!isFocused }} style={styles.tab}>
      <View style={[styles.indicator, isFocused && { backgroundColor: 'rgba(255,255,255,0.13)' }]}>
        <Icon size={22} color={isFocused ? Colors.indicator : 'rgba(255,255,255,0.55)'} />
      </View>
      <AppText variant="xs" style={{ color: isFocused ? Colors.white : 'rgba(255,255,255,0.55)' }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: Colors.surfaceHeader, paddingTop: 8, paddingBottom: 14 },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  indicator: { width: 56, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
