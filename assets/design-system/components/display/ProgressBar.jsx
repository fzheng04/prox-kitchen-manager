import React from 'react';
export function ProgressBar({ value = 0, tone = 'green', height = 10, style }) {
  const c = tone === 'amber' ? 'var(--badge)' : tone === 'red' ? 'var(--danger)' : 'var(--accent)';
  return <div role="progressbar" aria-valuenow={Math.round(value * 100)} style={{ height, borderRadius: 999, background: 'var(--stone-300)', overflow: 'hidden', ...style }}>
    <div style={{ width: Math.max(0, Math.min(1, value)) * 100 + '%', height: '100%', borderRadius: 999, background: c, transition: 'width var(--dur-base) var(--ease-out)' }} /></div>;
}