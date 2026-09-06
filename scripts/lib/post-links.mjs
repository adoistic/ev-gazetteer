// Recovers the hyperlinks that the grantee CSV drops.
//
// A description like "Twitter here" or "founder of Thothica" was a link in the
// original announcement post. The CSV keeps the words and loses the address.
// This reads the archived post, finds where a grant's text sits inside it, and
// hands back only the links that fall within that text.
//
// The offsets matter. Some posts put two grantees in one paragraph, so taking
// every link in the paragraph would give one person the other's blog.

import { parse } from 'node-html-parser'

/** Wayback rewrites every href to point at itself. Undo that. */
export function unwrapArchive(href) {
  const m = href.match(/^https?:\/\/web\.archive\.org\/web\/[0-9]+(?:[a-z_]+)?\/(https?:\/\/.+)$/i)
  return m ? m[1] : href
}

const NAV =
  /marginalrevolution\.com\/?$|\/category\/|\/author\/|\/tag\/|\/feed|wp-login|#respond|#comment|mailto:|twitter\.com\/intent|facebook\.com\/sharer/i

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '\u2026', mdash: '\u2014', ndash: '\u2013',
  lsquo: '\u2018', rsquo: '\u2019', ldquo: '\u201c', rdquo: '\u201d',
}

/**
 * The parser returns raw text, so entities survive as "&#8220;". Left alone
 * they stop a description matching the paragraph it came from.
 */
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m)

/** Normalise entities, quotes and spacing so two copies of a sentence compare equal. */
const tidy = (s) =>
  decode(s).replace(/ /g, ' ').replace(/['‘’]/g, "'").replace(/[“”]/g, '"')

/** Append text to a buffer, collapsing whitespace across the join. */
function append(buf, s) {
  const cleaned = tidy(s).replace(/\s+/g, ' ')
  if (!cleaned) return buf
  if (buf.endsWith(' ') && cleaned.startsWith(' ')) return buf + cleaned.slice(1)
  return buf + cleaned
}

/**
 * Text of one block with every anchor's position inside that text, so a link
 * can later be attributed to the sentence it actually sits in.
 */
function readBlock(el) {
  let text = ''
  const anchors = []

  const walk = (node) => {
    if (node.nodeType === 3) {
      text = append(text, node.rawText ?? node.text ?? '')
      return
    }
    if (node.tagName === 'A') {
      const start = text.length
      for (const c of node.childNodes) walk(c)
      const href = unwrapArchive((node.getAttribute('href') ?? '').trim())
      const label = text.slice(start).trim()
      if (href && /^https?:\/\//i.test(href) && !NAV.test(href) && label) {
        anchors.push({ text: label, href, start, end: text.length })
      }
      return
    }
    for (const c of node.childNodes) walk(c)
  }

  for (const c of el.childNodes) walk(c)
  return { text: text.trim(), anchors }
}

/** Every paragraph and list item of the post body. */
export function blocksOf(html) {
  const root = parse(html)
  const body = root.querySelector('.entry-content') ?? root
  const blocks = []
  for (const el of body.querySelectorAll('p, li')) {
    if (el.querySelector('p, li')) continue // avoid counting a wrapper twice
    const b = readBlock(el)
    if (b.text.length < 25) continue
    blocks.push(b)
  }
  return blocks
}

const lower = (s) => tidy(s).replace(/\s+/g, ' ').trim().toLowerCase()

/**
 * Find the block a description came from, and where inside it the description
 * begins. A null offset means the position could not be pinned down.
 */
export function matchBlock(description, blocks) {
  const d = lower(description)
  if (d.length < 20) return null

  for (const b of blocks) {
    const at = lower(b.text).indexOf(d)
    if (at !== -1) return { block: b, start: at, end: at + d.length, exact: true }
  }

  // The text was edited after collection, so fall back to word overlap. Links
  // are only taken from such a block when it is barely longer than the
  // description, which means there is no room for a second grantee in it.
  const words = new Set(d.split(' ').filter((w) => w.length > 3))
  if (words.size < 4) return null
  let best = null
  let bestScore = 0
  for (const b of blocks) {
    const bw = new Set(lower(b.text).split(' ').filter((w) => w.length > 3))
    let hit = 0
    for (const w of words) if (bw.has(w)) hit++
    const score = hit / words.size
    if (score > bestScore) {
      bestScore = score
      best = b
    }
  }
  if (!best || bestScore < 0.6) return null
  const roomy = best.text.length > d.length * 1.35
  return { block: best, start: 0, end: best.text.length, exact: false, roomy }
}

/** The anchors that sit inside this grant's stretch of the block. */
export function linksFor(match) {
  if (!match) return []
  if (!match.exact && match.roomy) return [] // cannot say which grantee they belong to
  const out = []
  for (const a of match.block.anchors) {
    if (a.start >= match.start && a.end <= match.end) {
      if (!out.some((l) => l.href === a.href)) out.push({ text: a.text, href: a.href })
    }
  }
  return out
}

/**
 * Split a description into runs of plain text and linked text. Only link text
 * that appears in the description is marked up; a link whose words were edited
 * out is returned separately, so nothing is silently dropped.
 */
export function linkifyDescription(description, links) {
  const text = tidy(description).replace(/\s+/g, ' ').trim()
  if (!links.length) return { parts: [{ text }], extra: [] }

  const spans = []
  const hay = text.toLowerCase()
  for (const l of links) {
    const needle = tidy(l.text).replace(/\s+/g, ' ').trim()
    if (needle.length < 2) continue
    let from = 0
    while (true) {
      const at = hay.indexOf(needle.toLowerCase(), from)
      if (at === -1) break
      if (!spans.some((s) => at < s.end && at + needle.length > s.start)) {
        spans.push({ start: at, end: at + needle.length, href: l.href })
        break
      }
      from = at + 1
    }
  }
  spans.sort((a, b) => a.start - b.start)

  const parts = []
  let at = 0
  for (const s of spans) {
    if (s.start > at) parts.push({ text: text.slice(at, s.start) })
    parts.push({ text: text.slice(s.start, s.end), href: s.href })
    at = s.end
  }
  if (at < text.length) parts.push({ text: text.slice(at) })

  const used = new Set(spans.map((s) => s.href))
  return { parts, extra: links.filter((l) => !used.has(l.href)) }
}
