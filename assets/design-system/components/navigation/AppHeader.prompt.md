Night top header used on every tab — left-aligned title/subtitle, optional back button, actions right, optional search below.
```jsx
<AppHeader title="My Kitchen" subtitle="Week 1 · Mon" right={<IconButton icon="bell" label="Alerts" variant="glass" />}>
  <SearchField value="" />
</AppHeader>
```
- No logo slot by design; pass `left` for a back button on pushed screens.
