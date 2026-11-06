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
//
// Exit codes: 0 done, 1 `--check` found a page out of date, 2 a usage or file error (one line on stderr).
import { readFileSync, writeFileSync } from 'node:fs';
import { css, sync } from '../lib/sync.mjs';

const HELP = `excellent-kit: put the kit inside a page that can't link files.

Usage:
  excellent-kit sync <file.html...> [--check] [--no-compat] [--tokens-only] [--fonts]
  excellent-kit css [--no-compat] [--tokens-only] [--fonts]
  excellent-kit --version | --help

sync writes the kit's CSS between /* excellent-kit:begin */ and /* excellent-kit:end */
inside a <style> element, and kit.js between /* excellent-kit:js:begin */ and
/* excellent-kit:js:end */ inside a <script> element when the page has them.
css prints the CSS that sync writes.

  --check        change nothing; exit 1 if a page is out of date (for CI)
  --no-compat    leave out compat.css (the token names the tools used before the kit)
  --tokens-only  the tokens without the components
  --fonts        embed Geist and Geist Mono as data (about 190 KB)

Exit codes: 0 done, 1 --check found a page out of date, 2 a usage or file error.
`;

const OPTIONS = new Set(['--check', '--no-compat', '--tokens-only', '--fonts']);
const fail = (msg) => { console.error(`excellent-kit: ${msg}`); process.exit(2); };

const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help') || args[0] === 'help') { process.stdout.write(HELP); process.exit(0); }
if (args.includes('-v') || args.includes('--version') || args[0] === 'version') {
  console.log(JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version);
  process.exit(0);
}

const [cmd, ...rest] = args;
const flags = rest.filter((a) => a.startsWith('-'));
const files = rest.filter((a) => !a.startsWith('-'));
if (!cmd) { process.stdout.write(HELP); process.exit(0); }
if (cmd !== 'sync' && cmd !== 'css') fail(`unknown command "${cmd}". Run excellent-kit --help to see the commands.`);
for (const f of flags) if (!OPTIONS.has(f)) fail(`unknown option "${f}". Run excellent-kit --help to see the options.`);
const flag = (f) => flags.includes(f);
const opts = { compat: !flag('--no-compat'), tokensOnly: flag('--tokens-only'), fonts: flag('--fonts') };

if (cmd === 'css') {
  if (files.length) fail(`css takes no files (got "${files[0]}"). To write the kit into a page, run excellent-kit sync ${files[0]}.`);
  if (flag('--check')) fail('--check only works with sync.');
  process.stdout.write(css(opts) + '\n');
  process.exit(0);
}

if (!files.length) fail('sync needs a page to write to, for example: excellent-kit sync viewer/index.html');

// One sentence for the file errors a person can fix.
const why = (e, f) =>
  e.code === 'ENOENT' ? `${f}: no such file. Check the path.`
  : e.code === 'EISDIR' ? `${f} is a folder. Name the HTML file inside it.`
  : e.code === 'EACCES' || e.code === 'EPERM' ? `${f}: permission denied. Make the file writable, then run it again.`
  : `${f}: ${e.message}`;

let stale = 0;
for (const f of files) {
  let before;
  try { before = readFileSync(f, 'utf8'); } catch (e) { fail(why(e, f)); }
  let after;
  try { after = sync(before, opts); } catch (e) { fail(`${f}: ${e.message}. Add them inside a <style> element.`); }
  if (after === before) { console.log(`up to date  ${f}`); continue; }
  if (flag('--check')) {
    const again = ['sync', f, ...flags.filter((x) => x !== '--check')].join(' ');
    console.error(`out of date  ${f} (run: excellent-kit ${again})`);
    stale++;
    continue;
  }
  try { writeFileSync(f, after); } catch (e) { fail(why(e, f)); }
  console.log(`synced  ${f}`);
}
process.exit(stale ? 1 : 0);
