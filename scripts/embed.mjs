// Embeds text through Workers AI by running scripts/embed-worker.js under
// `wrangler dev --remote`. That worker holds the AI binding and authenticates
// with the developer's wrangler session; it is torn down when the build ends.

import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

export const MODEL = '@cf/baai/bge-base-en-v1.5'
export const DIMS = 768
/** bge asks for this prefix on the query side only, never on stored passages. */
export const QUERY_PREFIX = 'Represent this sentence for searching relevant passages: '

const PORT = 8799
const BATCH = 50

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForReady(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/health`)
      if (res.ok) return
    } catch {
      // not listening yet
    }
    await sleep(500)
  }
  throw new Error(`wrangler dev did not become ready on port ${PORT}`)
}

function startWorker() {
  const child = spawn(
    'npx',
    [
      'wrangler', 'dev',
      '--config', path.join(here, 'embed.wrangler.jsonc'),
      '--remote',
      '--ip', '127.0.0.1',
      '--port', String(PORT),
      '--log-level', 'warn',
    ],
    { cwd: here, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, CI: '1' } }
  )
  child.stdout.on('data', (d) => process.stderr.write(`  [wrangler] ${d}`))
  child.stderr.on('data', (d) => process.stderr.write(`  [wrangler] ${d}`))
  return child
}

/** Embed every string, in order. Returns one vector per input. */
export async function embedAll(texts) {
  const child = startWorker()
  const stop = () => {
    try { child.kill('SIGTERM') } catch { /* already gone */ }
  }
  process.once('exit', stop)

  try {
    await waitForReady()
    const out = []
    for (let i = 0; i < texts.length; i += BATCH) {
      const slice = texts.slice(i, i + BATCH)
      const res = await fetch(`http://127.0.0.1:${PORT}/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ texts: slice, model: MODEL }),
      })
      if (!res.ok) throw new Error(`Embedding batch failed: ${res.status} ${await res.text()}`)
      const { vectors } = await res.json()
      if (!Array.isArray(vectors) || vectors.length !== slice.length) {
        throw new Error(`Batch at ${i} returned ${vectors?.length} vectors for ${slice.length} texts.`)
      }
      out.push(...vectors)
      process.stderr.write(`  embedded ${Math.min(i + BATCH, texts.length)}/${texts.length}\n`)
    }
    return out
  } finally {
    stop()
    await sleep(300)
  }
}
