import { router } from 'expo-router';
import { ChevronDown, ChevronUp, CircleCheck, ExternalLink, Info, ShoppingBag } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppNotices } from '@/components/app-notices';
import { Badge, EmptyState, Notice } from '@/components/ui/bits';
import { SegmentedControl } from '@/components/ui/forms';
import { AppHeader, Divider, Screen } from '@/components/ui/layout';
import { AppText } from '@/components/ui/text';
import { Button, Tile } from '@/components/ui/tile';
import { Colors, Radius } from '@/constants/theme';
import type { Basket, BasketLine } from '@/logic/basket';
import { formatCents, formatUnitPrice } from '@/logic/money';
import { formatQuantity } from '@/logic/units';
import { useApp } from '@/state/app-state';
import { tripIdFor } from '@/state/reducer';
import { useBaskets } from '@/state/derived';

const STATUS_TEXT: Record<BasketLine['status'], string> = {
  matched: '',
  substituted: 'Substitute',
  missing: 'Missing',
  no_price: 'No price',
  not_comparable: 'Not comparable',
  unresolved: 'Needs a match',
};

export default function CompareScreen() {
  const { state, list, catalog, dispatch, logEvent, completeTrip } = useApp();
  const baskets = useBaskets();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<string | null>(null);

  // This is a tab, so it stays mounted. "Just completed" comes from saved state, not local state:
  // completing a trip bumps the list revision, so the trip for the previous revision is the one
  // just finished. Editing the list bumps the revision again and the notice goes away.
  const justCompleted = state.trips.find((t) => t.id === tripIdFor({ ...list, revision: list.revision - 1 }));
  const completed = justCompleted
    ? {
        retailer: catalog.retailers.find((r) => r.id === justCompleted.retailerId)?.name ?? justCompleted.retailerId,
        items: justCompleted.lines.length,
      }
    : null;

  const best = baskets.find((b) => b.isBestDeal);
  const cheaperIncomplete = baskets.find((b) => b.cheaperButIncomplete);

  // One comparison event per list revision, ZIP and mock day.
  const compareKey = `compare:${list.id}:r${list.revision}:${state.zip}:d${state.clock.offsetDays}`;
  useEffect(() => {
    if (list.items.length === 0 || completed) return;
    logEvent(
      'basket_compared',
      { listId: list.id, items: list.items.length, zip: state.zip, best: best?.retailer.id ?? 'none' },
      compareKey,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- compareKey identifies the comparison
  }, [compareKey]);

  const onComplete = (basket: Basket) => {
    completeTrip(basket, baskets);
  };

  const onHandoff = (basket: Basket) => {
    logEvent('retailer_handoff_tapped', { retailerId: basket.retailer.id, totalCents: basket.totalCents });
    setHandoff(basket.retailer.name);
  };

  const zipOptions = catalog.zips.map((z) => ({ value: z.code, label: z.code }));

  return (
    <Screen
      header={
        <AppHeader
          title="Compare stores"
          subtitle={`${list.name} · ${list.items.length} items · prices are synthetic`}
>
          <SegmentedControl dark options={zipOptions} value={state.zip} onChange={(zip) => dispatch({ type: 'SET_ZIP', zip })} />
        </AppHeader>
      }>
      <AppNotices showReminder={false} />

      {completed ? (
        <Notice
          tone="success"
          icon={CircleCheck}
          title={`Trip at ${completed.retailer} saved`}
          body={`${completed.items} items added to your pantry and history. Missing items stay on the list.`}
          action={<Button label="See pantry" size="sm" variant="secondary" onPress={() => router.navigate('/')} />}
        />
      ) : null}

      {handoff ? (
        <Notice
          icon={ExternalLink}
          title={`Handoff to ${handoff} (simulated)`}
          body="No retailer site was opened and nothing was ordered. A real build would deep-link to the store's cart here."
          action={<Button label="OK" size="sm" variant="ghost" onPress={() => setHandoff(null)} />}
        />
      ) : null}

      {list.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to compare"
          body="Add items to your list and each store's basket total shows up here."
          action={<Button label="Go to list" size="sm" variant="secondary" onPress={() => router.navigate('/list')} />}
        />
      ) : (
        <>
          {!best ? (
            <Notice
              icon={Info}
              title="No store has everything"
              body="Every basket is missing at least one item, so none is labeled the best deal."
            />
          ) : null}
          {best && cheaperIncomplete ? (
            <Notice
              icon={Info}
              title={`${cheaperIncomplete.retailer.name} looks cheaper, but it's missing ${cheaperIncomplete.missing.length} item${cheaperIncomplete.missing.length === 1 ? '' : 's'}`}
              body={`Missing: ${cheaperIncomplete.missing.map((m) => m.name).join(', ')}. ${best.retailer.name} has everything for ${formatCents(best.totalCents)}.`}
            />
          ) : null}

          {baskets.map((basket, i) => (
            <RetailerCard
              key={basket.retailer.id}
              rank={i + 1}
              basket={basket}
              expanded={expanded === basket.retailer.id}
              onToggle={() => setExpanded(expanded === basket.retailer.id ? null : basket.retailer.id)}
              onComplete={() => onComplete(basket)}
              onHandoff={() => onHandoff(basket)}
              completeDisabled={completed !== null}
            />
          ))}
        </>
      )}
    </Screen>
  );
}

