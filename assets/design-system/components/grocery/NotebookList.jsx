import React from 'react';
export function NotebookList({ children, title, count, style }) {
  return <div style={{ background: 'var(--surface-raised)', border: 'var(--outline)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-hard-lg)', overflow: 'hidden', ...style }}>
    {title && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 16px 6px' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>{title}</span>
      {count != null && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{count}</span>}</div>}
    <div>{children}</div>
  </div>;
}
