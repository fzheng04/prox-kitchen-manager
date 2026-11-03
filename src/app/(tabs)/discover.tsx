import { Check, Plus, Sparkles, ThumbsDown } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppNotices } from '@/components/app-notices';
import { Badge, EmptyState, Pill, Swatch } from '@/components/ui/bits';
import { AppHeader, Screen, Section } from '@/components/ui/layout';
import { AppText } from '@/components/ui/text';
import { Button, Card } from '@/components/ui/tile';
import { formatCents } from '@/logic/money';
import { formatQuantity } from '@/logic/units';
import { useApp } from '@/state/app-state';
import { useDiscoveryPick, useHomeRetailerId } from '@/state/derived';

export default function DiscoverScreen() {
  const { state, profile, catalog, list, addListItem, dispatch } = useApp();
  const pick = useDiscoveryPick();
  const homeRetailerId = useHomeRetailerId();
  const retailer = catalog.retailers.find((r) => r.id === homeRetailerId);

  return (
    <Screen header={<AppHeader title="Discover" subtitle="Try something new. One pick, never a paid placement." />}>
      <AppNotices showReminder={false} />

      {pick ? (
        <Card>
          <View style={styles.pickHead}>
            <Swatch category={pick.item.category} size={56} />
            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.wrap}>
                <Badge tone="green">Not sponsored</Badge>
                {pick.product.organic ? <Pill tone="green">Organic</Pill> : null}
              </View>
              <AppText variant="h2">{pick.item.name}</AppText>
              <AppText variant="sm" tone="secondary">
                {pick.product.brand} · {formatQuantity(pick.product.size, pick.product.unit)}
              </AppText>
            </View>
            <AppText variant="h2" tone="price">
              {formatCents(pick.priceCents)}
            </AppText>
          </View>
          <View style={styles.reasons}>
            <AppText variant="smStrong">Why we suggest it</AppText>
            {pick.reasons.map((r) => (
              <View key={r} style={styles.reason}>
                <Check size={16} color="#1F8A5B" />
                <AppText variant="sm" style={{ flex: 1 }}>
                  {r}
                </AppText>
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <Button
              label="Add to list"
              icon={Plus}
              onPress={() =>
                addListItem(
                  `discover-${pick.product.id}-${list.id}-r${list.revision}`,
                  {
                    itemId: pick.item.id,
                    text: pick.item.name,
                    quantity: pick.product.size,
                    unit: pick.product.unit,
                    pinnedBrand: pick.product.brand,
                  },
                  'discovery',
                )
              }
            />
            <Button
              label="Not for me"
              variant="secondary"
              icon={ThumbsDown}
              onPress={() => dispatch({ type: 'DISMISS_DISCOVERY', productId: pick.product.id })}
            />
          </View>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="No new picks right now"
            body="Nothing new fits your preferences at your store. Picks skip items you already have, have bought, or dismissed."
          />
        </Card>
      )}

      <Section title="What this pick uses">
        <Card>
          <View style={{ padding: 14, gap: 8 }}>
            <Row label="Profile" value={profile.name} />
            <Row label="Discover in" value={profile.discoverCategories.join(', ') || 'none'} />
            <Row label="Organic for" value={profile.organicCategories.join(', ') || 'no preference'} />
            <Row label="Store" value={`${retailer?.name ?? 'none'} (where you shopped last), ZIP ${state.zip}`} />
            <Row
              label="Dismissed"
              value={`${profile.dismissedProductIds.length} pick${profile.dismissedProductIds.length === 1 ? '' : 's'}. Each one lowers its category.`}
            />
          </View>
        </Card>
      </Section>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <AppText variant="sm" tone="secondary" style={{ width: 96 }}>
        {label}
      </AppText>
      <AppText variant="sm" style={{ flex: 1 }}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pickHead: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  reasons: { gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  reason: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, paddingBottom: 16 },
});
