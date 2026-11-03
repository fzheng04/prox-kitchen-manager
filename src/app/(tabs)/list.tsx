import { router } from 'expo-router';
import { CircleAlert, ListPlus, Pin, Plus, Scale, SearchX, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppNotices } from '@/components/app-notices';
import { Badge, Chip, EmptyState, Notice, Pill, Swatch } from '@/components/ui/bits';
import { QuantityStepper, SearchField, SegmentedControl } from '@/components/ui/forms';
import { AppHeader, Divider, Screen, Section } from '@/components/ui/layout';
import { AppText } from '@/components/ui/text';
import { Button, Card } from '@/components/ui/tile';
import { Colors, Spacing } from '@/constants/theme';
import { formatDate } from '@/logic/clock';
import { isAmbiguous, searchCatalog } from '@/logic/matching';
import type { CatalogItem, ListItem } from '@/logic/types';
import { formatQuantity, unitFamily, unitLabel, unitsForFamily } from '@/logic/units';
import { useApp } from '@/state/app-state';
import { newId } from '@/state/ids';

export default function ListScreen() {
  const { state, list, catalog, addListItem, logEvent, dispatch, now } = useApp();
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const results = useMemo(() => searchCatalog(query, catalog.items, catalog.products), [query, catalog]);
  const ambiguous = isAmbiguous(results);

  /** Typical purchase size: what the user bought last time, else one of the item's default unit. */
  const defaultQuantity = (item: CatalogItem) => {
    const trips = [...state.trips].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
    for (const t of trips) {
      const line = t.lines.find((l) => l.itemId === item.id);
      if (line) return { quantity: line.quantity, unit: line.unit };
    }
    return { quantity: 1, unit: item.unit };
  };

  const addFromSearch = (item: CatalogItem, position: number) => {
    // Request id is fixed for this list revision, so a repeated tap before the list updates adds once.
    const requestId = `search-${item.id}-${list.id}-r${list.revision}`;
    logEvent('search_result_selected', { query, itemId: item.id, position }, `select:${requestId}`);
    addListItem(requestId, { itemId: item.id, text: item.name, ...defaultQuantity(item) }, 'search');
    setQuery('');
  };

  const submitTyped = () => {
    if (!query.trim()) return;
    if (results.length > 0 && !ambiguous) {
      addFromSearch(results[0].item, 0);
      return;
    }
    // Ambiguous or unknown: keep what the user typed and ask them to match it later.
    const unit = results[0]?.item.unit ?? 'ct';
    addListItem(`typed-${query.trim().toLowerCase()}-${list.id}-r${list.revision}`, { itemId: null, text: query.trim(), quantity: 1, unit }, 'typed');
    setQuery('');
  };

  const createList = () => {
    const id = newId('list');
    dispatch({ type: 'CREATE_LIST', id, name: `New list, ${formatDate(now)}` });
    setEditingId(null);
  };

  const unresolved = list.items.filter((i) => !i.itemId).length;

  return (
    <Screen
      header={
        <AppHeader title="List" subtitle={`${list.name} · ${list.items.length} item${list.items.length === 1 ? '' : 's'}`}>
          <SearchField
            testID="list-search"
            value={query}
            onChangeText={setQuery}
            placeholder="Search milk, eggs, rice..."
            onSubmitEditing={submitTyped}
          />
        </AppHeader>
      }>
      <AppNotices showReminder={false} />

      {query.trim() ? (
        <Section title="Results">
          {results.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title={`No matches for "${query.trim()}"`}
                body="The catalog is local and small. Try a broader word, or keep it as a note to match later."
                action={<Button label="Keep as a note" size="sm" variant="secondary" onPress={submitTyped} />}
              />
            </Card>
          ) : (
            <Card>
              {ambiguous ? (
                <View style={{ padding: 12 }}>
                  <Notice icon={CircleAlert} title={`More than one item matches "${query.trim()}"`} body="Pick the one you mean." />
                </View>
              ) : null}
              {results.slice(0, 8).map((r, i) => (
                <View key={r.item.id}>
                  {i > 0 || ambiguous ? <Divider /> : null}
                  <Pressable
                    onPress={() => addFromSearch(r.item, i)}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${r.item.name}`}
                    style={({ pressed }) => [styles.row, pressed && { backgroundColor: Colors.oat100 }]}>
                    <Swatch category={r.item.category} size={36} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="title">{r.item.name}</AppText>
                      <AppText variant="xs" tone="secondary">
                        {r.item.category} · sold by {unitLabel(r.item.unit)}
                      </AppText>
                    </View>
                    <Plus size={20} color={Colors.accent} />
                  </Pressable>
                </View>
              ))}
            </Card>
          )}
        </Section>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.gutter }}>
        <View style={styles.chips}>
          {state.lists.map((l) => (
            <Chip
              key={l.id}
              label={`${l.name} (${l.items.length})`}
              selected={l.id === list.id}
              onPress={() => {
                dispatch({ type: 'SET_ACTIVE_LIST', listId: l.id });
                setEditingId(null);
              }}
            />
          ))}
          <Chip label="+ New list" onPress={createList} />
        </View>
      </ScrollView>

      <Section title={list.name}>
        {list.items.length === 0 ? (
          <Card>
            <EmptyState
              icon={ListPlus}
              title="This list is empty"
              body="Search above to add items. Quantities and units can be edited after adding."
            />
          </Card>
        ) : (
          <Card>
            {list.items.map((li, i) => (
              <View key={li.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  listItem={li}
                  expanded={editingId === li.id || !li.itemId}
                  onToggle={() => setEditingId(editingId === li.id ? null : li.id)}
                />
              </View>
            ))}
          </Card>
        )}
      </Section>

      {unresolved > 0 ? (
        <Notice
          tone="error"
          icon={CircleAlert}
          title={`${unresolved} item${unresolved === 1 ? ' needs' : 's need'} a match`}
          body="Unmatched items can't be priced, so every basket shows them as missing."
        />
      ) : null}

      <Button
        label="Compare stores"
        size="lg"
        icon={Scale}
        fullWidth
        disabled={list.items.length === 0}
        onPress={() => router.navigate('/compare')}
      />
    </Screen>
  );
}

function ListRow({ listItem, expanded, onToggle }: { listItem: ListItem; expanded: boolean; onToggle: () => void }) {
  const { catalog, profile, dispatch } = useApp();
  const item = catalog.items.find((i) => i.id === listItem.itemId);
  const brands = useMemo(
    () => [...new Set(catalog.products.filter((p) => p.itemId === listItem.itemId).map((p) => p.brand))].sort(),
    [catalog.products, listItem.itemId],
  );
  const hasOrganic = catalog.products.some((p) => p.itemId === listItem.itemId && p.organic);
  const candidates = useMemo(
    () => (listItem.itemId ? [] : searchCatalog(listItem.text, catalog.items, catalog.products).slice(0, 5)),
    [listItem.itemId, listItem.text, catalog],
  );
  const update = (patch: Partial<Omit<ListItem, 'id'>>) => dispatch({ type: 'UPDATE_LIST_ITEM', listItemId: listItem.id, patch });
  const profileBrand = listItem.itemId ? profile.pinnedBrands[listItem.itemId] : undefined;
  const organicDefault = item ? profile.organicCategories.includes(item.category) : false;
  const organic = listItem.organic ?? organicDefault;
  const step = unitFamily(listItem.unit) === 'count' ? 1 : listItem.unit === 'gal' || listItem.unit === 'lb' ? 0.5 : 1;

  return (
    <View>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={`Edit ${listItem.text}`} style={styles.row}>
        {item ? <Swatch category={item.category} size={36} /> : <View style={styles.unmatchedDot} />}
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="title">{item?.name ?? `"${listItem.text}"`}</AppText>
          <View style={styles.wrap}>
            <AppText variant="xs" tone="secondary">
              {formatQuantity(listItem.quantity, listItem.unit)}
            </AppText>
            {!item ? <Badge tone="red">Needs a match</Badge> : null}
            {listItem.pinnedBrand ?? profileBrand ? <Pill icon={Pin}>{(listItem.pinnedBrand ?? profileBrand)!}</Pill> : null}
            {organic && item ? <Pill tone="green">Organic</Pill> : null}
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.editor}>
          {!item ? (
            <View style={{ gap: 8 }}>
              <AppText variant="smStrong">Which one did you mean?</AppText>
              {candidates.length === 0 ? (
                <AppText variant="xs" tone="secondary">
                  No catalog items match. Remove it or search for something else.
                </AppText>
              ) : (
                <View style={styles.wrap}>
                  {candidates.map((c) => (
                    <Chip
                      key={c.item.id}
                      label={c.item.name}
                      category={c.item.category}
                      onPress={() => dispatch({ type: 'RESOLVE_LIST_ITEM', listItemId: listItem.id, itemId: c.item.id })}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <>
              <View style={styles.editorRow}>
                <QuantityStepper
                  value={listItem.quantity}
                  min={step}
                  step={step}
                  label={`${listItem.text} quantity`}
                  onChange={(quantity) => update({ quantity })}
                />
                <View style={{ flex: 1 }}>
                  <SegmentedControl
                    options={unitsForFamily(unitFamily(listItem.unit)).map((u) => ({ value: u, label: unitLabel(u) }))}
                    value={listItem.unit}
                    onChange={(unit) => update({ unit })}
                  />
                </View>
              </View>
              {brands.length > 1 ? (
                <View style={{ gap: 6 }}>
                  <AppText variant="xs" tone="secondary">
                    Pinned brand wins over a cheaper one. You will still see the cheaper option.
                  </AppText>
                  <View style={styles.wrap}>
                    <Chip label="Any brand" selected={!listItem.pinnedBrand} onPress={() => update({ pinnedBrand: undefined })} />
                    {brands.map((b) => (
                      <Chip key={b} label={b} selected={listItem.pinnedBrand === b} onPress={() => update({ pinnedBrand: b })} />
                    ))}
                  </View>
                </View>
              ) : null}
              {hasOrganic ? (
                <View style={styles.wrap}>
                  <Chip label="Organic only" selected={organic} onPress={() => update({ organic: !organic })} />
                </View>
              ) : null}
            </>
          )}
          <Button
            label="Remove"
            size="sm"
            variant="ghost"
            icon={Trash2}
            onPress={() => dispatch({ type: 'REMOVE_LIST_ITEM', listItemId: listItem.id })}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.gutter },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  editor: { gap: 12, paddingHorizontal: 14, paddingBottom: 14, backgroundColor: Colors.oat50 },
  editorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unmatchedDot: { width: 36, height: 36, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.mustard500 },
});
