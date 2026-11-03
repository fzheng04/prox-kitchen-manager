One divider-separated row in a NotebookList: status dot (amber when it needs attention), item name + printed sub-line, optional qty, × remove. `input` renders the add-item row.
```jsx
<NotebookRow text="Milk" sub="Whole milk · 1 gal" meta={<QuantityStepper size="sm" value={1} />} onRemove={…} />
<NotebookRow input value={draft} onChange={setDraft} onSubmit={add} onAdd={add} />
```
