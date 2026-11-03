import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Badge } from '../core/Badge.jsx';
export function RetailerRow({ rank, name, logoText, itemsLabel, price, badge, flags, selected, expanded, onToggle, children }) {
  const fg = selected ? 'var(--text-on-dark)' : 'var(--text-primary)';
  return <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', background: selected ? 'var(--surface-deep)' : 'var(--surface-card)',
    border: selected ? '2px solid var(--surface-deep)' : '2px solid var(--stone-200)', color: fg }}>
    <button type="button" onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: 0, background: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
      {rank != null && <span style={{ position: 'absolute', left: 8, top: 6, width: 24, height: 24, borderRadius: '50%', background: 'var(--mustard-300)', color: 'var(--ink)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{rank}</span>}
      <span style={{ flex: 'none', width: 50, height: 50, borderRadius: 14, display: 'grid', placeItems: 'center', background: selected ? 'rgba(255,255,255,.08)' : 'var(--oat-100)',
        border: selected ? '1.5px solid rgba(255,255,255,.18)' : '1.5px solid var(--stone-200)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: selected ? 'var(--sage-300)' : 'var(--night-700)' }}>{logoText}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 19 }}>{name}</span>{badge && <Badge tone="gold">{badge}</Badge>}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75 }}>{itemsLabel}</span>{flags}</span>
      </span>
      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 22, color: selected ? 'var(--price-on-dark)' : 'var(--price)' }}>{price}</span>
      <Icon name="chevron-down" size={20} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-base)' }} />
    </button>
    {expanded && children && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
  </div>;
}