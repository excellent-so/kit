# Security policy

## What the kit does

The kit is CSS, fonts, a small browser script (`kit.js`) and a command (`excellent-kit`). It makes no network
requests. `kit.js` stores one value in the browser's `localStorage` (`ex-theme`, the reader's theme) and writes
to the clipboard only when someone clicks a copy button. `excellent-kit sync` reads and writes only the files
named on its command line, and only the text between the kit's markers. `npm run styleguide` (in a clone)
serves the repository on `127.0.0.1` only.

Examples of what counts as a security issue here:

- `kit.js` running script from, or sending data to, anywhere
- `excellent-kit sync` writing outside the files it was given, or outside the markers
- the styleguide server reading files outside the repository

## Supported versions

The latest version. Fixes ship in a new release.

## Reporting a vulnerability

Please don't open a public issue. Email `matt@excellent.so` with what you found, what an attacker could do with
it, steps to reproduce, and the kit version. There is no bounty program.
