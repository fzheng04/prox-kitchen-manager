import React from 'react';
import { Icon } from './Icon.jsx';
const V = {
  primary: { bg: 'var(--accent)', bgP: 'var(--accent-pressed)', fg: 'var(--text-on-accent)' },
  dark: { bg: 'var(--surface-deep)', bgP: 'var(--night-800)', fg: 'var(--text-on-dark)' },
  secondary: { bg: 'var(--surface-raised)', bgP: 'var(--oat-100)', fg: 'var(--text-primary)' },
  ghost: { bg: 'transparent', bgP: 'var(--oat-200)', fg: 'var(--text-primary)', flat: true },
};
const S = { sm: { h: 36, px: 16, fs: 13 }, md: { h: 48, px: 22, fs: 15 }, lg: { h: 56, px: 28, fs: 18 } };
export function Button({ children, variant = 'primary', size = 'md', icon, iconRight, uppercase = false, fullWidth, disabled, onClick, type = 'button', style }) {
  const [p, setP] = React.useState(false);
  const v = V[variant] || V.primary, s = S[size] || S.md;
  const shadow = v.flat ? 'none' : (p ? '0 0 0 var(--ink)' : 'var(--shadow-hard)');
  return <button type={type} disabled={disabled} onClick={onClick}
    onPointerDown={() => setP(true)} onPointerUp={() => setP(false)} onPointerLeave={() => setP(false)}
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: s.h, padding: '0 ' + s.px + 'px',
      width: fullWidth ? '100%' : undefined, borderRadius: 'var(--radius-md)', border: v.flat ? 'none' : 'var(--outline)',
      background: p ? v.bgP : v.bg, color: v.fg, boxShadow: shadow, transform: p && !v.flat ? 'translateY(3px)' : 'none',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: s.fs, letterSpacing: uppercase ? 'var(--tracking-label)' : 0,
      textTransform: uppercase ? 'uppercase' : 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1,
      transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)', whiteSpace: 'nowrap', ...style }}>
    {icon && <Icon name={icon} size={s.fs + 4} />}{children}{iconRight && <Icon name={iconRight} size={s.fs + 8} />}
  </button>;
}