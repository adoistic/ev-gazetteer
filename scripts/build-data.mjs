// Turns the grantee CSV into what the site and the Worker read:
//
//   app/data/winners.json   metadata for all kept winners, no vectors
//   public/embeddings.bin   Float32 matrix, one unit vector per winner
//   public/embeddings.json  header describing that matrix
//
// The three files share one row order. Nothing downstream re-sorts them.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseCsv } from './lib/csv.mjs'
import { isMainCohort, programmeOf, PROGRAMMES, compareBatches } from './lib/tranches.mjs'
import { embedAll, MODEL, DIMS } from './embed.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** The CSV writes an absent value as "-", "N/A" or an empty string. */
const clean = (v) => {
  const s = String(v ?? '').trim()
  if (!s || s === '-' || s === 'N/A' || s === 'n/a') return null
  return s
}

/** Multi value columns hold whitespace or comma separated URLs. */
const links = (v) => {
  const s = clean(v)
  if (!s) return []
  return s
    .split(/[\s,;]+/)
    .map((x) => x.trim().replace(/[.,;]+$/, ''))
    .filter((x) => x.length > 3)
}

/**
 * One string per winner for the embedding model. Name first so a name query
 * still lands, then what they are doing, then the coarse facets.
 */
function embedText(w) {
  return [w.name, w.description, w.type, w.career_stage, w.personal_info]
    .filter(Boolean)
    .join('. ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Read the CSV, drop the main series, and normalise what is left. */
export async function loadRows(csvPath) {
  const text = await readFile(csvPath, 'utf8')
  const rows = parseCsv(text)
  const kept = []

  for (const r of rows) {
    const batch = String(r.batch ?? '').trim()
    if (!batch || isMainCohort(batch)) continue
    const programme = programmeOf(batch)
    if (!programme) {
      throw new Error(`Batch "${batch}" is not the main series and matches no programme.`)
    }
    const w = {
      id: Number(r.id),
      name: clean(r.name) ?? 'Anonymous',
      batch,
      programme,
      date: clean(r.date_announced),
      link: clean(r.link),
      description: clean(r.description),
      type: clean(r.type),
      career_stage: clean(r.career_stage),
      personal_info: clean(r.personal_info),
      personal_links: links(r.personal_links),
      project_links: links(r.project_links),
      mr_posts: links(r.mr_posts),
    }
    w.embedText = embedText(w)
    if (!w.embedText) w.embedText = `${w.name}. Emergent Ventures ${batch} grantee.`
    kept.push(w)
  }

  // Newest tranche first, and within a tranche keep the CSV's own order.
  kept.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || compareBatches(b.batch, a.batch))
  return kept
}

/** Force each vector to unit length so the Worker's cosine is a dot product. */
function normalise(v) {
  let sum = 0
  for (const x of v) sum += x * x
  const n = Math.sqrt(sum) || 1
  return v.map((x) => x / n)
}

async function main() {
  const winners = await loadRows(path.join(root, 'data', 'ev-winners.csv'))
  console.log(`Kept ${winners.length} winners across ${PROGRAMMES.length} programmes.`)
  for (const p of PROGRAMMES) {
    console.log(`  ${p.label}: ${winners.filter((w) => w.programme === p.id).length}`)
  }

  const vectors = await embedAll(winners.map((w) => w.embedText))
  if (vectors.length !== winners.length) {
    throw new Error(`Got ${vectors.length} vectors for ${winners.length} winners.`)
  }

  const matrix = new Float32Array(winners.length * DIMS)
  vectors.forEach((v, i) => {
    if (v.length !== DIMS) throw new Error(`Row ${i} has ${v.length} dimensions, expected ${DIMS}.`)
    matrix.set(normalise(v), i * DIMS)
  })

  await mkdir(path.join(root, 'app', 'data'), { recursive: true })
  const meta = winners.map(({ embedText, ...rest }) => rest)
  await writeFile(path.join(root, 'app', 'data', 'winners.json'), JSON.stringify(meta), 'utf8')
  await writeFile(path.join(root, 'public', 'embeddings.bin'), Buffer.from(matrix.buffer))
  await writeFile(
    path.join(root, 'public', 'embeddings.json'),
    JSON.stringify({ model: MODEL, dims: DIMS, rows: winners.length, ids: winners.map((w) => w.id) }),
    'utf8'
  )
  console.log(`Wrote ${winners.length} rows and a ${matrix.byteLength} byte matrix.`)
}

// Compare as URLs: this path contains a space, so a raw string compare against
// process.argv[1] never matches once the URL is percent encoded.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
