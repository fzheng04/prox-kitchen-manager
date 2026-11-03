import { router } from 'expo-router';
import { ArrowLeft, FileClock } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/bits';
import { AppHeader, Divider, Screen } from '@/components/ui/layout';
import { AppText } from '@/components/ui/text';
import { Card } from '@/components/ui/tile';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { useApp } from '@/state/app-state';

/** Debug view of the local analytics log, newest first. Nothing here leaves the device. */
export default function EventsScreen() {
  const { state, sessionId } = useApp();
  const events = [...state.events].reverse();

  return (
    <Screen
      header={
        <AppHeader
          title="Event log"
          subtitle={`${state.events.length} local events · session ${sessionId.slice(-8)}`}
          left={
            <Pressable onPress={() => router.back()} accessibilityLabel="Back" hitSlop={8} style={styles.back}>
              <ArrowLeft size={20} color={Colors.white} />
            </Pressable>
          }
        />
      }>
      {events.length === 0 ? (
        <EmptyState icon={FileClock} title="No events yet" body="Use the app and events appear here." />
      ) : (
        <Card>
          {events.map((e, i) => (
            <View key={e.id}>
              {i > 0 ? <Divider /> : null}
              <View style={styles.event}>
                <View style={styles.headRow}>
                  <AppText variant="smStrong" style={{ flex: 1 }}>
                    {e.name}
                  </AppText>
                  <AppText variant="xs" tone="muted">
                    {e.mockTime.slice(0, 10)}
                  </AppText>
                </View>
                <AppText style={styles.mono}>
                  {`id ${e.id}\nsession ${e.sessionId}\nuser ${e.anonymousId}\nat ${e.timestamp}\n${JSON.stringify(e.props)}`}
                </AppText>
              </View>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  event: { paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mono: { fontFamily: Fonts.body, fontSize: 11, lineHeight: 15, color: Colors.textSecondary },
});
