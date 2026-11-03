import React from 'react';
import { Icon } from './Icon.jsx';
const V = {
  light: { bg: 'var(--surface-raised)', fg: 'var(--text-primary)', border: true },
  glass: { bg: 'rgba(255,255,255,.14)', fg: 'var(--text-on-dark)', border: false },
  primary: { bg: 'var(--accent)', fg: 'var(--text-on-accent)', border: true },
  plain: { bg: 'transparent', fg: 'inherit', border: false },
};
export function IconButton({ icon, label, variant = 'light', size = 48, shape = 'circle', badge, onClick, disabled, style }) {
  const [p, setP] = React.useState(false);
  const v = V[variant] || V.light;
  return <button type="button" aria-label={label} onClick={onClick} disabled={disabled}
    onPointerDown={() => setP(true)} onPointerUp={() => setP(false)} onPointerLeave={() => setP(false)}
    style={{ position: 'relative', flex: 'none', width: size, height: size, display: 'grid', placeItems: 'center', padding: 0,
      borderRadius: shape === 'circle' ? '50%' : 'var(--radius-sm)', background: v.bg, color: v.fg,
      border: v.border ? 'var(--outline)' : 'none', boxShadow: v.border ? (p ? '0 0 0 var(--ink)' : 'var(--shadow-hard-sm)') : 'none',
      transform: p && v.border ? 'translateY(2px)' : 'none', transition: 'transform var(--dur-fast), box-shadow var(--dur-fast)',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1, ...style }}>
    <Icon name={icon} size={Math.round(size * 0.46)} />
    {badge != null && <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 22, height: 22, padding: '0 6px', boxSizing: 'border-box',
      borderRadius: 999, background: 'var(--badge)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13,
      display: 'grid', placeItems: 'center' }}>{badge}</span>}
  </button>;
}