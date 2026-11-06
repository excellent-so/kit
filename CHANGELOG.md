# Changelog

Notable changes to `@excellent-so/kit`. Versions follow [Semantic Versioning](https://semver.org/). Nothing
has been published to npm yet.

## 0.2.1 (unreleased)

### Added

- `.ex-mark`: the 16px slot for a tool's own mark in the brand row. The styleguide has a Marks section with
  the rules and six marks, and `docs/mark.svg` heads the README.
- `excellent-kit --version` and `-h`, and a fuller `--help` with the exit codes.
- `exports` for `fonts/*`, `styleguide/*` and `package.json`, so every path the README names resolves.
- README: the commands, the `tokens.json` import with its `with { type: 'json' }` attribute, the
  `@excellent-so/kit/sync` API, what the kit writes and sends (nothing over the network), uninstall.
- `CHANGELOG.md`, `CONTRIBUTING.md` and `SECURITY.md`; the changelog and security policy ship in the package.
- CI: `.github/workflows/test.yml` runs the tests on Node 20 and 22.

### Fixed

- kit.js: on a phone, the open sidebar covered the menu button and nothing else closed it. A tap on the
  scrim, Escape (focus goes back to the button) or a link in the sidebar now closes it.
- `excellent-kit sync` with a mistyped option (`--chek`) ignored it and rewrote the file. Unknown options and
  commands now exit 2 with one line and change nothing.
- `excellent-kit sync` with a missing file, a folder or a read-only file printed a Node stack trace. Each now
  exits 2 with one sentence. `excellent-kit sync` with no file said "unknown command: sync"; it now says it
  needs a page.
- `excellent-kit sync --check` suggests the command to run with the same options (`--no-compat` and so on).
- `npm run styleguide` crashed with a stack trace when the port was in use. It now says so and how to pick
  another port (`PORT=4791 npm run styleguide`).
- In a clone whose path has a space in it, `npm run styleguide` served 404 for every file, `npm run tokens`
  silently wrote nothing and `npm test` failed. All three use real file paths now.
- The styleguide's "Using it" snippets linked `@excellent-so/kit/...` (not a path a browser can load) and
  imported `tokens.json` without the import attribute Node requires. They now match the README.
- Comments that sync into a tool's page no longer name Excellent or cite internal design docs.

## 0.2.0 (2026-11-05)

- Choosing: a segmented switch, a selectable list, chips, a search field, a match highlight and an avatar.
- Floating: a menu, a dialog, a side sheet and a toast. Rendered markdown, pressed and copied buttons, card
  media, an alert close button and a scrim behind the phone menu.
- The `hidden` attribute always hides a part, the caps labels meet the 12px floor, and top-bar controls fit
  the bar.
- `sync` also writes `kit.js` between `/* excellent-kit:js:begin */` and `/* excellent-kit:js:end */`, and
  `--fonts` embeds Geist and Geist Mono as data.
- One licence file, `fonts/OFL.txt`, names both Geist and Geist Mono.

## 0.1.0 (2026-11-05)

First version: `tokens.css`, `kit.css`, `compat.css` for the tools' older token names, `kit.js`,
`tokens.json`, the `excellent-kit sync` command for single-file viewers, and the living styleguide. MIT;
Geist and Geist Mono under the SIL Open Font License 1.1.
