import { router } from 'expo-router';
import { CalendarClock, CalendarPlus, Eraser, FileClock, History, RefreshCw, RotateCcw, ShoppingCart } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppNotices } from '@/components/app-notices';
import { Badge, EmptyState, Notice } from '@/components/ui/bits';
import { SegmentedControl } from '@/components/ui/forms';
import { AppHeader, Divider, Screen, Section } from '@/components/ui/layout';
import { AppText } from '@/components/ui/text';
import { Button, Card } from '@/components/ui/tile';
import { formatDate, weekIndex } from '@/logic/clock';
import { formatCents } from '@/logic/money';
import { totalSaved } from '@/logic/summary';
import { useApp } from '@/state/app-state';

export default function TripsScreen() {
  const { state, now, catalog, dispatch, resetDemo, startEmpty, reloadFromStorage } = useApp();
  const [confirm, setConfirm] = useState<'reset' | 'empty' | null>(null);
  const trips = [...state.trips].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));

  return (
    <Screen header={<AppHeader title="Trips" subtitle={`Mock clock: ${formatDate(now)} · Week ${weekIndex(state.clock)}`} />}>
      <AppNotices />

      <Card>
        <View style={{ padding: 16, gap: 4 }}>
          <AppText variant="xs" tone="secondary">
            Saved to date, against the priciest complete basket
          </AppText>
          <AppText variant="priceXl" tone="price">
            {formatCents(totalSaved(state.trips))}
          </AppText>
          <AppText variant="xs" tone="secondary">
            Across {state.trips.length} trip{state.trips.length === 1 ? '' : 's'}
          </AppText>
        </View>
      </Card>

      <Section title="Demo controls">
        <Card>
          <View style={{ padding: 14, gap: 14 }}>
            <AppText variant="sm" tone="secondary">
              Time only moves when you advance it. Pantry use, stale prices and usual restocks all follow this clock.
            </AppText>
            <View style={styles.wrap}>
              <Button label="Advance a day" size="sm" variant="secondary" icon={CalendarClock} onPress={() => dispatch({ type: 'ADVANCE_CLOCK', days: 1 })} />
              <Button label="Advance a week" size="sm" icon={CalendarPlus} onPress={() => dispatch({ type: 'ADVANCE_CLOCK', days: 7 })} />
            </View>
            <View style={{ gap: 6 }}>
              <AppText variant="smStrong">Profile</AppText>
              <SegmentedControl
                options={state.profiles.map((p) => ({ value: p.id, label: p.name.split(' ')[0] }))}
                value={state.activeProfileId}
                onChange={(profileId) => dispatch({ type: 'SET_PROFILE', profileId })}
              />
            </View>
            <View style={{ gap: 6 }}>
              <AppText variant="smStrong">ZIP</AppText>
              <SegmentedControl
                options={catalog.zips.map((z) => ({ value: z.code, label: `${z.code}` }))}
                value={state.zip}
                onChange={(zip) => dispatch({ type: 'SET_ZIP', zip })}
              />
            </View>
            <View style={styles.wrap}>
              <Button label="Event log" size="sm" variant="secondary" icon={FileClock} onPress={() => router.push('/events')} />
              <Button label="Reload from storage" size="sm" variant="secondary" icon={RefreshCw} onPress={reloadFromStorage} />
              <Button label="Start empty" size="sm" variant="secondary" icon={Eraser} onPress={() => setConfirm('empty')} />
              <Button label="Reset demo" size="sm" variant="ghost" icon={RotateCcw} onPress={() => setConfirm('reset')} />
            </View>
            {confirm ? (
              <Notice
                tone="error"
                title={confirm === 'reset' ? 'Reset everything to the sample data?' : 'Clear your kitchen?'}
                body={
                  confirm === 'reset'
                    ? 'Lists, pantry, trips, events and the clock go back to the start. A new anonymous id is created.'
                    : 'Empties the pantry, lists and trip history so you can start from scratch. The sample data comes back with Reset demo.'
                }
                action={
                  <View style={{ gap: 6 }}>
                    <Button
                      label={confirm === 'reset' ? 'Reset' : 'Clear'}
                      size="sm"
                      onPress={() => {
                        if (confirm === 'reset') resetDemo();
                        else startEmpty();
                        setConfirm(null);
                      }}
                    />
                    <Button label="Cancel" size="sm" variant="ghost" onPress={() => setConfirm(null)} />
                  </View>
                }
              />
            ) : null}
            <AppText variant="xs" tone="muted">
              Guest mode, no login. Anonymous id: {state.anonymousId}
            </AppText>
          </View>
        </Card>
      </Section>

      <Section title="History">
        {trips.length === 0 ? (
          <Card>
            <EmptyState icon={History} title="No trips yet" body="Compare stores from the List tab, then complete a trip." />
          </Card>
        ) : (
          <Card>
            {trips.map((t, i) => {
              const retailer = catalog.retailers.find((r) => r.id === t.retailerId);
              return (
                <View key={t.id}>
                  {i > 0 ? <Divider /> : null}
                  <View style={styles.trip}>
                    <ShoppingCart size={20} color="#2F3A55" />
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.wrap}>
                        <AppText variant="title">{retailer?.name ?? t.retailerId}</AppText>
                        {t.source === 'seed' ? <Badge>Sample</Badge> : <Badge tone="green">You</Badge>}
                      </View>
                      <AppText variant="xs" tone="secondary">
                        {formatDate(new Date(t.completedAt))} · {t.lines.length} items
                        {t.savingsCents > 0 ? ` · saved ${formatCents(t.savingsCents)}` : ''}
                      </AppText>
                    </View>
                    <AppText variant="price" tone="price">
                      {formatCents(t.totalCents)}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  trip: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
});
