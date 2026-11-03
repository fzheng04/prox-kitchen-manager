import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function TabBar({ items, active, onChange, style }) {
  return <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(' + items.length + ',1fr)', background: 'var(--surface-header)', padding: '8px 6px 22px', ...style }}>
    {items.map(it => { const a = it.key === active; return <button key={it.key} type="button" onClick={() => onChange && onChange(it.key)}
      style={{ border: 0, background: 'none', padding: '2px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer',
        color: a ? 'var(--text-on-dark)' : 'rgba(255,255,255,.55)' }}>
      <span style={{ position: 'relative', width: 56, height: 32, borderRadius: 999, display: 'grid', placeItems: 'center', background: a ? 'rgba(255,255,255,.13)' : 'transparent', transition: 'background var(--dur-base)' }}>
        <Icon name={it.icon} size={22} color={a ? 'var(--indicator)' : 'currentColor'} />
        {it.badge ? <b style={{ position: 'absolute', top: 2, right: 12, width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--surface-header)' }} /> : null}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontWeight: a ? 600 : 500, fontSize: 12 }}>{it.label}</span>
    </button>; })}
  </nav>;
}
