<img src="docs/mark.svg" width="40" height="40" alt="">

# @excellent-so/kit

The parts Excellent is built from, for anything you build: design tokens as CSS variables, and plain
components on top of them. Light and dark, comfortable and compact. No framework, no build step and no
dependencies, so a single-file viewer a CLI serves looks the same as a React app.

It's the look of Excellent's admin and app (excellent.so), and the kit behind screen-map, selfdocs,
pressroom and the rest. The styleguide shows every part, live. It ships in the package: open
`node_modules/@excellent-so/kit/styleguide/index.html` in a browser. In a clone of this repository,
`npm run styleguide` serves it at http://localhost:4790/styleguide/ (set `PORT` to use another port).

```sh
npm i @excellent-so/kit
```

The `excellent-kit` command needs Node 20 or later. The CSS and `kit.js` need only a browser.

## Use it

**In a page:** link the files, put `ex-page` on `<body>`, use the classes.

```html
<link rel="stylesheet" href="node_modules/@excellent-so/kit/fonts.css">
<link rel="stylesheet" href="node_modules/@excellent-so/kit/tokens.css">
<link rel="stylesheet" href="node_modules/@excellent-so/kit/kit.css">
<script src="node_modules/@excellent-so/kit/kit.js" defer></script>

<button class="ex-btn">Run the check</button>
<span class="ex-badge ex-badge--verified">Verified</span>
```

