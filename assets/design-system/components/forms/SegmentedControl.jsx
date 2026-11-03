import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function SegmentedControl({ options, value, onChange, tone = 'forest', style }) {
  const activeBg = tone === 'green' ? 'var(--surface-deep)' : 'var(--surface-header)';
  const idleBg = tone === 'green' ? 'var(--oat-100)' : 'transparent';
  return <div role="tablist" style={{ display: 'flex', gap: tone === 'green' ? 10 : 4, padding: 6, borderRadius: 'var(--radius-md)',
    border: 'var(--outline)', background: tone === 'green' ? 'var(--surface-card)' : 'var(--surface-raised)', boxShadow: 'var(--shadow-hard)', ...style }}>
    {options.map(o => { const a = o.value === value; return <button key={o.value} role="tab" aria-selected={a} type="button" onClick={() => onChange && onChange(o.value)}
      style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: o.sublabel ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: o.sublabel ? 2 : 8,
        minHeight: o.sublabel ? 58 : 40, padding: '4px 10px', borderRadius: 10, border: 0, cursor: 'pointer',
        background: a ? activeBg : idleBg, color: a ? 'var(--text-on-dark)' : (tone === 'green' ? 'var(--text-secondary)' : 'var(--text-primary)'),
        transition: 'background var(--dur-base) var(--ease-out)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: o.sublabel ? 17 : 14.5, whiteSpace: 'nowrap' }}>
        {o.icon && <Icon name={o.icon} size={18} />}{o.label}</span>
      {o.sublabel && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, opacity: .85 }}>{o.sublabel}</span>}
    </button>; })}
  </div>;
}