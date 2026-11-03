function Trips({ api }) {
  const { AppHeader, Card, SavingsCard, Badge } = window.Prox;
  const { s } = api; const D = ProxData;
  const wk = D.weekly(s);
  const trips = s.history.slice().reverse();
  const total = s.history.reduce((a, h) => a + h.saved, 0);
  return <div>
    <AppHeader title="Trips & Savings" subtitle="Every completed trip restocks your pantry" />
    <div style={{ padding: '22px 16px 28px' }}>
      <SavingsCard label="Saved since you started" amount={D.fmt(total)} caption={'across ' + s.history.length + ' trips'} badge={'Week ' + wk.w} progress={Math.min(1, total / 40)} />
      <SectionTitle>Mock clock</SectionTitle>
      <Card tone="white" padding={16} shadow="md"><ClockControls api={api} />
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.4 }}>Advancing uses up pantry stock at each item’s usual rate and can trigger a simulated restock reminder.</div></Card>
      <SectionTitle>History</SectionTitle>
      <div style={{ display: 'grid', gap: 12 }}>
        {trips.map(h => { const r = D.RETAILERS.find(x => x.id === h.retailer); return <Card key={h.id} tone="cream" padding={14} shadow="sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-deep)', color: 'var(--sage-300)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{r.short}</span>
            <div style={{ flex: 1 }}><div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{r.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{h.day < 0 ? Math.abs(h.day) + ' days before demo' : D.dayLabel(h.day)} · {h.items.length} items{h.missing ? ' · ' + h.missing + ' missing' : ''}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>{D.fmt(h.total)}</div>
              {h.saved > 0 && <Badge tone="green" style={{ height: 20, fontSize: 10.5 }}>Saved {D.fmt(h.saved)}</Badge>}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>{h.items.map(([pid, q]) => <span key={pid} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 8, background: 'var(--cat-' + D.byId[pid].cat + '-bg)' }}>{q > 1 ? q + '× ' : ''}{D.byId[pid].name}</span>)}</div>
        </Card>; })}
      </div>
    </div>
  </div>;
}
window.Trips = Trips;
