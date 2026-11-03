import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Badge } from '../core/Badge.jsx';
import { ProgressBar } from './ProgressBar.jsx';
export function SavingsCard({ label = 'Potential savings', amount = '$0.00', caption = 'vs. the priciest full cart', badge, progress = 0, onInfo, style }) {
  return <div style={{ background: 'var(--surface-raised)', border: 'var(--outline)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-hard-lg)', padding: '16px 18px 18px', ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
      {onInfo && <button type="button" onClick={onInfo} aria-label="About savings" style={{ border: 0, background: 'none', padding: 0, display: 'grid', cursor: 'pointer' }}><Icon name="info" size={16} color="var(--text-muted)" /></button>}
      <span style={{ flex: 1 }} />{badge && <Badge>{badge}</Badge>}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '4px 0 12px', flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-price-xl)', color: 'var(--price)', lineHeight: 1 }}>{amount}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>{caption}</span>
    </div>
    <ProgressBar value={progress} />
  </div>;
}