import React from 'react';
const T = {
  cream: ['var(--surface-card)', 'var(--text-primary)'],
  white: ['var(--surface-raised)', 'var(--text-primary)'],
  deep: ['var(--surface-deep)', 'var(--text-on-dark)'],
  lime: ['var(--sage-300)', 'var(--text-primary)'],
};
export function Card({ children, tone = 'cream', padding = 20, radius = 'lg', shadow = 'lg', onClick, style }) {
  const [bg, fg] = T[tone] || T.cream;
  return <div onClick={onClick} style={{ background: bg, color: fg, border: 'var(--outline)', borderRadius: 'var(--radius-' + radius + ')',
    boxShadow: shadow === 'none' ? 'none' : 'var(--shadow-' + (shadow === 'lg' ? 'hard-lg' : shadow === 'sm' ? 'hard-sm' : 'hard') + ')',
    padding, cursor: onClick ? 'pointer' : undefined, ...style }}>{children}</div>;
}