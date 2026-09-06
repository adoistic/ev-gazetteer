/**
 * Serves the static export and answers one search route.
 *
 * GET /api/search?q=...  ->  { query, results: [{ id, score }] }
 *
 * The corpus vectors were written at build time by scripts/build-data.mjs with
 * the same model named below, and normalised to unit length, so ranking is a
 * dot product. Only ids and scores are returned; the browser already holds the
 * metadata from the prerendered page.
 */

interface Env {
  AI: { run(model: string, input: { text: string[] }): Promise<{ data: number[][] }> }
  ASSETS: { fetch(request: Request | string): Promise<Response> }
}

const MODEL = '@cf/baai/bge-base-en-v1.5'
/** bge wants this on the query side only. Stored passages carry no prefix. */
const QUERY_PREFIX = 'Represent this sentence for searching relevant passages: '
const TOP_N = 120
const MAX_QUERY = 300

type Corpus = { ids: number[]; dims: number; rows: number; matrix: Float32Array }

// Cached for the life of the isolate, so only the first request pays for it.
let corpusPromise: Promise<Corpus> | null = null

function loadCorpus(env: Env, origin: string): Promise<Corpus> {
  if (!corpusPromise) {
    corpusPromise = (async () => {
      const [metaRes, binRes] = await Promise.all([
        env.ASSETS.fetch(new URL('/embeddings.json', origin).toString()),
        env.ASSETS.fetch(new URL('/embeddings.bin', origin).toString()),
      ])
      if (!metaRes.ok || !binRes.ok) {
        throw new Error(`Corpus missing: meta ${metaRes.status}, matrix ${binRes.status}`)
      }
      const meta = (await metaRes.json()) as { ids: number[]; dims: number; rows: number }
      const buf = await binRes.arrayBuffer()
      const expected = meta.rows * meta.dims * 4
      if (buf.byteLength !== expected) {
        throw new Error(`Corpus is ${buf.byteLength} bytes, expected ${expected}.`)
      }
      return { ids: meta.ids, dims: meta.dims, rows: meta.rows, matrix: new Float32Array(buf) }
    })().catch((e) => {
      // Do not cache a failure; the next request should try again.
      corpusPromise = null
      throw e
    })
  }
  return corpusPromise
}

async function embedQuery(env: Env, query: string): Promise<Float32Array> {
  const out = await env.AI.run(MODEL, { text: [QUERY_PREFIX + query] })
  const raw = out?.data?.[0]
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('The model returned no vector.')
  const v = new Float32Array(raw.length)
  let sum = 0
  for (let i = 0; i < raw.length; i++) sum += raw[i] * raw[i]
  const n = Math.sqrt(sum) || 1
  for (let i = 0; i < raw.length; i++) v[i] = raw[i] / n
  return v
}

function rank(q: Float32Array, c: Corpus) {
  const scored: { id: number; score: number }[] = new Array(c.rows)
  for (let i = 0; i < c.rows; i++) {
    const base = i * c.dims
    let s = 0
    for (let j = 0; j < c.dims; j++) s += q[j] * c.matrix[base + j]
    scored[i] = { id: c.ids[i], score: s }
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, TOP_N)
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // The corpus only changes on deploy, so a query answer is safe to reuse.
      'cache-control': 'public, max-age=300',
    },
  })

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname !== '/api/search') {
      return env.ASSETS.fetch(request)
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json({ error: 'Use GET.' }, 405)
    }

    const query = (url.searchParams.get('q') ?? '').trim().slice(0, MAX_QUERY)
    // An empty query is a normal state, not an error.
    if (query.length < 2) return json({ query, results: [] })

    try {
      const [q, corpus] = await Promise.all([embedQuery(env, query), loadCorpus(env, url.origin)])
      if (q.length !== corpus.dims) {
        throw new Error(`Query has ${q.length} dimensions, corpus has ${corpus.dims}.`)
      }
      return json({ query, model: MODEL, results: rank(q, corpus) })
    } catch (e) {
      console.error('search failed', e)
      return json({ query, error: 'Search is unavailable.', results: [] }, 503)
    }
  },
}
