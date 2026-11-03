import React from 'react';
export function AppHeader({ title, subtitle, left, right, children, compact, style }) {
  return <header style={{ background: 'var(--surface-header)', color: 'var(--text-on-dark)', padding: compact ? '10px 16px 14px' : '14px 18px 20px', ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: compact ? 22 : 'var(--fs-display)', lineHeight: 1.05, letterSpacing: '-.01em' }}>{title}</div>
        {subtitle && <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-on-dark-muted)', marginTop: 4, textWrap: 'pretty' }}>{subtitle}</div>}
      </div>
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>}
    </div>
    {children && <div style={{ marginTop: 16 }}>{children}</div>}
  </header>;
}
