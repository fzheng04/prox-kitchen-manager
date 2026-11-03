import React from 'react';
export function Pill({ children, active, onClick, size = 'md', style }) {
  const h = size === 'sm' ? 30 : 36;
  return <button type="button" onClick={onClick} aria-pressed={!!active}
    style={{ height: h, padding: '0 16px', borderRadius: 999, border: 'var(--outline)', flex: 'none', borderColor: active ? 'var(--surface-header)' : 'var(--border-strong)',
      background: active ? 'var(--surface-header)' : 'var(--surface-raised)', color: active ? 'var(--text-on-dark)' : 'var(--text-primary)',
      boxShadow: active ? 'none' : 'var(--shadow-hard-sm)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size === 'sm' ? 13 : 14.5,
      cursor: 'pointer', whiteSpace: 'nowrap', ...style }}>{children}</button>;
}