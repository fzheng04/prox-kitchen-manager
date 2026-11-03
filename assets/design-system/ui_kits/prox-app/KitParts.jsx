// Kit-local helpers (not design-system primitives): store, sheet, toast, product tile, section title.
const KIT_KEY = 'kitchen-kit-v1';
function useProxStore() {
  const [s, setS] = React.useState(() => {
    try { const j = JSON.parse(localStorage.getItem(KIT_KEY)); if (j && j.v === 2) return j; } catch (e) {}
    return ProxData.initialState();
  });
  React.useEffect(() => { localStorage.setItem(KIT_KEY, JSON.stringify(s)); }, [s]);
  return [s, setS];
}

function ProductTile({ pid, size = 44 }) {
  const { Icon } = window.Prox; const p = ProxData.byId[pid];
  return <span style={{ flex: 'none', width: size, height: size, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--cat-' + p.cat + '-bg)', border: '2px solid var(--ink)' }}>
    <Icon name={p.icon} size={Math.round(size * .5)} color="var(--ink)" /></span>;
}

function SectionTitle({ children, action }) {
  return <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, margin: '26px 2px 12px' }}>
    <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21 }}>{children}</h2>{action}</div>;
}

function TextLink({ children, onClick, color }) {
  return <button type="button" onClick={onClick} style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: color || 'var(--tomato-600)' }}>{children}</button>;
}

function Sheet({ open, onClose, title, children }) {
  const { IconButton } = window.Prox;
  if (!open) return null;
  const root = document.getElementById('sheet-root');
  return ReactDOM.createPortal(<div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(3,46,32,.45)', animation: 'proxFade .2s ease' }} />
    <div style={{ position: 'relative', background: 'var(--surface-card)', borderRadius: '24px 24px 0 0', borderTop: 'var(--outline)', boxShadow: 'var(--shadow-sheet)', padding: '10px 18px 30px', maxHeight: '82%', overflowY: 'auto', animation: 'proxUp .26s cubic-bezier(.2,.8,.2,1)' }}>
      <div style={{ width: 44, height: 5, borderRadius: 3, background: 'var(--stone-300)', margin: '0 auto 12px' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>{title}</h3>
        <IconButton icon="x" label="Close" size={38} onClick={onClose} /></div>
      {children}
    </div>
  </div>, root);
}

function Toast({ msg }) {
  if (!msg) return null;
  return <div style={{ position: 'absolute', left: 16, right: 16, bottom: 104, zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
    <div key={msg.k} style={{ background: 'var(--ink)', color: '#fff', borderRadius: 999, padding: '10px 18px', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14, boxShadow: '0 8px 20px rgba(0,0,0,.2)', animation: 'proxUp .22s ease' }}>{msg.text}</div></div>;
}

function ReminderBanner({ reminder, onAdd, onClose }) {
  const { Icon, Button } = window.Prox;
  if (!reminder) return null;
  return <div style={{ position: 'absolute', top: 50, left: 10, right: 10, zIndex: 45, background: 'rgba(252,247,240,.97)', backdropFilter: 'blur(10px)', border: 'var(--outline)', borderRadius: 22, boxShadow: 'var(--shadow-hard)', padding: '12px 14px', animation: 'proxDown .3s cubic-bezier(.2,.8,.2,1)' }}>
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ flex: 'none', width: 34, height: 34, borderRadius: 10, background: 'var(--night-900)', display: 'grid', placeItems: 'center' }}><Icon name="bell" size={18} color="var(--sage-400)" /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Restock reminder</span><span>now</span></div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginTop: 2 }}>{reminder.text}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>Why: {reminder.why}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><Button size="sm" icon="plus" onClick={onAdd}>Add to list</Button><Button size="sm" variant="ghost" onClick={onClose}>Later</Button></div>
      </div>
    </div>
    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>Simulated in-app reminder — no notification permission needed.</div>
  </div>;
}

Object.assign(window, { useProxStore, ProductTile, SectionTitle, TextLink, Sheet, Toast, ReminderBanner });
