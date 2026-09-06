# The Emergent Ventures Gazetteer

Every Emergent Ventures grant, read and classified. Live at
[evwinners.thothica.com](https://evwinners.thothica.com).

This extends [Nabeel Qureshi's Emergent Ventures Winners](https://evwinners.org),
which collected all 1,266 grantees and their announcement posts and built the
search that made them findable. It does not replace it. Corrections belong
upstream in [his repository](https://github.com/nqureshi/ev-winners), where both
sites read from.

## What it adds

The source data carries a subject for 18 per cent of grants and a career stage
for 3 per cent. Every entry was read and classified along seven facets:

| Facet | What it holds |
|---|---|
| Field | 25 controlled values, one to three per grant |
| What they made | Startup, nonprofit, book, podcast, hardware, dataset, and eleven more |
| Kind of grant | Project, career development, travel, prize, institutional support |
| Stage | School, undergraduate, graduate, postdoc, academic, founder, writer, professional, independent |
| Series and tranche | Including four tranches announced only in prose |
| Place | Country of work and of origin |
| Person | Identity resolved across cohorts, so repeat winners read as one person |

Reading rather than pattern matching is what turned up the parts the data does
not state: Ukraine, archaeology, science education and science communication
tranches announced inside numbered cohorts; 45 people holding more than one
grant, some under different spellings; and joint grants that share a
description between several people without being the same person.

The classification is judgement, not fact. Where a description does not support
a value it is left blank rather than guessed, and where two rows might be one
person but the evidence does not settle it they stay separate and the doubt is
recorded in `data/identity.json`.

## How it works

**Build step.** `npm run data` reads `data/ev-winners.csv` and
`data/classification/*.psv`, checks every tag against `data/vocabulary.json`,
resolves people using `data/identity.json`, and embeds each grant through
Workers AI. It authenticates with your existing wrangler login by running
`scripts/embed-worker.js` under `wrangler dev --remote`, so no API token is
stored anywhere. Vectors are cached by a hash of the text, so a rebuild that
changes no wording re-embeds nothing.

The classification goes into the embedded text on purpose. A two letter query
like "AI" is weak input on its own; the tags give it something exact to match.

**Static site.** Next.js with `output: 'export'`. One page, prerendered with
every record inline, so facets and name matching need no request. Fonts are
self hosted.

**Search worker.** `worker/index.ts` answers `GET /api/search?q=`, embedding the
query with the same model, scanning the vector matrix, and returning ids and
scores only.

## Commands

```bash
npm install
npm run data          # rebuild gazetteer.json and the embedding matrix
npm run build         # static export into out/
npm run preview       # build, then serve the whole thing on wrangler dev
npm run test          # tranche detection tests
npm run lint:brand    # two ink and voice rules, over the built output
npm run deploy        # build and deploy to Cloudflare
node scripts/validate-classification.mjs   # vocabulary check and a distribution report
```

## Two things to keep true

**The model must match on both sides.** `scripts/embed.mjs` and
`worker/index.ts` both name `@cf/baai/bge-base-en-v1.5`. Change one and ranking
degrades quietly. The check is that a grant's own text, sent through
`/api/search`, ranks that grant first above 0.95.

**The palette is two inks.** `npm run lint:brand` checks the built output for
any hex outside black and white, any alpha, any opacity below 1, any gradient
other than the permitted hatch, and any dash or banned word in our own copy.
There are no light and dark modes; sections invert instead.

Not affiliated with Emergent Ventures or the Mercatus Center.
