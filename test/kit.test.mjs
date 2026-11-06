// The kit's promises, checked: the JSON matches the CSS, text is readable in both themes, amber and red stay
// where the rules put them, every token a part uses exists, nothing ships a font it may not, and sync works.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, readdirSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parse } from '../scripts/tokens-json.mjs';
import { css, sync, BEGIN, END, JS_BEGIN, JS_END } from '../lib/sync.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const T = parse(read('tokens.css'));
const theme = (name) => ({ ...T.light, ...(name === 'dark' ? T.dark : {}) });

// WCAG 2 relative luminance and contrast
const lum = (hex) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('tokens.json is tokens.css (run npm run tokens)', () => {
  assert.deepEqual(JSON.parse(read('tokens.json')), T);
});

for (const name of ['light', 'dark']) {
  test(`${name}: text is readable on every surface`, () => {
    const t = theme(name);
    for (const bg of ['--color-background', '--color-card', '--color-muted']) {
      for (const fg of ['--color-strong', '--color-body', '--color-subtle']) assert.ok(ratio(t[fg], t[bg]) >= 4.5, `${fg} on ${bg}: ${ratio(t[fg], t[bg]).toFixed(2)}`);
      assert.ok(ratio(t['--color-returned-ink'], t[bg]) >= 4.5, `returned-ink on ${bg}`);
    }
    for (const bg of ['--color-background', '--color-card']) assert.ok(ratio(t['--color-faint'], t[bg]) >= 4.5, `faint on ${bg}: ${ratio(t['--color-faint'], t[bg]).toFixed(2)}`);
    assert.ok(ratio(t['--color-field'], t['--color-input']) >= 3, 'field edge against the field');
    assert.ok(ratio(t['--color-primary-foreground'], t['--color-primary']) >= 4.5, 'button label');
    assert.ok(ratio(t['--color-on-verified'], t['--color-verified']) >= 4.5, 'ink on amber');
    assert.ok(ratio(t['--color-on-returned'], t['--color-returned']) >= 4.5, 'white on red');
  });
}

test('amber is only for Verified, the dither, a tag and Copied', () => {
  const allowed = /^\.ex-badge--verified\b|^\.ex-tag\b|^\.ex-cmd button\.is-copied\b|^\.ex-btn\.is-copied\b|^\.ex-dither/;
  const rules = [...read('kit.css').replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  for (const [, sel, body] of rules) {
    if (!/--color-verified|FFBF00/i.test(body)) continue;
    for (const s of sel.split(',').map((x) => x.trim())) assert.match(s, allowed, `amber in ${s}`);
  }
  // nothing hard-codes the hex outside the token and the dither pattern
  for (const f of ['kit.css', 'compat.css']) {
    const hits = read(f).replace(/\/\*[\s\S]*?\*\//g, '').match(/[^\n]*FFBF00[^\n]*/gi) || [];
    for (const h of hits) assert.match(h, /ex-dither|%23FFBF00/, `${f}: ${h.trim().slice(0, 80)}`);
  }
});

test('red is only for Returned, failed and broken', () => {
  const allowed = /^\.ex-badge--(returned|danger)\b|^\.ex-btn--danger\b|^\.ex-alert--danger\b|^\.ex-error\b|^\.ex-(input|select|textarea)\[aria-invalid|^\.ex-menu__item--danger\b|^\.ex-toast--danger\b/;
  const rules = [...read('kit.css').replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  for (const [, sel, body] of rules) {
    if (!/--color-returned/.test(body)) continue;
    for (const s of sel.split(',').map((x) => x.trim())) assert.match(s, allowed, `red in ${s}`);
  }
});

test('every token a part reads exists', () => {
  const defined = new Set([...Object.keys(T.light), ...Object.keys(T.dark)]);
  for (const f of ['kit.css', 'compat.css']) {
    const src = read(f);
    for (const m of src.matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
  }
  for (const f of ['kit.css', 'compat.css']) {
    for (const m of read(f).matchAll(/var\((--[\w-]+)/g)) assert.ok(defined.has(m[1]), `${f} reads ${m[1]}, which nothing defines`);
  }
});

test('nothing ships a font it may not (Switzer and XCTRY are not redistributable)', () => {
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? (f === 'node_modules' || f === '.git' || f === 'test' ? [] : walk(p)) : [p]; });
  for (const p of walk(ROOT)) {
    assert.doesNotMatch(p, /switzer|xctry/i, p);
    if (/\.(css|js|mjs|html|json|md)$/.test(p)) assert.doesNotMatch(readFileSync(p, 'utf8'), /switzer|xctry/i, p);
  }
});

test('sync writes the kit between the markers, and only there', () => {
  const page = `<style>\nbody{}\n${BEGIN}\nold\n${END}\n.mine{}\n</style>`;
  const out = sync(page);
  assert.ok(out.includes('.ex-btn') && out.includes('--color-verified') && out.includes('--surface-1'));
  assert.ok(out.startsWith('<style>\nbody{}\n') && out.endsWith(`${END}\n.mine{}\n</style>`));
  assert.equal(sync(out), out, 'syncing twice changes nothing');
  assert.ok(!sync(page, { compat: false }).includes('--surface-1'));
  assert.ok(!sync(page, { tokensOnly: true }).includes('.ex-btn'));
  assert.throws(() => sync('<style></style>'), /markers/);
});

test('the command syncs, and --check catches a stale page', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ex-kit-'));
  const f = join(dir, 'index.html');
  writeFileSync(f, `<style>${BEGIN}${END}</style>`);
  const bin = join(ROOT, 'bin/excellent-kit.mjs');
  assert.equal(spawnSync(process.execPath, [bin, 'sync', f, '--check']).status, 1);
  execFileSync(process.execPath, [bin, 'sync', f]);
  assert.equal(spawnSync(process.execPath, [bin, 'sync', f, '--check']).status, 0);
  assert.ok(readFileSync(f, 'utf8').includes('.ex-badge--verified'));
  assert.equal(css().split('\n')[0].includes('MIT'), true);
});

test('sync writes kit.js between the script markers when a page has them, and fonts only when asked', () => {
  const page = `<style>${BEGIN}${END}</style><script>${JS_BEGIN}${JS_END}</script>`;
  const out = sync(page);
  assert.ok(out.includes('window.ExKit') && out.includes('data-ex-theme-toggle'));
  assert.equal(sync(out), out);
  assert.ok(!out.includes('data:font/woff2'));
  const withFonts = sync(page, { fonts: true });
  assert.ok(withFonts.includes('font-family: "Geist"; src: url("data:font/woff2;base64,'));
  assert.ok(sync(`<style>${BEGIN}${END}</style>`).length > 0, 'the script markers are optional');
});
