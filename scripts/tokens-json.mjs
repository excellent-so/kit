// Writes tokens.json from tokens.css: every custom property, per theme, for tools that want the values as data
// (a Tailwind config, a native app, a chart). `npm run tokens`; the tests fail if the two drift.
import { readFileSync, writeFileSync } from 'node:fs';

export function parse(src) {
  const out = {};
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = m[1].trim();
    const key = /dark/.test(sel) ? 'dark' : /density/.test(sel) ? 'compact' : /:root/.test(sel) ? 'light' : null;
    if (!key) continue;
    for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) (out[key] ||= {})[d[1]] = d[2].trim().replace(/\s+/g, ' ');
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const json = JSON.stringify(parse(readFileSync(new URL('../tokens.css', import.meta.url), 'utf8')), null, 2) + '\n';
  writeFileSync(new URL('../tokens.json', import.meta.url), json);
  console.log('wrote tokens.json');
}
