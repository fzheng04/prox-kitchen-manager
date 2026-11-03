import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function SearchField({ value, onChange, placeholder = 'Search groceries', onInfo, onSubmit, autoFocus, inputRef, style }) {
  return <form onSubmit={e => { e.preventDefault(); onSubmit && onSubmit(value); }}
    style={{ display: 'flex', alignItems: 'center', gap: 12, height: 50, padding: '0 16px', boxSizing: 'border-box',
      borderRadius: 'var(--radius-md)', border: 'var(--outline)', background: 'var(--surface-input)', boxShadow: 'none', ...style }}>
    <Icon name="search" size={20} color="var(--text-secondary)" />
    <input ref={inputRef} value={value} autoFocus={autoFocus} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder}
      style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-primary)' }} />
    {onInfo && <button type="button" onClick={onInfo} aria-label="Search help" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', display: 'grid' }}>
      <Icon name="info" size={18} color="var(--text-secondary)" /></button>}
  </form>;
}