**In a single-file viewer** (a page a CLI serves, which can't link other files): mark a spot inside its
`<style>`, and the command writes the kit there. `--check` exits 1 when the block is out of date, for CI.

```html
<style>
/* excellent-kit:begin */
/* excellent-kit:end */
</style>
```

```sh
npx @excellent-so/kit sync viewer/index.html
npx @excellent-so/kit sync viewer/index.html --check
```

With the kit installed in the project, `npx excellent-kit sync viewer/index.html` does the same. `sync` takes
one or more files and changes only the text between the markers.

Put a second pair of markers inside a `<script>` (`/* excellent-kit:js:begin */` and `/* excellent-kit:js:end */`)
and `sync` writes `kit.js` there too. `--fonts` embeds Geist and Geist Mono as data (about 190 KB), for a viewer
that wants the kit's faces and can't serve files.

`--no-compat` leaves out `compat.css`, which maps the token names the tools used before the kit (`--surface-1`,
`--text-strong`, `--primary`, `--ink`, `--mut`…) onto the kit, so an old viewer takes the new look without
renaming a class. `--tokens-only` writes the tokens without the components.

**With Tailwind, a chart or a native app:** `tokens.json` has every value, light, dark and compact.

```js
import tokens from '@excellent-so/kit/tokens.json' with { type: 'json' };
tokens.light['--color-strong'];  // "#0E0E0E"
tokens.dark['--color-strong'];   // "#F0F0F2"
```

Node needs the `with { type: 'json' }` attribute (Node 20.10 or later; a bundler doesn't). On any Node,
`createRequire(import.meta.url)('@excellent-so/kit/tokens.json')` works too.

**From a build script:** `import { css, sync } from '@excellent-so/kit/sync'` gives you the same CSS block
and marker swap the command uses (`sync(html, { compat, tokensOnly, fonts })` returns the new HTML).

## Commands

```sh
excellent-kit sync <file.html...>   # write the kit between the markers in each file
excellent-kit sync <file.html...> --check   # change nothing; exit 1 if any file is out of date
excellent-kit css                   # print the CSS block that sync writes
excellent-kit --version             # print the version
excellent-kit --help                # the commands and options
```

`sync` and `css` take `--no-compat`, `--tokens-only` and `--fonts`. Exit codes: 0 done, 1 `--check` found a
page out of date, 2 a mistyped command or option, a missing file or a page without the markers, with one line
saying what to do.

## What you can import

`package.json` `exports` lists every path: `tokens.css`, `compat.css`, `kit.css`, `fonts.css`, `kit.js`,
`tokens.json`, `fonts/*`, `styleguide/*`, `sync` and `package.json`, each under `@excellent-so/kit/` (for
example `@excellent-so/kit/kit.css` in a bundler that follows `exports`). There is no bare
`@excellent-so/kit` entry. In plain HTML, link the files under `node_modules/@excellent-so/kit/` as above.

## Theme and density

Light by default, whatever the OS says. Dark is a choice: `class="theme-dark"` on `<html>` (or on any subtree;
`.dark` and `data-theme="dark"` work too). A `[data-ex-theme-toggle]` button flips it and remembers the choice
(in `localStorage`, under `ex-theme`); this line in `<head>` restores it before the first paint:

```html
<script>try{if(localStorage.getItem('ex-theme')==='dark')document.documentElement.classList.add('theme-dark')}catch(e){}</script>
```

`data-density="compact"` on any element draws 36px controls instead of 44px, on a mouse or trackpad only.

## The rules

1. Ink on white. Light by default; dark is the reader's choice.
2. Two colours mean something: amber is for Verified, red for Returned or failed. Every other state is an outline.
3. A state never rests on colour alone: verdict and status badges carry a glyph.
4. Controls have 4px corners and are 44px tall (36px compact, on a mouse).
5. Surfaces are flat: a 1px hairline and 8px corners. Shadows are for things that float.
6. Tables, not paragraphs, for data. Numbers right-aligned in tabular figures.
7. One focus ring, and no text under 12px.

The tests hold the kit to these: text contrast in both themes, amber and red only where the rules allow, every
token a part reads exists, and `tokens.json` matches `tokens.css` (`npm run tokens` rewrites it).

## A tool's mark

Each tool on the kit has its own mark, never Excellent's: drawn on a 16-unit grid in the current colour, filled
shapes and 2-unit lines, ink only. It sits left of the name in the brand row at 16px, `<svg class="ex-mark"
viewBox="0 0 16 16" fill="currentColor">`, and the same drawing is the tool's favicon and the head of its
README. The styleguide shows the marks in use.

## What's in it

| File | What it is |
|---|---|
| `tokens.css` | Every value: colour (light and dark), type, space, corners, control heights, shadows, glyphs |
| `kit.css` | The parts, as `ex-` classes: buttons and toggles, badges, links, fields, search, chips, a segmented switch, selectable lists, cards, alerts, empty states, page and section heads, tabs, metrics, detail lists, tables, menus, dialogs, side sheets, toasts, rendered markdown, code, the command pill, the dither, the app shell |
| `compat.css` | The tools' older token names, mapped onto the kit |
| `fonts.css`, `fonts/` | Geist and Geist Mono, variable (SIL Open Font License) |
| `kit.js` | Theme toggle (`data-ex-theme-toggle`), copy buttons (`data-ex-copy`), the shell's phone menu (`data-ex-nav-toggle`; a tap on the scrim, Escape or a link closes it), sortable tables (`data-ex-sort`). No dependencies |
| `tokens.json` | The tokens as data |
| `bin/excellent-kit.mjs` | `sync` and `css` |
| `styleguide/` | The living styleguide |

Excellent's own site uses faces that aren't licensed for redistribution, so the kit ships Geist; anything that
has Newsreader gets it for headlines, and everything falls back to the system faces.

## Network, files and uninstall

The kit makes no network requests: the fonts ship in the package, and nothing loads from a CDN. `kit.js` keeps
one value in the browser's `localStorage` (`ex-theme`). `excellent-kit sync` writes only the files you name, and
only between the markers; `excellent-kit css` writes nothing.

To remove it, `npm rm @excellent-so/kit`. A page you synced keeps its copy of the kit between the markers;
delete that block (and the markers) if you no longer want it.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). To report a security issue, see [SECURITY.md](SECURITY.md). Changes
are listed in [CHANGELOG.md](CHANGELOG.md).

## License

MIT. The fonts are under the SIL Open Font License 1.1. The Excellent name and logo are trademarks and aren't
part of the kit.
