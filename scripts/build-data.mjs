// Builds everything the site and the Worker read.
//
//   app/data/gazetteer.json   grants, people, facets. No vectors.
//   public/embeddings.bin     Float32 matrix, one unit vector per grant.
//   public/embeddings.json    header describing that matrix.
//
// The three share one row order. Nothing downstream re-sorts them.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseCsv } from './lib/csv.mjs'
import { seriesOf, trancheOf, SERIES, TRANCHES, compareBatches } from './lib/tranches.mjs'
import { loadClassification } from './validate-classification.mjs'
import { blocksOf, matchBlock, linksFor, linkifyDescription } from './lib/post-links.mjs'
import { slugOf } from './fetch-posts.mjs'
import { embedAll, MODEL, DIMS } from './embed.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const clean = (v) => {
  const s = String(v ?? '').trim()
  return !s || s === '-' || s === 'N/A' || s === 'n/a' ? null : s
}

const links = (v) => {
  const s = clean(v)
  if (!s) return []
  return s.split(/[\s,;]+/).map((x) => x.trim().replace(/[.,;]+$/, '')).filter((x) => x.length > 3)
}

/**
 * What the embedding model sees. The classification goes in deliberately: a
 * two letter query like "AI" is weak input on its own, and the tags give it
 * something exact to match. Without this, the person whose description says
 * "AI-powered translation" never surfaces for "AI".
 */
