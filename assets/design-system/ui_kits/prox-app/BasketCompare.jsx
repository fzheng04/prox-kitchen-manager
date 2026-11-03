function BasketCompare({ api }) {
  const { AppHeader, IconButton, SegmentedControl, RetailerRow, Badge, Button, Card, Icon } = window.Prox;
  const { s, set } = api; const D = ProxData;
  const [view, setView] = React.useState('total');
  const cmp = D.compare(s);
  const [sel, setSel] = React.useState(cmp.best ? cmp.best.r.id : cmp.rows[0] && cmp.rows[0].r.id);
  const [open, setOpen] = React.useState(sel);
  const row = cmp.rows.find(r => r.r.id === sel);
  const minAll = Math.min(...cmp.rows.map(r => r.total));
  const cheapestIncomplete = cmp.rows.find(r => r.covered < r.of && r.total === minAll && (!cmp.best || r.total < cmp.best.total));
  const setOverride = (rid, itemId, pid) => set(x => ({ ...x, overrides: { ...x.overrides, [rid]: { ...(x.overrides[rid] || {}), [itemId]: pid } } }));
  const finish = () => {
    if (!row || !row.covered) return;
    set(x => ({ ...D.completeTrip(x, row), route: null, tab: 'home' }));
    api.toast('Trip saved · ' + row.covered + ' items added to pantry');
  };
  const unitLbl = l => D.fmt(l.unit * (l.pick.baseUnit === 'ct' ? 1 : 1)) + '/' + l.pick.baseUnit;

  return <div style={{ minHeight: '100%', background: 'var(--surface-app)' }}>
    <AppHeader compact title="Compare Basket" subtitle={cmp.count + ' priced item' + (cmp.count === 1 ? '' : 's') + ' · 3 stores'}
      left={<IconButton icon="chevron-left" label="Back" size={42} onClick={() => api.route(null)} />} />
    <div style={{ padding: '18px 16px 32px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 14 }}>
      <SegmentedControl tone="green" value={view} onChange={setView} options={[
        { value: 'total', label: 'Cart total', sublabel: cmp.best ? 'from ' + D.fmt(cmp.best.total) : 'by store' },
        { value: 'unit', label: 'Unit price', sublabel: 'per oz · ct · lb' }]} />

      {cmp.unresolved.length > 0 && <Card tone="white" padding={12} shadow="sm" onClick={() => api.route(null)}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5 }}><Icon name="triangle-alert" size={18} color="var(--badge)" />
          <span style={{ flex: 1 }}><b>{cmp.unresolved.length} item{cmp.unresolved.length > 1 ? 's' : ''} not priced</b> — {cmp.unresolved.map(i => i.text).join(', ')}. Resolve on your list.</span><Icon name="chevron-right" size={18} /></div></Card>}

      <div style={{ fontSize: 14.5, lineHeight: 1.45, padding: '0 2px', textWrap: 'pretty' }}>
        {cmp.best ? <span><b>{cmp.best.r.name}</b> has everything for <b style={{ color: 'var(--price)' }}>{D.fmt(cmp.best.total)}</b>{cmp.highest > cmp.best.total ? ' — ' + D.fmt(cmp.highest - cmp.best.total) + ' less than the priciest full cart.' : '.'}</span>
          : cmp.count ? <span><b>No store carries your whole list.</b> Totals below leave out missing items, so they aren’t directly comparable.</span> : <span>Add items to your list to compare stores.</span>}
        {cheapestIncomplete && <span style={{ display: 'block', marginTop: 6, color: 'var(--text-secondary)', fontSize: 13 }}>{cheapestIncomplete.r.name} looks cheaper at {D.fmt(cheapestIncomplete.total)}, but it’s missing {cheapestIncomplete.missing.map(l => l.want.name).join(', ')}.</span>}
      </div>

      {cmp.rows.map((x, i) => <RetailerRow key={x.r.id} rank={i + 1} name={x.r.name} logoText={x.r.short}
        itemsLabel={x.covered + ' of ' + x.of + ' items'} price={D.fmt(x.total) + (x.covered < x.of ? '*' : '')}
        badge={cmp.best && cmp.best.r.id === x.r.id ? 'Best deal' : null} selected={sel === x.r.id} expanded={open === x.r.id}
        onToggle={() => { setSel(x.r.id); setOpen(open === x.r.id ? null : x.r.id); }}
        flags={<React.Fragment>{x.missing.length > 0 && <Badge tone="red">Missing {x.missing.length}</Badge>}{x.stale > 0 && <Badge tone="muted" icon={<Icon name="clock" size={11} />}>{x.stale} stale</Badge>}</React.Fragment>}>
        <div style={{ display: 'grid', gap: 10, fontSize: 13.5 }}>
          {x.lines.map(l => l.missing ? <div key={l.it.id} style={{ display: 'flex', gap: 8, alignItems: 'center', color: sel === x.r.id ? '#FFB4A8' : 'var(--danger)' }}><Icon name="circle-x" size={16} /><span><b>{l.want.name}</b> — not carried here{l.it.pinOrganic || l.it.pinBrand ? ' with your pins' : ''}. Stays on your list.</span></div> :
            <div key={l.it.id} style={{ borderTop: '1px solid rgba(255,255,255,.14)', paddingTop: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <span style={{ flex: 1 }}>{l.qty} × {l.pick.name} <span style={{ opacity: .7 }}>· {D.fmtQty(l.pick.size, l.pick.unit)}</span></span>
                <b style={{ whiteSpace: 'nowrap' }}>{view === 'unit' ? unitLbl(l) : D.fmt(l.total)}</b></div>
              {l.stale && <div style={{ fontSize: 12, marginTop: 3, color: 'var(--mustard-300)' }}>Price last seen {l.age} days ago — may have changed</div>}
              {l.sub && <div style={{ fontSize: 12, marginTop: 4, opacity: .85, lineHeight: 1.4 }}>↳ Substitution: {l.sub}</div>}
              {l.alts.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>{l.alts.map(a => { const u = a.prices[x.r.id][0] / a.base, cheaper = u < l.unit;
                return <button key={a.id} type="button" onClick={() => setOverride(x.r.id, l.it.id, a.id)} style={{ border: '1.5px solid currentColor', borderRadius: 999, padding: '3px 10px', background: 'transparent', color: 'inherit', fontSize: 12, cursor: 'pointer', opacity: .9, whiteSpace: 'nowrap' }}>
                  Swap: {a.name} {view === 'unit' ? D.fmt(u) + '/' + a.baseUnit : D.fmt(a.prices[x.r.id][0])}{cheaper ? ' ↓' : ''}</button>; })}</div>}
            </div>)}
          {x.covered < x.of && <div style={{ fontSize: 12, opacity: .75 }}>* Total excludes {x.of - x.covered} missing item{x.of - x.covered > 1 ? 's' : ''}.</div>}
        </div>
      </RetailerRow>)}

      <p style={{ fontStyle: 'italic', fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', margin: '4px 6px' }}>Prices older than {D.STALE_DAYS} days are flagged. Unit view compares price per ounce, count or pound.</p>
      {row && <div style={{ display: 'grid', gap: 6 }}>
        <Button variant="dark" size="lg" icon="check" fullWidth disabled={!row.covered} onClick={finish} style={{ whiteSpace: 'normal' }}>Complete trip at {row.r.name}</Button>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', textAlign: 'center' }}>Marks {row.covered} item{row.covered === 1 ? '' : 's'} bought, updates pantry &amp; history{row.missing.length ? ' · ' + row.missing.length + ' stay on your list' : ''}.</div>
      </div>}
    </div>
  </div>;
}
window.BasketCompare = BasketCompare;
