#!/usr/bin/env node
// excellent-kit: put the kit inside a page that can't link files (a single-file viewer a CLI serves).
//
//   excellent-kit sync viewer/index.html          rewrite the block between the markers
//   excellent-kit sync viewer/index.html --check  exit 1 if the block is out of date (for CI)
//   excellent-kit css                             print the CSS that sync writes
//
// Options: --no-compat (leave out the old token names), --tokens-only (tokens without the components),
// --fonts (embed Geist and Geist Mono as data, about 190 KB). The page marks where the kit goes, inside a
// <style> element, and (optional) where kit.js goes, inside a <script> element:
//
//   /* excellent-kit:begin */            /* excellent-kit:js:begin */
//   /* excellent-kit:end */              /* excellent-kit:js:end */
import { readFileSync, writeFileSync } from 'node:fs';
import { css, sync } from '../lib/sync.mjs';

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const files = args.slice(1).filter((a) => !a.startsWith('--'));
const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

const cmd = args[0];
const opts = { compat: !flag('--no-compat'), tokensOnly: flag('--tokens-only'), fonts: flag('--fonts') };
if (cmd === 'css') process.stdout.write(css(opts) + '\n');
else if (cmd === 'version') console.log(version);
else if (cmd === 'sync' && files.length) {
  let stale = 0;
  for (const f of files) {
    const before = readFileSync(f, 'utf8');
    let after;
    try { after = sync(before, opts); } catch (e) { console.error(`${f}: ${e.message}. Add them inside a <style> element.`); process.exit(2); }
    if (after === before) { console.log(`up to date  ${f}`); continue; }
    if (flag('--check')) { console.error(`out of date  ${f} (run: excellent-kit sync ${f})`); stale++; continue; }
    writeFileSync(f, after);
    console.log(`synced  ${f}`);
  }
  process.exit(stale ? 1 : 0);
} else if (cmd && cmd !== 'help' && cmd !== '--help') {
  console.error(`unknown command: ${cmd}`); process.exit(2);
} else {
  console.log('usage: excellent-kit sync <file.html...> [--check] [--no-compat] [--tokens-only] [--fonts]\n       excellent-kit css [--no-compat] [--tokens-only] [--fonts]');
}
