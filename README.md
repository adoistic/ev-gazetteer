# Emergent Ventures beyond the main series

The 469 Emergent Ventures grantees from the four regional and thematic
tranches, searchable by meaning. Built by Adnan Abbasi, Founder and CEO of
[Thothica](https://thothica.com).

Inspired by [Nabeel Qureshi's Emergent Ventures Winners](https://evwinners.org),
which covers the numbered cohorts and supplied both the data and the idea. For
cohorts 1 to 58, go there.

| Programme | Grantees |
|---|---|
| India | 345 |
| Africa and Caribbean | 104 |
| Covid prizes | 11 |
| Progress studies | 9 |

The split is mechanical: a batch whose name is entirely digits belongs to the
main series and is excluded. Everything else is kept, so a new tranche needs no
code change.

## How it works

Three pieces.

**Build step.** `npm run data` reads `data/ev-winners.csv`, drops the main
series, and embeds each remaining grantee through Workers AI. It authenticates
with your existing wrangler login by running `scripts/embed-worker.js` under
`wrangler dev --remote`, so no API token is stored anywhere. It writes
`app/data/winners.json`, `public/embeddings.bin` and `public/embeddings.json`,
all in one row order.

**Static site.** Next.js with `output: 'export'`. One page, prerendered with all
469 records inline, so filtering and name lookup need no request. Fonts are self
hosted, so there is no CDN dependency at build or at runtime.

**Search worker.** `worker/index.ts` answers `GET /api/search?q=`. It embeds the
query with the same model, loads the vector matrix once per isolate through the
`ASSETS` binding, scans by dot product, and returns ids and scores only. The
browser already holds the metadata.

## Commands

```bash
npm install
npm run data          # regenerate winners.json and the embedding matrix
npm run build         # static export into out/
npm run preview       # build, then serve the whole thing on wrangler dev
npm run test          # data and filter tests
npm run lint:brand    # two ink and voice rules, over the built output
npm run deploy        # build and deploy to Cloudflare
```

## Two things to keep true

**The model must match on both sides.** `scripts/embed.mjs` and
`worker/index.ts` both name `@cf/baai/bge-base-en-v1.5`. Change one and ranking
degrades quietly rather than failing. The check is that a grantee's own text,
sent through `/api/search`, ranks that grantee first with a score above 0.95.

**The palette is two inks.** `npm run lint:brand` checks the built output for
any hex outside black and white, any alpha, any opacity below 1, any gradient
other than the permitted hatch, and any dash or banned word in our own copy.
Grantee descriptions are quoted from the announcement posts and are not ours to
rewrite, so the voice rules run over source files rather than rendered text.

## Data

`data/ev-winners.csv` is a snapshot of the shared dataset. Corrections belong
upstream at [nqureshi/ev-winners](https://github.com/nqureshi/ev-winners) so
both sites benefit. Pull the updated CSV in, then run `npm run data`.

Not affiliated with Emergent Ventures or the Mercatus Center.
