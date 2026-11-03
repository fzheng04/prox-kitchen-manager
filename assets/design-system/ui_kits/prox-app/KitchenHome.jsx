function KitchenHome({ api }) {
  const { AppHeader, IconButton, Card, Button, ReasonTag, CategoryChip, ProgressBar, Badge, Icon } = window.Prox;
  const { s, set } = api; const D = ProxData;
  const [cat, setCat] = React.useState('all');
  const sug = D.suggestions(s);
  const low = s.pantry.filter(p => p.qty <= p.par);
  const wk = D.weekly(s);
  const pantry = s.pantry.filter(p => cat === 'all' || D.byId[p.pid].cat === cat);
  const fresh = sug.filter(x => !x.onList);
  const ringBell = () => { const n = D.advance(s, 0); set(x => ({ ...x, reminder: n.reminder })); if (!n.reminder) api.toast('Nothing needs restocking right now'); };
  return <div>
    <AppHeader title="My Kitchen" subtitle={D.dayLabel(s.day) + ' · here’s what needs attention'}
      right={<IconButton icon="bell" label="Reminders" variant="glass" size={42} onClick={ringBell} />} />
    <div style={{ padding: '18px 16px 28px' }}>
      <Card tone="white" padding="14px 16px" shadow="md">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--text-secondary)' }}>This week’s value</span>
          <TextLink onClick={() => api.go('trips')}>Trips</TextLink></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[['Saved', D.fmt(wk.saved), wk.trips ? (wk.saved >= wk.lastSaved ? 'up from ' : 'vs ') + D.fmt(wk.lastSaved) + ' last wk' : 'last wk ' + D.fmt(wk.lastSaved), true],
            ['Spent', D.fmt(wk.spent), wk.trips + ' trip' + (wk.trips === 1 ? '' : 's')],
            ['Restocked', String(wk.restocked), 'items to pantry']].map(([l, v, c, g]) =>
            <div key={l}><div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{l}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: g ? 'var(--price)' : 'var(--text-primary)', lineHeight: 1.1 }}>{v}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{c}</div></div>)}
        </div>
      </Card>

      <SectionTitle action={low.length ? <Badge tone="red">{low.length} low</Badge> : <Badge tone="green">All stocked</Badge>}>Running low</SectionTitle>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '2px 4px 8px', margin: '0 -16px', paddingLeft: 16 }}>
        {low.length ? low.map(p => { const pr = D.byId[p.pid]; return <div key={p.g} style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px 8px 8px', background: 'var(--surface-raised)', border: 'var(--outline)', borderRadius: 999, boxShadow: 'var(--shadow-hard-sm)' }}>
          <ProductTile pid={p.pid} size={32} /><span><b style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>{pr.g[0].toUpperCase() + pr.g.slice(1)}</b><br /><span style={{ fontSize: 12, color: 'var(--danger)' }}>{D.fmtQty(p.qty, pr.unit)} left</span></span></div>; })
          : <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Nothing is below its restock level.</span>}
      </div>

      <SectionTitle action={fresh.length > 1 && <TextLink onClick={() => { fresh.forEach(x => api.addPid(x.pid, true)); api.toast('Added ' + fresh.length + ' items to your list'); }}>Add all</TextLink>}>Suggested restocks</SectionTitle>
      <div style={{ display: 'grid', gap: 12 }}>
        {sug.length ? sug.slice(0, 4).map(x => { const p = D.byId[x.pid]; return <Card key={x.g} tone="cream" padding={14} shadow="md">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <ProductTile pid={x.pid} />
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>{p.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{p.brand} · {D.fmtQty(p.size, p.unit)}</div></div>
            {x.onList ? <Badge tone="muted" icon={<Icon name="check" size={12} />}>On list</Badge> : <Button size="sm" icon="plus" onClick={() => api.addPid(x.pid)}>Add</Button>}
          </div>
          <div style={{ fontSize: 11.5, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-muted)', margin: '12px 0 6px' }}>Why we suggest it</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{x.reasons.map(([k, t]) => <ReasonTag key={k} kind={k}>{t}</ReasonTag>)}</div>
        </Card>; })
        : <Card padding={18}><div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Your kitchen is stocked. We’ll suggest restocks as items run low.</div></Card>}
      </div>

      <SectionTitle action={<span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.pantry.length} items</span>}>Pantry</SectionTitle>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '2px 16px 12px', margin: '0 -16px' }}>
        {['all', 'produce', 'dairy', 'meat', 'pantry'].map(c => <CategoryChip key={c} category={c} selected={cat === c} onClick={() => setCat(c)} />)}
      </div>
      <Card tone="white" padding="4px 14px" shadow="md">
        {pantry.map((p, i) => { const pr = D.byId[p.pid]; const days = p.perDay ? p.qty / p.perDay : 99; const lvl = Math.min(1, p.qty / (p.par * 3));
          return <div key={p.g} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? '1.5px solid var(--stone-200)' : 0 }}>
            <ProductTile pid={p.pid} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5 }}>{pr.name}</span><span style={{ fontSize: 13, color: p.qty <= p.par ? 'var(--danger)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{D.fmtQty(p.qty, pr.unit)}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}><ProgressBar value={lvl} height={6} tone={p.qty <= p.par ? 'red' : lvl < .5 ? 'amber' : 'green'} style={{ flex: 1 }} />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', width: 64, textAlign: 'right' }}>{days < 1 ? 'out soon' : days > 30 ? '30+ days' : '~' + Math.round(days) + ' days'}</span></div>
            </div></div>; })}
      </Card>
    </div>
  </div>;
}
window.KitchenHome = KitchenHome;
