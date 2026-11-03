import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function QuantityStepper({ value, onChange, min = 0, max = 99, step = 1, unit, units, onUnitChange, size = 'md' }) {
  const h = size === 'sm' ? 32 : 40;
  const btn = (icon, d, dis) => <button type="button" disabled={dis} aria-label={d > 0 ? 'Increase' : 'Decrease'}
    onClick={() => onChange && onChange(Math.min(max, Math.max(min, +(value + d).toFixed(2))))}
    style={{ width: h, height: h, border: 0, background: 'transparent', display: 'grid', placeItems: 'center', cursor: dis ? 'not-allowed' : 'pointer', opacity: dis ? .35 : 1, color: 'var(--text-primary)' }}>
    <Icon name={icon} size={16} /></button>;
  return <div style={{ display: 'inline-flex', alignItems: 'center', height: h, borderRadius: 999, border: 'var(--outline)', background: 'var(--surface-raised)', boxShadow: 'var(--shadow-hard-sm)' }}>
    {btn('minus', -step, value <= min)}
    <span style={{ minWidth: 26, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{value}</span>
    {units && units.length ? <select value={unit} onChange={e => onUnitChange && onUnitChange(e.target.value)}
      style={{ border: 0, background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', maxWidth: 70 }}>
      {units.map(u => <option key={u} value={u}>{u}</option>)}</select>
      : unit && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', paddingRight: 2 }}>{unit}</span>}
    {btn('plus', step, value >= max)}
  </div>;
}