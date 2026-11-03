function ClockControls({ api, dark }) {
  const { Button } = window.Prox; const { s, set } = api;
  const tick = d => set(x => ProxData.advance(x, d));
  return <div style={{ display: 'grid', gap: 10 }}>
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: dark ? '#fff' : 'var(--text-primary)' }}>{ProxData.dayLabel(s.day)} <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13, opacity: .7 }}>day {s.day}</span></div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button size="sm" variant="secondary" icon="clock" onClick={() => tick(1)}>+1 day</Button>
      <Button size="sm" icon="calendar" onClick={() => tick(7 - (s.day % 7 + 7) % 7)}>Jump to next week</Button>
      <Button size="sm" variant="secondary" icon="rotate-ccw" onClick={() => { set(ProxData.initialState()); api.toast('Scenario reset to Week 1'); }}>Reset</Button>
    </div>
  </div>;
}

function DemoPanel({ api }) {
  const { Button, Badge } = window.Prox;
  return <aside style={{ width: 300, maxWidth: '100%', display: 'grid', gap: 16, alignContent: 'start', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
    <div><Badge tone="forest">Demo controls</Badge>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '10px 0 0', lineHeight: 1.45 }}>Mock clock for the retention loop. Advancing time consumes pantry stock, changes suggestions and may fire a simulated restock reminder.</p></div>
    <ClockControls api={api} />
    <div style={{ display: 'grid', gap: 8, paddingTop: 14, borderTop: '2px solid var(--stone-200)' }}>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Everything persists locally. Restart the app to check:</div>
      <Button size="sm" variant="secondary" icon="refresh-cw" onClick={() => location.reload()}>Restart app</Button>
    </div>
    <ol style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, paddingLeft: 18, margin: 0 }}>
      <li>Kitchen: add a suggested restock</li><li>Grocery List: type “milk”, resolve, pin organic</li><li>Compare stores → pick a store → Complete trip</li><li>Jump to next week → reminder + new suggestions</li><li>Discover: dismiss a pick, watch it change</li>
    </ol>
  </aside>;
}

const TABS = [
  { key: 'home', label: 'Kitchen', icon: 'house' },
  { key: 'list', label: 'List', icon: 'shopping-cart' },
  { key: 'discover', label: 'Discover', icon: 'sparkles' },
  { key: 'trips', label: 'Trips', icon: 'receipt-text' },
];

function App() {
  const { TabBar } = window.Prox;
  const [s, set] = useProxStore();
  const [toast, setToast] = React.useState(null);
  const [scale, setScale] = React.useState(1);
  const scroller = React.useRef(null);
  React.useEffect(() => { const f = () => setScale(Math.min(1, (window.innerHeight - 32) / 864)); f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);
  const api = {
    s, set,
    toast: text => setToast({ text, k: Date.now() }),
    go: tab => { set(x => ({ ...x, tab, route: null })); if (scroller.current) scroller.current.scrollTop = 0; },
    route: r => { set(x => ({ ...x, route: r })); if (scroller.current) scroller.current.scrollTop = 0; },
    addPid: (pid, quiet) => {
      const p = ProxData.byId[pid];
      const dup = s.list.find(i => i.pid === pid || (i.pid && ProxData.byId[i.pid].g === p.g));
      if (dup) { api.toast(p.name + ' is already on your list'); return false; }
      set(x => ({ ...x, nextId: x.nextId + 1, list: [...x.list, { id: 'l' + x.nextId, pid, text: p.g[0].toUpperCase() + p.g.slice(1), qty: 1, unit: p.unit, pinOrganic: p.organic && p.cat === 'produce', pinBrand: null }] }));
      if (!quiet) api.toast('Added ' + p.name);
      return true;
    },
  };
  const screen = s.route === 'compare' ? <BasketCompare api={api} /> :
    s.tab === 'list' ? <GroceryList api={api} /> : s.tab === 'discover' ? <Discover api={api} /> : s.tab === 'trips' ? <Trips api={api} /> : <KitchenHome api={api} />;
  return <div style={{ minHeight: '100vh', display: 'flex', gap: 40, justifyContent: 'center', alignItems: 'flex-start', padding: 16, boxSizing: 'border-box', flexWrap: 'wrap' }}>
    <div style={{ width: 390 * scale, height: 844 * scale, flex: 'none' }}>
      <div data-screen-label={s.route || s.tab} style={{ width: 390, height: 844, transform: 'scale(' + scale + ')', transformOrigin: 'top left', borderRadius: 52, border: '10px solid #111', boxSizing: 'content-box', overflow: 'hidden', position: 'relative', background: 'var(--surface-app)', boxShadow: '0 30px 60px rgba(3,46,32,.25)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 46, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px 0 34px', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, background: 'var(--surface-header)' }}>
          <span>9:41</span><span style={{ width: 110, height: 30, borderRadius: 20, background: '#000', position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)' }} /><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><window.Prox.Icon name="signal" size={16} /><window.Prox.Icon name="wifi" size={16} /><window.Prox.Icon name="battery-full" size={20} /></span>
        </div>
        <div ref={scroller} id="phone-scroll" style={{ position: 'absolute', top: 46, left: 0, right: 0, bottom: s.route ? 0 : 84, overflowY: 'auto', overflowX: 'hidden' }}>{screen}</div>
        {!s.route && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20 }}><TabBar items={TABS.map(t => ({ ...t, badge: t.key === 'home' && !!s.reminder }))} active={s.tab} onChange={api.go} /></div>}
        <ReminderBanner reminder={s.reminder} onClose={() => set(x => ({ ...x, reminder: null }))}
          onAdd={() => { const r = s.reminder; set(x => ({ ...x, reminder: null })); api.addPid(r.pid); }} />
        <Toast msg={toast} />
        <div id="sheet-root" />
      </div>
    </div>
    <DemoPanel api={api} />
  </div>;
}
Object.assign(window, { App, ClockControls });
