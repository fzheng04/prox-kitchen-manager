import React from 'react';
import { Icon } from '../core/Icon.jsx';
const R = {
  low: ['package-minus', 'Low quantity'], depletion: ['hourglass', 'Running out'], recurrence: ['repeat', 'You buy this often'],
  preference: ['heart', 'Saved preference'], category: ['tag', 'Category'], availability: ['store', 'In stock'], history: ['history', 'From history'],
};
export function ReasonTag({ kind = 'low', children, style }) {
  const [icon, def] = R[kind] || R.low;
  return <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 6, padding: '4px 10px 4px 8px', borderRadius: 'var(--radius-sm)',
    background: 'var(--oat-100)', border: '1.5px solid var(--stone-300)', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12.5,
    color: 'var(--text-primary)', lineHeight: 1.25, ...style }}>
    <Icon name={icon} size={14} color="var(--money-600)" style={{ marginTop: 1 }} /><span style={{ minWidth: 0 }}>{children || def}</span></span>;
}