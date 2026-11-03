const CAT_FILTERS = [['meat', 'Meats'], ['produce', 'Fruits & Veggies'], ['dairy', 'Dairy'], ['pantry', 'Pantry'], ['essentials', 'Essentials']];

function GroceryList({ api }) {
  const { AppHeader, IconButton, SavingsCard, CategoryChip, NotebookList, NotebookRow, QuantityStepper, Button, Badge, Icon } = window.Prox;
  const { s, set } = api; const D = ProxData;
  const [draft, setDraft] = React.useState('');
  const [cat, setCat] = React.useState(null);
  const [edit, setEdit] = React.useState(null);
  const [resolve, setResolve] = React.useState(null);
  const [prefs, setPrefs] = React.useState(false);
  const lastAdd = React.useRef(0), lastStep = React.useRef({});
  const cmp = D.compare(s);
  const results = D.search(draft);
  const best = cmp.best;
  const saved = best ? cmp.highest - best.total : 0;
  const pct = best && cmp.highest ? Math.round(saved / cmp.highest * 100) : 0;
  const upd = (id, patch) => set(x => ({ ...x, list: x.list.map(i => i.id === id ? { ...i, ...patch } : i) }));
  const guard = () => { const n = Date.now(); if (n - lastAdd.current < 700) return false; lastAdd.current = n; return true; };

  const addResolved = pid => { if (!guard()) return; if (api.addPid(pid)) setDraft(''); };
  const submit = () => {
    const q = draft.trim(); if (!q || !guard()) return;
    const m = D.genericMatches(q);
    if (m.length === 1) { if (api.addPid(m[0].id)) setDraft(''); return; }
    if (s.list.some(i => i.text.toLowerCase() === q.toLowerCase())) { api.toast('“' + q + '” is already on your list'); return; }
    const id = 'l' + s.nextId;
    set(x => ({ ...x, nextId: x.nextId + 1, list: [...x.list, { id, pid: null, text: q[0].toUpperCase() + q.slice(1), qty: 1, unit: 'ct', pinOrganic: false, pinBrand: null, candidates: m.map(p => p.id) }] }));
    setDraft('');
    if (m.length) setResolve(id); else api.toast('Added as a custom item — not priced');
  };
  const step = (it, v) => { const n = Date.now(), l = lastStep.current[it.id] || 0; if (n - l < 180) return; lastStep.current[it.id] = n; upd(it.id, { qty: v }); };
  const shown = s.list.filter(i => !cat || (i.pid && D.byId[i.pid].cat === cat));
  const editing = s.list.find(i => i.id === edit);
  const resolving = s.list.find(i => i.id === resolve);

  return <div>
    <AppHeader title="Grocery List" subtitle="Priced across 3 nearby stores"
      right={<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><IconButton icon="shopping-cart" label="Compare" badge={s.list.length || null} size={46} onClick={() => api.route('compare')} />
        <span style={{ fontSize: 13 }}>{best ? D.fmt(best.total) : '—'}</span></div>} />
    <div style={{ padding: '22px 16px 28px' }}>
      <SavingsCard amount={D.fmt(saved)} badge={pct + '% less'} progress={pct / 30}
        caption={best ? 'vs. the priciest full cart' : cmp.count ? 'no store has your full list' : 'add items to see savings'} onInfo={() => api.toast('Best complete cart vs. most expensive complete cart')} />
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '26px 16px 6px', margin: '0 -16px' }}>
        {CAT_FILTERS.map(([c, l]) => <CategoryChip key={c} category={c} label={l} selected={cat === c} onClick={() => setCat(cat === c ? null : c)} />)}
      </div>
      <NotebookList title="This week" count={s.list.length + ' item' + (s.list.length === 1 ? '' : 's')} style={{ marginTop: 18 }}>
        {shown.map(it => { const p = it.pid && D.byId[it.pid];
          const sub = p ? <React.Fragment><span>{p.name} · {D.fmtQty(p.size, p.unit)}</span>{it.pinOrganic && <Badge tone="green" style={{ height: 18, fontSize: 10 }}>Organic</Badge>}{it.pinBrand && <Badge tone="forest" style={{ height: 18, fontSize: 10 }}>{it.pinBrand}</Badge>}</React.Fragment>
            : it.candidates && it.candidates.length ? <span style={{ textDecoration: 'underline' }}>Pick which {it.text.toLowerCase()} · {it.candidates.length} matches</span> : <span>Custom item · not priced</span>;
          return <NotebookRow key={it.id} text={it.text} sub={sub} warning={!p} onClick={() => p ? setEdit(it.id) : it.candidates && it.candidates.length ? setResolve(it.id) : setEdit(it.id)}
            onAdd={() => step(it, it.qty + 1)}
            meta={<QuantityStepper size="sm" value={it.qty} min={1} unit={it.unit} onChange={v => step(it, v)} />}
            onRemove={() => set(x => ({ ...x, list: x.list.filter(i => i.id !== it.id) }))} />; })}
        <NotebookRow input value={draft} onChange={setDraft} onSubmit={submit} onAdd={submit} addDisabled={!draft.trim()} />
        {results.length > 0 && <div style={{ margin: '4px 14px 0 62px', background: 'var(--surface-raised)', border: 'var(--outline)', borderRadius: 16, boxShadow: 'var(--shadow-hard-sm)', overflow: 'hidden' }}>
          {results.map((p, i) => { const prices = Object.values(p.prices).map(x => x[0]); return <button key={p.id} type="button" onClick={() => addResolved(p.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: 0, borderTop: i ? '1.5px solid var(--stone-200)' : 0, background: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <ProductTile pid={p.id} size={30} /><span style={{ flex: 1, minWidth: 0 }}><b style={{ fontFamily: 'var(--font-display)', fontSize: 14.5 }}>{p.name}</b><br /><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.brand} · {D.fmtQty(p.size, p.unit)}{p.organic ? ' · organic' : ''}</span></span>
            <span style={{ fontSize: 12.5, color: 'var(--price)' }}>from {D.fmt(Math.min(...prices))}</span></button>; })}
        </div>}
      </NotebookList>
      <p style={{ fontStyle: 'italic', fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', margin: '22px 8px 16px' }}>Prices update weekly and can differ by store location.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => setPrefs(true)} style={{ flex: 'none', width: 84, height: 60, borderRadius: 'var(--radius-md)', border: 'var(--outline)', background: 'var(--surface-raised)', boxShadow: 'var(--shadow-hard-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12 }}><Icon name="sliders-horizontal" size={20} />Prefs</button>
        <Button size="lg" iconRight="arrow-right" fullWidth style={{ height: 60, flex: 1 }} disabled={!s.list.length} onClick={() => api.route('compare')}>Compare stores</Button>
      </div>
    </div>

    <Sheet open={!!resolving} onClose={() => setResolve(null)} title={resolving ? 'Which ' + resolving.text.toLowerCase() + '?' : ''}>
      {resolving && <div style={{ display: 'grid', gap: 10 }}>
        <p style={{ margin: '0 0 4px', fontSize: 14, color: 'var(--text-secondary)' }}>“{resolving.text}” matches several products. Pick one so we can price it.</p>
        {(resolving.candidates || []).map(pid => { const p = D.byId[pid]; const pr = Object.values(p.prices).map(x => x[0]); return <button key={pid} type="button" onClick={() => { if (s.list.some(i => i.pid && D.byId[i.pid].g === p.g && i.id !== resolving.id)) { api.toast(p.name + ' is already on your list'); return; } upd(resolving.id, { pid, unit: p.unit, candidates: null, pinOrganic: p.organic && p.cat === 'produce' }); setResolve(null); api.toast('Matched to ' + p.name); }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: 'var(--outline)', borderRadius: 16, background: 'var(--surface-raised)', boxShadow: 'var(--shadow-hard-sm)', cursor: 'pointer', textAlign: 'left' }}>
          <ProductTile pid={pid} size={38} /><span style={{ flex: 1 }}><b style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{p.name}</b><br /><span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{p.brand} · {D.fmtQty(p.size, p.unit)} · {Object.keys(p.prices).length} of 3 stores</span></span>
          <span style={{ fontSize: 13, color: 'var(--price)' }}>{D.fmt(Math.min(...pr))}–{D.fmt(Math.max(...pr))}</span></button>; })}
        <Button variant="ghost" size="sm" onClick={() => { upd(resolving.id, { candidates: null }); setResolve(null); }}>Keep as custom item</Button>
      </div>}
    </Sheet>

    <Sheet open={!!editing} onClose={() => setEdit(null)} title="Edit item">
      {editing && <EditItem it={editing} upd={upd} api={api} close={() => setEdit(null)} />}
    </Sheet>

    <Sheet open={prefs} onClose={() => setPrefs(false)} title="Shopping preferences">
      <Toggle label="Prefer organic produce" sub="Suggestions and new produce items default to organic" on={s.prefs.organicProduce} onChange={v => set(x => ({ ...x, prefs: { ...x.prefs, organicProduce: v } }))} />
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12 }}>Pin a brand or organic per item by tapping it on your list.</div>
    </Sheet>
  </div>;
}