function embedText(w, vocab) {
  const fields = w.fields.map((f) => vocab.field[f])
  return [
    w.name,
    w.description,
    fields.join(', '),
    w.topics.join(', '),
    w.outputs.map((o) => vocab.output[o]).join(', '),
    w.org,
    w.country,
    w.personal_info,
  ]
    .filter(Boolean)
    .join('. ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Attach the hyperlinks the CSV drops.
 *
 * The words survive in the description; the addresses only exist in the
 * announcement post. Each cached post is parsed once, then each grant is
 * matched to the paragraph it came from.
 */
async function attachLinks(grants) {
  const cache = new Map()
  let matched = 0
  let missing = 0

  for (const g of grants) {
    g.desc = g.description ? [{ text: g.description }] : []
    g.links = []
    if (!g.description || !g.link) continue

    const url = /^https?:\/\//i.test(g.link) ? g.link : `https://${g.link}`
    const file = slugOf(url)
    if (!cache.has(file)) {
      try {
        cache.set(file, blocksOf(await readFile(path.join(root, 'data', 'posts', file), 'utf8')))
      } catch {
        cache.set(file, null) // post not cached; the grant keeps plain text
      }
    }
    const blocks = cache.get(file)
    if (!blocks) {
      missing++
      continue
    }

    const found = matchBlock(g.description, blocks)
    const links = linksFor(found)
    if (!links.length) continue
    const { parts, extra } = linkifyDescription(g.description, links)
    g.desc = parts
    g.links = extra
    if (parts.some((p) => p.href) || extra.length) matched++
  }

  console.log(`Links recovered for ${matched} grants. ${missing} had no cached post.`)
  return grants
}

export async function loadGrants() {
  const text = await readFile(path.join(root, 'data', 'ev-winners.csv'), 'utf8')
  const { rows: cls, errors, vocab } = await loadClassification()
  if (errors.length) throw new Error(`Classification invalid:\n${errors.slice(0, 10).join('\n')}`)

  const grants = parseCsv(text).map((r) => {
    const id = Number(r.id)
    const c = cls.get(id)
    if (!c) throw new Error(`Row ${id} has no classification.`)
    const description = clean(r.description)
    return {
      id,
      name: clean(r.name) ?? 'Anonymous',
      batch: String(r.batch ?? '').trim(),
      series: seriesOf(r.batch),
      tranche: trancheOf(description),
      date: clean(r.date_announced),
      link: clean(r.link),
      description,
      personal_info: clean(r.personal_info),
      personal_links: links(r.personal_links),
      project_links: links(r.project_links),
      fields: c.fields,
      topics: c.topics,
      outputs: c.outputs,
      purpose: c.purpose,
      country: c.country,
      origin: c.origin,
      stage: c.stage,
      age: c.age,
      org: c.org,
    }
  })

  for (const g of grants) g.embedText = embedText(g, vocab)
  await attachLinks(grants)
  return { grants, vocab }
}

/**
 * Group grants into people using the hand-adjudicated identity file.
 *
 * Merges join one person's separate grants. A joint grant is a different
 * thing: it belongs to several people at once and must not fuse them, which
 * is why it is handled after the union-find rather than inside it.
 */
async function resolvePeople(grants) {
  const identity = JSON.parse(await readFile(path.join(root, 'data', 'identity.json'), 'utf8'))
  const never = new Set(identity.never_merge.ids)
  const jointById = new Map(identity.joint.map((j) => [j.id, j]))

  const parent = new Map(grants.map((g) => [g.id, g.id]))
  const find = (x) => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)))
      x = parent.get(x)
    }
    return x
  }
  const union = (a, b) => {
    const [ra, rb] = [find(a), find(b)]
    if (ra !== rb) parent.set(rb, ra)
  }

  const note = new Map()
  for (const m of identity.merge) {
    const ids = m.ids.filter((i) => !never.has(i) && parent.has(i))
    for (let i = 1; i < ids.length; i++) union(ids[0], ids[i])
    if (ids.length) note.set(find(ids[0]), m)
  }

  const byRoot = new Map()
  for (const g of grants) {
    if (jointById.has(g.id)) continue // attached to its members below
    const r = find(g.id)
    if (!byRoot.has(r)) byRoot.set(r, [])
    byRoot.get(r).push(g)
  }

  const people = new Map()
  for (const [r, gs] of byRoot) {
    const n = note.get(r)
    people.set(r, {
      key: `p${r}`,
      name: n?.canonical ?? gs[0].name,
      grants: gs.map((g) => g.id),
      mergeNote: n?.why ?? null,
      jointNotes: [],
    })
  }

  const byId = new Map(grants.map((g) => [g.id, g]))
  for (const g of grants) g.people = jointById.has(g.id) ? [] : [people.get(find(g.id)).key]

  for (const j of identity.joint) {
    const g = byId.get(j.id)
    if (!g) continue
    for (const anchor of j.members) {
      const p = people.get(find(anchor))
      if (!p) throw new Error(`Joint grant ${j.id} names an unknown member ${anchor}.`)
      p.grants.push(j.id)
      p.jointNotes.push(j.why)
      g.people.push(p.key)
    }
  }

  const teams = new Map()
  for (const t of identity.teams) for (const id of t.ids) teams.set(id, t)
  for (const g of grants) g.team = teams.get(g.id)?.project ?? null

  const list = [...people.values()].map((p) => {
    const gs = p.grants.map((id) => byId.get(id)).filter(Boolean)
    gs.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
    return { ...p, grants: gs.map((g) => g.id), repeat: gs.length > 1 }
  })

  return { people: list, uncertain: identity.uncertain }
}

function normalise(v) {
  let sum = 0
  for (const x of v) sum += x * x
  const n = Math.sqrt(sum) || 1
  return v.map((x) => x / n)
}