function RetailerCard({
  rank,
  basket,
  expanded,
  onToggle,
  onComplete,
  onHandoff,
  completeDisabled,
}: {
  rank: number;
  basket: Basket;
  expanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
  onHandoff: () => void;
  completeDisabled: boolean;
}) {
  const dark = basket.isBestDeal;
  const Chevron = expanded ? ChevronUp : ChevronDown;
  return (
    <Tile fill={dark ? Colors.surfaceDeep : Colors.surfaceCard} innerStyle={{ overflow: 'hidden' }}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={`${basket.retailer.name} basket details`} style={styles.retailerHead}>
        <View style={[styles.logo, dark && { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.18)' }]}>
          <AppText variant="h3" style={{ color: dark ? Colors.sage300 : Colors.night700 }}>
            {basket.retailer.short}
          </AppText>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.wrap}>
            <AppText variant="bodyStrong" tone={dark ? 'onDark' : 'primary'}>
              {rank}. {basket.retailer.name}
            </AppText>
            {basket.isBestDeal ? <Badge tone="gold">Best deal</Badge> : null}
          </View>
          <View style={styles.wrap}>
            <AppText variant="xs" tone={dark ? 'onDarkMuted' : 'secondary'}>
              {basket.matchedCount} of {basket.itemCount} items
            </AppText>
            {basket.missing.length > 0 ? <Badge tone="red">{`Missing ${basket.missing.length}`}</Badge> : null}
            {basket.staleCount > 0 ? <Badge tone={dark ? 'dark' : 'neutral'}>{`${basket.staleCount} stale`}</Badge> : null}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <AppText variant="h2" tone={dark ? 'priceOnDark' : 'price'}>
            {formatCents(basket.totalCents)}
          </AppText>
          {!basket.complete ? (
            <AppText variant="xs" tone={dark ? 'onDarkMuted' : 'muted'}>
              partial total
            </AppText>
          ) : null}
        </View>
        <Chevron size={20} color={dark ? Colors.white : Colors.ink} />
      </Pressable>

      {expanded ? (
        <View style={styles.lines}>
          {basket.lines.map((line, i) => (
            <View key={line.listItemId}>
              {i > 0 ? <Divider /> : null}
              <LineRow line={line} />
            </View>
          ))}
          <View style={styles.actions}>
            <Button
              label="Complete trip here"
              icon={CircleCheck}
              disabled={completeDisabled || basket.matchedCount === 0}
              onPress={onComplete}
            />
            <Button label="Open store (simulated)" variant="secondary" icon={ExternalLink} onPress={onHandoff} />
          </View>
        </View>
      ) : null}
    </Tile>
  );
}

function LineRow({ line }: { line: BasketLine }) {
  const { list, dispatch } = useApp();
  const listItem = list.items.find((i) => i.id === line.listItemId);
  const priced = line.chosen;
  return (
    <View style={styles.line}>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={styles.wrap}>
          <AppText variant="smStrong">{line.name}</AppText>
          {STATUS_TEXT[line.status] ? (
            <Badge tone={line.status === 'substituted' ? 'gold' : 'red'}>{STATUS_TEXT[line.status]}</Badge>
          ) : null}
          {line.stale ? <Badge>Stale</Badge> : null}
          {line.onSpecial ? <Badge tone="green">Special</Badge> : null}
        </View>
        {priced ? (
          <AppText variant="xs" tone="secondary">
            {priced.product.brand}
            {priced.product.organic ? ' organic' : ''} · {priced.packages} × {formatQuantity(priced.product.size, priced.product.unit)} ·{' '}
            {formatUnitPrice(priced.centsPerUnit, priced.unitLabel)}
          </AppText>
        ) : null}
        {line.note ? (
          <AppText variant="xs" tone={priced ? 'muted' : 'danger'}>
            {line.note}
          </AppText>
        ) : null}
        {line.alternative && listItem ? (
          <View style={styles.alt}>
            <AppText variant="xs" style={{ flex: 1 }}>
              Alternative: {line.alternative.product.brand}, {formatCents(line.alternative.costCents)} (save{' '}
              {formatCents(line.alternative.savingsCents)})
            </AppText>
            <Button
              label="Use this"
              size="sm"
              variant="secondary"
              onPress={() =>
                dispatch({
                  type: 'UPDATE_LIST_ITEM',
                  listItemId: listItem.id,
                  patch: { pinnedBrand: line.alternative!.product.brand, organic: line.alternative!.product.organic },
                })
              }
            />
          </View>
        ) : null}
      </View>
      <AppText variant="price" tone={priced ? 'price' : 'muted'}>
        {priced ? formatCents(priced.costCents) : 'n/a'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  retailerHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  logo: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.stone200,
    backgroundColor: Colors.oat100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  lines: { backgroundColor: Colors.surfaceRaised, paddingHorizontal: 14, paddingBottom: 14 },
  line: { flexDirection: 'row', gap: 10, paddingVertical: 10, alignItems: 'flex-start' },
  alt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    padding: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.money100,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
});
