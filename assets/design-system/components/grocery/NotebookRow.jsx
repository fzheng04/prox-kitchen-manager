import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function NotebookRow({ text, sub, meta, input, value, onChange, onSubmit, placeholder = 'Add an item…', onAdd, onRemove, onClick, addDisabled, warning, inputRef }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 60, padding: '8px 12px 8px 14px', borderTop: '1.5px solid var(--border-subtle)' }}>
    {input ? <button type="button" onClick={onAdd} disabled={addDisabled} aria-label="Add"
        style={{ flex: 'none', width: 30, height: 30, borderRadius: 9, background: addDisabled ? 'var(--oat-100)' : 'var(--accent)', color: addDisabled ? 'var(--text-muted)' : '#fff', border: '2px solid ' + (addDisabled ? 'var(--stone-300)' : 'var(--ink)'), display: 'grid', placeItems: 'center', cursor: addDisabled ? 'default' : 'pointer' }}>
        <Icon name="plus" size={16} /></button>
      : <span aria-hidden style={{ flex: 'none', width: 10, height: 10, borderRadius: 3, background: warning ? 'var(--badge)' : 'var(--stone-300)', margin: '0 10px' }} />}
    {input ? <form style={{ flex: 1, minWidth: 0 }} onSubmit={e => { e.preventDefault(); onSubmit && onSubmit(value); }}>
        <input ref={inputRef} value={value} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-primary)' }} /></form>
      : <div onClick={onClick} style={{ flex: 1, minWidth: 0, cursor: onClick ? 'pointer' : undefined }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, lineHeight: 1.15, color: 'var(--text-primary)' }}>{text}</div>
          {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: warning ? 'var(--danger)' : 'var(--text-secondary)', marginTop: 3, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>{sub}</div>}
        </div>}
    {meta}
    {onRemove && <button type="button" onClick={onRemove} aria-label="Remove" style={{ border: 0, background: 'none', padding: 4, cursor: 'pointer', display: 'grid', color: 'var(--text-muted)' }}><Icon name="x" size={18} /></button>}
  </div>;
}
