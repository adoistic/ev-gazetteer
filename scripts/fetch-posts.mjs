// Downloads the announcement posts so their inline hyperlinks can be recovered.
//
// The grantee CSV keeps description text but not the links inside it, so a
// sentence like "here is his blog" loses the blog. The links live in the
// original Marginal Revolution posts.
//
// Those are fetched from the Wayback Machine rather than from
// marginalrevolution.com, whose robots.txt asks for a 600 second crawl delay.
// Honouring that for 88 posts would mean fifteen hours of requests against
// someone else's server. The archive exists for this and costs them nothing.
//
// Snapshots are cached on disk, so this runs once.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseCsv } from './lib/csv.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR = path.join(root, 'data', 'posts')
const UA = 'ev-gazetteer/1.0 (one-time link extraction for evwinners.thothica.com; siraj@thothica.com)'
const DELAY = 1200

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** A stable filename for a post URL. */
export const slugOf = (url) =>
  url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 120) + '.html'

export async function postUrls() {
  const text = await readFile(path.join(root, 'data', 'ev-winners.csv'), 'utf8')
  const urls = new Set()
  for (const r of parseCsv(text)) {
    const l = (r.link ?? '').trim()
    if (!l || l === '-') continue
    urls.add(/^https?:\/\//i.test(l) ? l : `https://${l}`)
  }
  return [...urls].sort()
}

/**
 * Candidate snapshot URLs, best first.
 *
 * /web/2/ redirects to the most recent capture, which is sometimes one the
 * archive will not serve. The CDX index lists every capture that returned 200,
 * so a refusal on the newest one falls back to an older good copy.
 */
async function snapshotsFor(url) {
  const list = [`https://web.archive.org/web/2/${url}`]
  try {
    const q = encodeURIComponent(url)
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${q}&output=json&filter=statuscode:200&limit=-4`,
      { headers: { 'user-agent': UA } }
    )
    if (res.ok) {
      const rows = await res.json()
      for (const row of rows.slice(1).reverse()) {
        list.push(`https://web.archive.org/web/${row[1]}/${url}`)
      }
    }
  } catch {
    // The index is a convenience; the direct redirect may still work.
  }
  return list
}

async function main() {
  await mkdir(DIR, { recursive: true })
  const have = new Set(await readdir(DIR))
  const urls = await postUrls()
  const todo = urls.filter((u) => !have.has(slugOf(u)))
  console.log(`${urls.length} posts, ${urls.length - todo.length} already cached, ${todo.length} to fetch.`)

  let ok = 0
  const failed = []
  for (const [i, url] of todo.entries()) {
    let saved = false
    let why = 'no snapshot tried'
    for (const snapshot of await snapshotsFor(url)) {
      try {
        const res = await fetch(snapshot, { headers: { 'user-agent': UA }, redirect: 'follow' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const html = await res.text()
        if (!html.includes('entry-content')) throw new Error('no entry-content in snapshot')
        await writeFile(path.join(DIR, slugOf(url)), html, 'utf8')
        saved = true
        break
      } catch (e) {
        why = String(e.message ?? e)
        await sleep(DELAY)
      }
    }
    if (saved) ok++
    else failed.push({ url, why })
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${todo.length}`)
    await sleep(DELAY)
  }

  console.log(`Fetched ${ok}. Failed ${failed.length}.`)
  for (const f of failed.slice(0, 10)) console.log(`  ${f.why}  ${f.url}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
