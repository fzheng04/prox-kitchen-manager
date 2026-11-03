import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function EmptyState({ icon = 'package', title, body, action, style }) {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '32px 20px', ...style }}>
    <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--sage-300)', border: '2px solid var(--ink)', display: 'grid', placeItems: 'center', marginBottom: 6 }}>
      <Icon name={icon} size={40} color="var(--ink)" /></div>
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>{title}</div>
    {body && <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 15, lineHeight: 1.4, color: 'var(--text-muted)', maxWidth: 300, textWrap: 'pretty' }}>{body}</div>}
    {action && <div style={{ marginTop: 10 }}>{action}</div>}
  </div>;
}