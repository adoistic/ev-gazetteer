# ev-winners-regional-and-thematic

Static Next.js export plus one Cloudflare Worker, at evwinners.thothica.com.
Holds the 469 Emergent Ventures grantees from the regional and thematic
tranches. The numbered cohorts are deliberately absent and link to
evwinners.org.

- `data/ev-winners.csv` is the source of truth, a snapshot from
  `nqureshi/ev-winners`. Never edit the generated files by hand:
  `app/data/winners.json`, `public/embeddings.bin`, `public/embeddings.json`.
- Regenerate with `npm run data`. It needs a working `wrangler login`, because
  it embeds through Workers AI by running `scripts/embed-worker.js` under
  `wrangler dev --remote`. That worker is build tooling and must never be
  deployed.
- The embedding model is named in two places and must agree:
  `MODEL` in `scripts/embed.mjs` and `MODEL` in `worker/index.ts`. Both are
  `@cf/baai/bge-base-en-v1.5`. The query side adds `QUERY_PREFIX`; stored
  passages never carry it.
- Vectors are written unit length, so the Worker's cosine is a dot product.
  Keep it that way or the scores stop being comparable.
- Scope is mechanical, in `scripts/lib/tranches.mjs`: a batch of only digits is
  the main series and is dropped. Do not hardcode tranche names.
- Design is the `thothica-black` skill: `#000` and `#FFF` only, Cormorant
  Garamond and Teachers self hosted from `public/fonts`, no grey, no alpha, no
  opacity below 1, no gradient except the hatch, transform only motion,
  sentence case headings, no em or en dashes in our copy.
- `npm run lint:brand` enforces that against `out/`. It must pass before
  deploying. It carries one named waiver for unreachable Next.js error chrome;
  see `isFrameworkDeadCode`. Do not widen it.
- Tailwind was removed on purpose. Its preflight ships grey defaults that fight
  the two ink rule; hand written CSS in `app/globals.css` is the whole system.
- The diagram toggle in `app/globals.css` uses `.diagram svg.dg-wide` rather
  than `.dg-wide`, because `.diagram svg` would otherwise outrank it and both
  drawings would render.
- Deploy with `npm run deploy`. Verify afterwards that a grantee's own text
  ranks that grantee first through the live `/api/search`.
