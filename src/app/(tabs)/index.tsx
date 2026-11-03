import { router } from 'expo-router';
import { ChefHat, Database, ListPlus, Plus, Scale, SearchX, ShoppingBasket, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppNotices } from '@/components/app-notices';
import { Badge, Chip, EmptyState, Pill, Swatch } from '@/components/ui/bits';
import { QuantityStepper, SearchField } from '@/components/ui/forms';
import { AppHeader, Divider, Screen, Section } from '@/components/ui/layout';
import { AppText } from '@/components/ui/text';
import { Button, Card, IconButton } from '@/components/ui/tile';
import { Colors, Spacing } from '@/constants/theme';
import { formatDate, weekIndex, weekStart } from '@/logic/clock';
import { searchCatalog } from '@/logic/matching';
import { formatCents } from '@/logic/money';
import { currentQuantity, daysLeft, isLow, pantryRows, REASON_LABEL, typicalAmount } from '@/logic/pantry';
import { weekSummary } from '@/logic/summary';
import type { Category } from '@/logic/types';
import { formatQuantity, unitFamily, unitLabel } from '@/logic/units';
import { useApp } from '@/state/app-state';
import { useRestockSuggestions } from '@/state/derived';

const CATEGORIES: Category[] = ['produce', 'dairy', 'meat', 'pantry', 'essentials', 'frozen'];

export default function KitchenScreen() {
  const { state, now, list, profile } = useApp();
  const brandNew = state.pantry.length === 0 && state.trips.length === 0 && list.items.length === 0;

  return (
    <Screen
      header={
        <AppHeader title="Kitchen" subtitle={`${formatDate(now)} · Week ${weekIndex(state.clock)} · ${profile.name}`} />
      }>
      <AppNotices />
      {brandNew ? <GettingStarted /> : <Overview />}
      {brandNew ? null : <Restocks />}
      <Pantry />
    </Screen>
  );
}

/** First launch: nothing stocked, listed or bought yet. Explains the loop instead of showing empty cards. */
function GettingStarted() {
  const { loadSample } = useApp();
  const steps = [
    { title: 'Stock your pantry', body: 'Add what you already have below, so the app knows when you run low.' },
    { title: 'Build a list', body: 'Search the catalog from the List tab and add what you need.' },
    { title: 'Compare and shop', body: 'See each store’s basket total, then mark the trip done. Your pantry fills in.' },
  ];
  return (
    <Card>
      <View style={{ padding: 16, gap: 14 }}>
        <View style={{ gap: 4 }}>
          <AppText variant="h2">Your kitchen is empty</AppText>
          <AppText variant="sm" tone="secondary">
            Nothing is stocked, listed or bought yet. Restock suggestions show up once there is something to track.
          </AppText>
        </View>
        {steps.map((s, i) => (
          <View key={s.title} style={styles.step}>
            <View style={styles.stepNumber}>
              <AppText variant="label" tone="onDark">
                {String(i + 1)}
              </AppText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="title">{s.title}</AppText>
              <AppText variant="xs" tone="secondary">
                {s.body}
              </AppText>
            </View>
          </View>
        ))}
        <View style={styles.wrap}>
          <Button label="Start a list" size="sm" icon={ListPlus} onPress={() => router.push('/list')} />
          <Button label="Load sample data" size="sm" variant="ghost" icon={Database} onPress={loadSample} />
        </View>
      </View>
    </Card>
  );
}

