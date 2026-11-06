// The kit's CSS as one block, and the marker swap that puts it inside a page (bin/excellent-kit.mjs).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(HERE, 'package.json'), 'utf8'));
export const BEGIN = '/* excellent-kit:begin */';
export const END = '/* excellent-kit:end */';
export const JS_BEGIN = '/* excellent-kit:js:begin */';
export const JS_END = '/* excellent-kit:js:end */';

// The fonts as data, for a page that can't serve files (about 190 KB: opt in with --fonts).
function fontFaces() {
  const face = (family, file) => `@font-face { font-family: "${family}"; src: url("data:font/woff2;base64,${readFileSync(join(HERE, 'fonts', file)).toString('base64')}") format("woff2"); font-weight: 100 900; font-style: normal; font-display: swap; }`;
  return `/* Geist and Geist Mono, SIL Open Font License 1.1 (fonts/OFL.txt in @excellent-so/kit). */\n${face('Geist', 'Geist-Variable.woff2')}\n${face('Geist Mono', 'GeistMono-Variable.woff2')}`;
}

export function css({ compat = true, tokensOnly = false, fonts = false } = {}) {
  const part = (f) => readFileSync(join(HERE, f), 'utf8').trim();
  return [
    `/* @excellent-so/kit ${pkg.version}, MIT. Written by \`excellent-kit sync\`: edit the kit, not this block. */`,
    fonts ? fontFaces() : '',
    part('tokens.css'),
    compat ? part('compat.css') : '',
    tokensOnly ? '' : part('kit.css'),
  ].filter(Boolean).join('\n\n');
}

export function js() {
  return `/* @excellent-so/kit ${pkg.version}, MIT: kit.js, written by \`excellent-kit sync\`. */\n` + readFileSync(join(HERE, 'kit.js'), 'utf8').trim();
}

const swap = (html, begin, end, body) => {
  const a = html.indexOf(begin), b = html.indexOf(end);
  if (a < 0 || b < a) return null;
  return html.slice(0, a + begin.length) + '\n' + body + '\n' + html.slice(b);
};

// The CSS goes between the style markers (required); kit.js goes between the script markers if the page has them.
export function sync(html, opts) {
  const out = swap(html, BEGIN, END, css(opts));
  if (out === null) throw new Error(`no ${BEGIN} ... ${END} markers`);
  return swap(out, JS_BEGIN, JS_END, js()) ?? out;
}
