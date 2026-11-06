// Writes tokens.json from tokens.css: every custom property, per theme, for tools that want the values as data
// (a Tailwind config, a native app, a chart). `npm run tokens`; the tests fail if the two drift.
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

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

// Run as a script (not imported by the tests). Compare real paths: a folder name with a space, or a symlink
// such as macOS's /var -> /private/var, must not make it silently do nothing.
const isMain = () => { try { return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url); } catch { return false; } };
if (process.argv[1] && isMain()) {
  const json = JSON.stringify(parse(readFileSync(new URL('../tokens.css', import.meta.url), 'utf8')), null, 2) + '\n';
  writeFileSync(new URL('../tokens.json', import.meta.url), json);
  console.log('wrote tokens.json');
}