/** Pantry, list and weekly value at a glance, with the next thing to run out. */
function Overview() {
  const { state, now, catalog, list } = useApp();
  const thisWeek = weekSummary(state.trips, weekStart(state.clock));
  const lowCount = state.pantry.filter((p) => isLow(p, now)).length;
  const next = [...state.pantry]
    .filter((p) => Number.isFinite(daysLeft(p, now)))
    .sort((a, b) => daysLeft(a, now) - daysLeft(b, now) || a.itemId.localeCompare(b.itemId))[0];
  const nextName = next ? catalog.items.find((i) => i.id === next.itemId)?.name : undefined;

  return (
    <Card>
      <View style={styles.stats}>
        <Stat value={String(state.pantry.length)} label="in pantry" />
        <Stat value={String(lowCount)} label="running low" tone={lowCount > 0 ? 'danger' : undefined} />
        <Stat value={formatCents(thisWeek.savedCents)} label="saved this week" tone="price" />
      </View>
      <Divider />
      <View style={{ padding: 14, gap: 10 }}>
        <AppText variant="sm" tone="secondary">
          {next && nextName
            ? `${nextName} runs out first, in ~${Math.max(0, Math.round(daysLeft(next, now)))} days.`
            : 'Nothing in the pantry is being used up yet.'}
          {thisWeek.trips > 0
            ? ` ${thisWeek.trips} trip${thisWeek.trips === 1 ? '' : 's'} this week, ${formatCents(thisWeek.spentCents)} spent.`
            : ''}
        </AppText>
        <View style={styles.wrap}>
          <Button
            label={list.items.length === 0 ? 'Start a list' : `Open list (${list.items.length})`}
            size="sm"
            variant="secondary"
            icon={ShoppingBasket}
            onPress={() => router.push('/list')}
          />
          {list.items.length > 0 ? (
            <Button label="Compare stores" size="sm" icon={Scale} onPress={() => router.navigate('/compare')} />
          ) : null}
        </View>
      </View>
    </Card>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone?: 'danger' | 'price' }) {
  return (
    <View style={styles.stat}>
      <AppText variant="h2" tone={tone}>
        {value}
      </AppText>
      <AppText variant="xs" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

function Restocks() {
  const { state, catalog, list, profile, addListItem, logEvent } = useApp();
  const suggestions = useRestockSuggestions();
  const top = suggestions.slice(0, 4);

  // Log each shown suggestion once per item, reason set, mock day and profile. Re-renders reuse the key.
  const topKey = top.map((s) => `${s.itemId}:${s.reasons.map((r) => r.kind).join('+')}`).join('|');
  useEffect(() => {
    for (const s of top) {
      const kinds = s.reasons.map((r) => r.kind).join('+');
      logEvent(
        'pantry_restock_suggested',
        { itemId: s.itemId, reasons: kinds, score: s.score },
        `restock:${s.itemId}:${kinds}:d${state.clock.offsetDays}:${profile.id}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- topKey captures the shown set
  }, [topKey, state.clock.offsetDays, profile.id]);

  return (
    <Section title="Suggested restocks">
      {top.length === 0 ? (
        <Card>
          <EmptyState
            icon={ChefHat}
            title="Nothing to restock"
            body="Suggestions appear when stock runs low, a usual purchase is due, or a saved favorite is running out."
          />
        </Card>
      ) : (
        <Card>
          {top.map((s, i) => {
            const item = catalog.items.find((x) => x.id === s.itemId)!;
            return (
              <View key={s.itemId}>
                {i > 0 ? <Divider /> : null}
                <View style={styles.suggestion}>
                  <Swatch category={item.category} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <AppText variant="title">{s.name}</AppText>
                    <View style={styles.wrap}>
                      {s.reasons.map((r) => (
                        <Pill key={r.kind} tone={r.kind === 'low_quantity' ? 'red' : 'neutral'}>
                          {REASON_LABEL[r.kind]}
                        </Pill>
                      ))}
                    </View>
                    {s.reasons.map((r) => (
                      <AppText key={r.kind} variant="xs" tone="secondary">
                        {r.text}
                      </AppText>
                    ))}
                  </View>
                  <Button
                    label="Add"
                    size="sm"
                    icon={Plus}
                    accessibilityLabel={`Add ${s.name} to ${list.name}`}
                    onPress={() =>
                      addListItem(
                        // Stable per list revision, so a double tap adds once.
                        `restock-${s.itemId}-${list.id}-r${list.revision}`,
                        { itemId: s.itemId, text: s.name, quantity: s.suggestedQuantity, unit: s.suggestedUnit },
                        'suggestion',
                      )
                    }
                  />
                </View>
              </View>
            );
          })}
        </Card>
      )}
    </Section>
  );
}

function Pantry() {
  const { state, now, catalog, dispatch } = useApp();
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchCatalog(query, catalog.items, catalog.products), [query, catalog]);

  // Newest first and never re-sorted, so editing a quantity doesn't move the row.
  const rows = useMemo(
    () => pantryRows(state.pantry, catalog.items).filter((r) => filter === 'all' || r.item.category === filter),
    [state.pantry, catalog.items, filter],
  );

  const stock = (index: number) => {
    const item = results[index].item;
    const existing = state.pantry.find((p) => p.itemId === item.id);
    dispatch({
      type: 'ADD_PANTRY_ITEM',
      // Tied to the item's current stock, so a repeated tap before the pantry updates adds once.
      requestId: `pantry-${item.id}-${existing ? `${existing.quantity}@${existing.updatedAt}` : 'none'}`,
      line: { itemId: item.id, ...typicalAmount(item, catalog.products, state.trips) },
    });
    setQuery('');
  };

  return (
    <Section title="Pantry">
      <SearchField testID="pantry-search" value={query} onChangeText={setQuery} placeholder="Add to pantry: eggs, rice..." />

      {query.trim() ? (
        results.length === 0 ? (
          <Card>
            <EmptyState icon={SearchX} title={`No matches for "${query.trim()}"`} body="The catalog is local and small. Try a broader word." />
          </Card>
        ) : (
          <Card>
            {results.slice(0, 6).map((r, i) => {
              const amount = typicalAmount(r.item, catalog.products, state.trips);
              const have = state.pantry.some((p) => p.itemId === r.item.id);
              return (
                <View key={r.item.id}>
                  {i > 0 ? <Divider /> : null}
                  <Pressable
                    onPress={() => stock(i)}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${formatQuantity(amount.quantity, amount.unit)} ${r.item.name} to pantry`}
                    style={({ pressed }) => [styles.row, pressed && { backgroundColor: Colors.oat100 }]}>
                    <Swatch category={r.item.category} size={36} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="title">{r.item.name}</AppText>
                      <AppText variant="xs" tone="secondary">
                        {have ? 'Adds' : 'Starts with'} {formatQuantity(amount.quantity, amount.unit)}
                      </AppText>
                    </View>
                    <Plus size={20} color={Colors.accent} />
                  </Pressable>
                </View>
              );
            })}
          </Card>
        )
      ) : null}

      {state.pantry.length === 0 ? (
        query.trim() ? null : (
          <Card>
            <EmptyState
              icon={ChefHat}
              title="Your pantry is empty"
              body="Search above to add what you have, or complete a trip and what you buy shows up here."
            />
          </Card>
        )
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.gutter }}>
            <View style={[styles.wrap, { paddingHorizontal: Spacing.gutter, flexWrap: 'nowrap' }]}>
              <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
              {CATEGORIES.map((c) => (
                <Chip key={c} label={c[0].toUpperCase() + c.slice(1)} category={c} selected={filter === c} onPress={() => setFilter(c)} />
              ))}
            </View>
          </ScrollView>
          {rows.length === 0 ? (
            <AppText variant="sm" tone="secondary">
              Nothing in this category.
            </AppText>
          ) : (
            <Card>
              {rows.map(({ pantry: p, item }, i) => {
                const qty = currentQuantity(p, now);
                const left = daysLeft(p, now);
                const low = isLow(p, now);
                const step = unitFamily(p.unit) === 'count' ? 1 : p.unit === 'gal' ? 0.25 : p.unit === 'lb' ? 0.5 : 1;
                return (
                  <View key={p.id}>
                    {i > 0 ? <Divider /> : null}
                    <View style={styles.pantryRow}>
                      <Swatch category={item.category} size={36} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={styles.wrap}>
                          <AppText variant="title">{item.name}</AppText>
                          {low ? <Badge tone="red">Low</Badge> : null}
                        </View>
                        <AppText variant="xs" tone={low ? 'danger' : 'secondary'}>
                          {formatQuantity(qty, p.unit)} · {Number.isFinite(left) ? `~${Math.round(left)} days left` : 'not used up'}
                        </AppText>
                      </View>
                      <QuantityStepper
                        value={Math.round(qty * 100) / 100}
                        step={step}
                        unitLabel={unitLabel(p.unit)}
                        label={`${item.name} quantity`}
                        onChange={(quantity) => dispatch({ type: 'SET_PANTRY_QUANTITY', pantryId: p.id, quantity })}
                      />
                      <IconButton
                        icon={Trash2}
                        size={36}
                        label={`Remove ${item.name} from pantry`}
                        onPress={() => dispatch({ type: 'REMOVE_PANTRY_ITEM', pantryId: p.id })}
                      />
                    </View>
                  </View>
                );
              })}
            </Card>
          )}
        </>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 8 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceHeader,
  },
  suggestion: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  pantryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
});