function Toggle({ label, sub, on, onChange }) {
  return <button type="button" onClick={() => onChange(!on)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', border: 0, background: 'none', cursor: 'pointer', textAlign: 'left' }}>
    <span style={{ flex: 1 }}><b style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{label}</b>{sub && <><br /><span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{sub}</span></>}</span>
    <span style={{ width: 50, height: 30, borderRadius: 999, border: 'var(--outline)', background: on ? 'var(--accent)' : 'var(--stone-300)', position: 'relative', transition: 'background .2s' }}>
      <i style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 21, height: 21, borderRadius: '50%', background: '#fff', border: '2px solid var(--ink)', transition: 'left .2s var(--ease-spring)' }} /></span></button>;
}

function EditItem({ it, upd, api, close }) {
  const { QuantityStepper, Button, Pill } = window.Prox; const D = ProxData;
  const p = it.pid && D.byId[it.pid];
  const fam = p ? D.CATALOG.filter(x => x.g === p.g) : [];
  const brands = [...new Set(fam.map(x => x.brand))];
  const units = [...new Set(['ct', 'lb', 'oz', 'gal', 'loaf', 'bag', p && p.unit].filter(Boolean))];
  const lbl = t => <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: 'var(--text-muted)', margin: '16px 0 8px' }}>{t}</div>;
  return <div>
    {lbl('Name on list')}
    <input value={it.text} onChange={e => upd(it.id, { text: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', height: 46, padding: '0 14px', border: 'var(--outline)', borderRadius: 14, background: 'var(--surface-raised)', fontFamily: 'var(--font-body)', fontSize: 17 }} />
    {lbl('Quantity')}
    <QuantityStepper value={it.qty} min={1} unit={it.unit} units={units} onChange={v => upd(it.id, { qty: v })} onUnitChange={u => upd(it.id, { unit: u })} />
    {p && <React.Fragment>
      {lbl('Product')}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{fam.map(x => <Pill key={x.id} size="sm" active={x.id === it.pid} onClick={() => upd(it.id, { pid: x.id, unit: x.unit })}>{x.name}</Pill>)}</div>
      {lbl('Pins — used when comparing stores')}
      <Toggle label="Organic only" sub="Never substitute a non-organic version" on={!!it.pinOrganic} onChange={v => upd(it.id, { pinOrganic: v })} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Brand:</span>
        <Pill size="sm" active={!it.pinBrand} onClick={() => upd(it.id, { pinBrand: null })}>Any</Pill>
        {brands.map(b => <Pill key={b} size="sm" active={it.pinBrand === b} onClick={() => upd(it.id, { pinBrand: b })}>{b}</Pill>)}</div>
    </React.Fragment>}
    <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
      <Button variant="secondary" icon="trash-2" onClick={() => { api.set(x => ({ ...x, list: x.list.filter(i => i.id !== it.id) })); close(); api.toast('Removed ' + it.text); }}>Delete</Button>
      <Button fullWidth onClick={close} style={{ flex: 1 }}>Done</Button></div>
  </div>;
}
Object.assign(window, { GroceryList, Toggle });