/** Facet values worth putting in the interface, with their counts. */
function buildFacets(grants, vocab) {
  const tally = (fn) => {
    const c = new Map()
    for (const g of grants) for (const v of [].concat(fn(g)).filter(Boolean)) c.set(v, (c.get(v) ?? 0) + 1)
    return c
  }
  const asList = (map, label) =>
    [...map.entries()]
      .map(([id, count]) => ({ id, label: label ? label(id) : id, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

  const countries = new Set([...tally((g) => g.country).keys()].map((c) => c.toLowerCase()))
  const purposes = new Set(Object.values(vocab.purpose).map((p) => p.toLowerCase()))

  return {
    field: asList(tally((g) => g.fields), (id) => vocab.field[id]),
    output: asList(tally((g) => g.outputs), (id) => vocab.output[id]),
    purpose: asList(tally((g) => g.purpose), (id) => vocab.purpose[id]),
    stage: asList(tally((g) => g.stage), (id) => vocab.stage[id]),
    series: asList(tally((g) => g.series), (id) => SERIES.find((s) => s.id === id)?.label ?? id),
    tranche: asList(tally((g) => g.tranche), (id) => TRANCHES.find((t) => t.id === id)?.label ?? id),
    country: asList(tally((g) => g.country)),
    // The long tail of topics is for search, not for browsing. A topic earns a
    // place in the interface only if enough grants carry it and it is not
    // already a country or a kind of grant, which have facets of their own.
    topic: asList(tally((g) => g.topics)).filter(
      (t) => t.count >= 4 && !countries.has(t.id.toLowerCase()) && !purposes.has(t.id.toLowerCase())
    ),
  }
}

const hashOf = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

/**
 * Re-embedding 1,266 rows takes minutes and costs money, so a row whose text
 * has not changed reuses its vector. The hash is stored alongside the matrix,
 * which is what makes the reuse safe.
 */
async function cachedVectors(grants) {
  let cache = new Map()
  try {
    const meta = JSON.parse(await readFile(path.join(root, 'public', 'embeddings.json'), 'utf8'))
    const buf = await readFile(path.join(root, 'public', 'embeddings.bin'))
    if (meta.model === MODEL && meta.dims === DIMS && Array.isArray(meta.hashes)) {
      const m = new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
      meta.hashes.forEach((h, i) => cache.set(h, Array.from(m.subarray(i * DIMS, (i + 1) * DIMS))))
    }
  } catch {
    // No usable cache; embed everything.
  }

  const hashes = grants.map((g) => hashOf(g.embedText))
  const missing = [...new Set(hashes.filter((h) => !cache.has(h)))]
  console.log(`${hashes.length - missing.length} vectors reused, ${missing.length} to embed.`)

  if (missing.length) {
    const byHash = new Map()
    grants.forEach((g, i) => { if (!byHash.has(hashes[i])) byHash.set(hashes[i], g.embedText) })
    const texts = missing.map((h) => byHash.get(h))
    const fresh = await embedAll(texts)
    missing.forEach((h, i) => cache.set(h, normalise(fresh[i])))
  }

  return { vectors: hashes.map((h) => cache.get(h)), hashes }
}

async function main() {
  const { grants, vocab } = await loadGrants()
  const { people, uncertain } = await resolvePeople(grants)

  // Newest first, and stable within a date.
  grants.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || compareBatches(b.batch, a.batch) || a.id - b.id)

  console.log(`${grants.length} grants to ${people.length} people (${people.filter((p) => p.repeat).length} with more than one grant).`)
  for (const s of SERIES) console.log(`  ${s.label}: ${grants.filter((g) => g.series === s.id).length}`)
  for (const t of TRANCHES) console.log(`  ${t.label} tranche: ${grants.filter((g) => g.tranche === t.id).length}`)

  const { vectors, hashes } = await cachedVectors(grants)
  const matrix = new Float32Array(grants.length * DIMS)
  vectors.forEach((v, i) => {
    if (!v || v.length !== DIMS) throw new Error(`Row ${i} has ${v?.length} dimensions, expected ${DIMS}.`)
    matrix.set(normalise(v), i * DIMS)
  })

  await mkdir(path.join(root, 'app', 'data'), { recursive: true })
  await writeFile(
    path.join(root, 'app', 'data', 'gazetteer.json'),
    JSON.stringify({
      grants: grants.map(({ embedText, description, personal_info, ...rest }) => rest),
      people,
      uncertain,
      facets: buildFacets(grants, vocab),
      vocab,
      series: SERIES.map(({ match, ...s }) => s),
      tranches: TRANCHES.map(({ match, ...t }) => t),
      updated: grants.reduce((a, g) => (g.date && g.date > a ? g.date : a), ''),
    }),
    'utf8'
  )
  await writeFile(path.join(root, 'public', 'embeddings.bin'), Buffer.from(matrix.buffer))
  await writeFile(
    path.join(root, 'public', 'embeddings.json'),
    JSON.stringify({ model: MODEL, dims: DIMS, rows: grants.length, ids: grants.map((g) => g.id), hashes }),
    'utf8'
  )
  console.log(`Wrote ${grants.length} rows and a ${matrix.byteLength} byte matrix.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
