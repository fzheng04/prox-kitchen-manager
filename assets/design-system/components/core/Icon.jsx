import React from 'react';
const BASE = 'https://unpkg.com/lucide-static@0.460.0/icons/';
const cache = (typeof window !== 'undefined' && (window.__proxIconCache = window.__proxIconCache || {})) || {};
function load(name) {
  if (!cache[name]) cache[name] = fetch(BASE + name + '.svg').then(r => r.ok ? r.text() : '').then(t =>
    t.replace(/<!--[\s\S]*?-->/g, '').replace(/\swidth="\d+"/, ' width="100%"').replace(/\sheight="\d+"/, ' height="100%"').replace(/\sclass="[^"]*"/, '')).catch(() => '');
  return cache[name];
}
export function Icon({ name, size = 20, color = 'currentColor', strokeWidth, style, title }) {
  const [svg, setSvg] = React.useState(() => typeof cache[name] === 'string' ? cache[name] : '');
  React.useEffect(() => {
    let live = true;
    Promise.resolve(load(name)).then(t => { if (live) setSvg(t); });
    return () => { live = false; };
  }, [name]);
  const html = strokeWidth ? svg.replace(/stroke-width="[^"]*"/, 'stroke-width="' + strokeWidth + '"') : svg;
  return <span role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}
    dangerouslySetInnerHTML={{ __html: html }}
    style={{ display: 'inline-flex', flex: 'none', width: size, height: size, color, lineHeight: 0, ...style }} />;
}
