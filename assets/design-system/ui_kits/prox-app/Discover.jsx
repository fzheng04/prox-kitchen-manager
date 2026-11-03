const PREFS = [['plant-based', 'Plant-based'], ['high-protein', 'High-protein'], ['organic', 'Organic']];
const DCATS = ['any', 'produce', 'dairy', 'meat', 'pantry', 'frozen'];

function Discover({ api }) {
  const { AppHeader, Card, Button, Pill, CategoryChip, ReasonTag, Badge, EmptyState, Icon } = window.Prox;
  const { s, set } = api; const D = ProxData;
  const P = s.prefs;
  const setP = patch => set(x => ({ ...x, prefs: { ...x.prefs, ...patch } }));
  const r = D.discover(s);
  const x = r.pick;
  const dismiss = () => { set(st => ({ ...st, dismissed: [...st.dismissed, x.p.id], dismissedCats: { ...st.dismissedCats, [x.p.cat]: (st.dismissedCats[x.p.cat] || 0) + 1 } })); api.toast('Got it — fewer ' + x.p.cat + ' picks like this'); };
  const lbl = t => <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: 'var(--text-muted)', margin: '14px 0 8px' }}>{t}</div>;
  const prefLabel = (PREFS.find(p => p[0] === P.discoverPref) || [])[1];
  return <div>
    <AppHeader title="Try Something New" subtitle="One honest pick — never a paid placement" />
    <div style={{ padding: '18px 16px 28px' }}>
      <Card tone="white" padding="2px 16px 16px" shadow="md">
        {lbl('I’m looking for')}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{PREFS.map(([k, l]) => <Pill key={k} size="sm" active={P.discoverPref === k} onClick={() => setP({ discoverPref: k })}>{l}</Pill>)}</div>
        {lbl('Category')}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -16px', padding: '2px 16px 8px' }}>{DCATS.map(c => <CategoryChip key={c} category={c} label={c === 'any' ? 'Any' : undefined} selected={P.discoverCat === c} onClick={() => setP({ discoverCat: c })} style={{ height: 34, fontSize: 14 }} />)}</div>
        {lbl('Only from stores I shop')}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{D.RETAILERS.map(rt => <Pill key={rt.id} size="sm" active={P.retailers[rt.id]} onClick={() => setP({ retailers: { ...P.retailers, [rt.id]: !P.retailers[rt.id] } })}>{rt.name}</Pill>)}</div>
      </Card>

      <SectionTitle action={x && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.poolSize} match{r.poolSize === 1 ? '' : 'es'}</span>}>Your pick this week</SectionTitle>
      {x ? <Card tone="lime" padding={18}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ProductTile pid={x.p.id} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>{x.p.name}</div>
            <div style={{ fontSize: 13, color: 'var(--night-700)', marginTop: 2 }}>{x.p.brand} · {D.fmtQty(x.p.size, x.p.unit)}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {x.at.map(rt => <span key={rt.id} style={{ background: 'var(--surface-raised)', border: '2px solid var(--ink)', borderRadius: 12, padding: '5px 10px', fontSize: 13 }}>{rt.name} <b style={{ color: 'var(--price)' }}>{D.fmt(x.p.prices[rt.id][0])}</b></span>)}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: 'var(--night-700)', margin: '16px 0 6px' }}>Why this was suggested</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <ReasonTag kind="preference">You asked for {prefLabel.toLowerCase()}</ReasonTag>
          <ReasonTag kind="category">{P.discoverCat === 'any' ? (x.catBuys ? 'You buy ' + x.p.cat + ' often (' + x.catBuys + ' recent)' : 'New category for you') : 'In your chosen category: ' + x.p.cat}</ReasonTag>
          <ReasonTag kind="availability">In stock at {x.at.map(a => a.name).join(' & ')}</ReasonTag>
          <ReasonTag kind="history">Not in your pantry or history yet</ReasonTag>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Button size="sm" icon="plus" onClick={() => api.addPid(x.p.id)}>Add to list</Button>
          <Button size="sm" variant="secondary" icon="thumbs-down" onClick={dismiss}>Not for me</Button></div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 14, fontSize: 11.5, color: 'var(--night-700)' }}><Icon name="shield-check" size={14} />Not sponsored. Ranked only by your settings, purchase history and dismissals.</div>
      </Card>
        : <Card padding={0}><EmptyState icon="sparkles" title="Nothing new fits" body={r.excluded ? 'Matches exist but none are stocked at the stores you selected. Try adding a store.' : 'No untried ' + prefLabel.toLowerCase() + ' items in this category. Try another category or reset dismissals.'} /></Card>}

      {s.dismissed.length > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-secondary)' }}>
        <span>Dismissed: {s.dismissed.map(id => D.byId[id].name).join(', ')}</span>
        <TextLink onClick={() => set(st => ({ ...st, dismissed: [], dismissedCats: {} }))}>Undo all</TextLink></div>}
    </div>
  </div>;
}
window.Discover = Discover;
