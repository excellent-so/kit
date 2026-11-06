# Contributing

A small kit, so the rules are short.

## Run it

You need Node 20 or later. There is nothing to install.

```sh
npm test              # the kit's promises: contrast, where amber and red go, tokens, fonts, sync, the command
npm run styleguide    # http://localhost:4790/styleguide/ (PORT=4791 npm run styleguide for another port)
npm run tokens        # rewrite tokens.json from tokens.css after you change a token
```

The tests run offline and write only to temp folders.

## The rules a change keeps

- No dependencies and no build step. Plain CSS, and `kit.js` in plain browser JavaScript.
- Every part follows the seven rules in the README. The tests check contrast in both themes, that amber and red
  appear only where the rules allow, that every token a part reads exists, and that `tokens.json` matches
  `tokens.css`.
- A new part goes in the styleguide, in light, dark, compact and at phone width, with no console errors.
- Fonts: only faces whose licence allows redistribution ship in `fonts/`, with that licence beside them.
  Excellent's own site faces aren't licensed for that and must never ship; a test checks.
- The Excellent name and logo aren't part of the kit. A tool on the kit uses its own mark.

## Reporting a bug

Open an issue: https://github.com/excellent-so/kit/issues. Include your browser (or `node --version` for the
command), the kit version (`npx excellent-kit --version`), what you did, and what you saw. A screenshot helps.

For a security issue, follow [SECURITY.md](SECURITY.md) and don't open a public issue.
