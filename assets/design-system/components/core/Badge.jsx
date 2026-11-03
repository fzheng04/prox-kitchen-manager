import React from 'react';
const T = {
  amber: ['var(--badge)', 'var(--ink)', true],
  gold: ['var(--mustard-300)', 'var(--ink)', false],
  forest: ['var(--surface-header)', 'var(--text-on-dark)', false],
  green: ['var(--accent)', 'var(--text-on-accent)', false],
  red: ['var(--danger-bg)', 'var(--danger)', false],
  outline: ['var(--surface-raised)', 'var(--text-primary)', true],
  muted: ['var(--oat-200)', 'var(--text-secondary)', false],
};
export function Badge({ children, tone = 'amber', icon, style }) {
  const [bg, fg, b] = T[tone] || T.amber;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 10px', borderRadius: 999,
    background: bg, color: fg, border: b ? '2px solid var(--ink)' : 'none', fontFamily: 'var(--font-display)', fontWeight: 800,
    fontSize: 12, letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', whiteSpace: 'nowrap', boxSizing: 'border-box', ...style }}>{icon}{children}</span>;
}