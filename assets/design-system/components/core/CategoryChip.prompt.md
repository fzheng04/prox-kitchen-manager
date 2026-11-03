Color-coded food category filter chip (tint background + rounded-square swatch); "all" renders neutral/forest.
```jsx
<div style={{display:'flex',gap:10,overflowX:'auto'}}>
  <CategoryChip category="all" selected /><CategoryChip category="produce" /><CategoryChip category="dairy" />
</div>
```
- Lay out in a horizontally scrolling row; the row bleeds off the right edge.