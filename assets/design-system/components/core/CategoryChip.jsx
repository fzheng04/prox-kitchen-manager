import React from 'react';
const KNOWN = ['produce', 'dairy', 'meat', 'pantry', 'essentials', 'frozen'];
export function CategoryChip({ category, label, selected, onClick, style }) {
  const all = !category || category === 'all';
  const c = KNOWN.includes(category) ? category : 'pantry';
  return <button type="button" onClick={onClick} aria-pressed={!!selected}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: all ? '0 16px' : '0 16px 0 10px', flex: 'none',
      borderRadius: 999, border: 'var(--outline)', cursor: 'pointer', whiteSpace: 'nowrap',
      background: all ? (selected ? 'var(--surface-header)' : 'var(--surface-raised)') : 'var(--cat-' + c + '-bg)',
      color: all && selected ? 'var(--text-on-dark)' : 'var(--text-primary)',
      boxShadow: selected ? 'var(--shadow-hard)' : 'var(--shadow-hard-sm)', transform: selected ? 'translateY(-1px)' : 'none',
      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, ...style }}>
    {!all && <i style={{ width: 18, height: 18, borderRadius: 6, border: '2px solid var(--ink)', background: 'var(--cat-' + c + ')',
      boxShadow: selected ? 'inset 0 0 0 2px #fff' : 'none' }} />}
    {label || (all ? 'All' : c[0].toUpperCase() + c.slice(1))}
  </button>;
}