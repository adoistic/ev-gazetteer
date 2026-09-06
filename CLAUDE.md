# ev-gazetteer

The Emergent Ventures Gazetteer, at evwinners.thothica.com. A static Next.js
export plus one Cloudflare Worker. All 1,266 grants, classified.

- This extends `nqureshi/ev-winners`; it does not replace it. Credit stays
  prominent and corrections go upstream.
- `data/ev-winners.csv` is a snapshot and is the source of truth for grant
  facts. `data/classification/*.psv` is the source of truth for tags, one line
  per grant, checked against `data/vocabulary.json` at build time. A tag outside
  the vocabulary fails the build; widen the vocabulary deliberately rather than
  loosening the check.
- `data/identity.json` holds hand-adjudicated person resolution. `merge` means
  the same person's separate grants. `joint` means one grant to several people
  and must NOT fuse them, which is why joint grants are attached after the
  union-find rather than inside it. Getting that wrong silently merges two
  different people.
- Never edit generated files by hand: `app/data/gazetteer.json`,
  `public/embeddings.bin`, `public/embeddings.json`.
- Regenerate with `npm run data`. It needs a working `wrangler login` and embeds
  through Workers AI by running `scripts/embed-worker.js` under
  `wrangler dev --remote`. That worker is build tooling and is never deployed.
  Vectors are cached by text hash, so unchanged rows cost nothing.
- The embedding model is named in two places and must agree: `MODEL` in
  `scripts/embed.mjs` and in `worker/index.ts`, both `@cf/baai/bge-base-en-v1.5`.
  The query side adds `QUERY_PREFIX`; stored passages never carry it.
- Tags are deliberately part of the embedded text. Removing them breaks short
  queries like "AI", which is the failure this project exists to fix.
- Tranche detection reads the description, not the batch column. Four tranches
  are announced only in prose; see `scripts/lib/tranches.mjs`.
- Design is the `thothica-black` skill: `#000` and `#FFF` only, Cormorant
  Garamond and Teachers self hosted, no grey, no alpha, no opacity below 1, no
  gradient except the hatch, transform only motion, sentence case headings, no
  em or en dashes in our copy.
- Three themes: system by default, plus explicit light and dark held in
  `localStorage` under `theme` and applied as `data-theme` on `<html>`. The
  inline script in `app/layout.tsx` sets that attribute before first paint;
  without it a reader who chose dark on a light machine gets a white flash,
  because this is a static export.
- Light mode is the strict two ink palette. Dark mode is NOT, on purpose: pure
  white on pure black is 21:1, which haloes and tires the eye. Dark uses
  ground `#141414`, band `#1E1E1E`, ink `#E6E6E6` (14.8:1), soft ink `#A0A0A0`
  (7.0:1) and lines `#666` (3.2:1). Those exact values are listed in
  `DARK_PALETTE` in the brand lint and nothing else is allowed; a stray grey
  still fails the build.
- A section carries `.inverse` to become a band. In light mode a band inverts
  to white on black. In dark mode it lifts to `#1E1E1E` instead of going white,
  because the masthead is sticky and a white band would pin the brightest thing
  on screen at all times.
- Theme switching is instant. A transition between these grounds would pass
  through grey, which the palette forbids.
- `npm run lint:brand` must pass before deploying. It carries one named waiver
  for unreachable Next.js error chrome; do not widen it. The hex rule only
  inspects style contexts, because grantee descriptions quote things like
  "#6394".
- Tailwind was removed on purpose; its preflight ships grey defaults.
- Branding is a byline, not a pitch. Do not add Thothica promotion.
