export function formatDate(iso: string | null) {
  if (!iso) return null
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export function formatLongDate(iso: string | null) {
  if (!iso) return null
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

/** Give a bare host a protocol so it opens as an external link. */
export function href(link: string | null) {
  if (!link) return null
  return /^https?:\/\//i.test(link) ? link : `https://${link}`
}

export function linkLabel(link: string) {
  try {
    return new URL(href(link) as string).hostname.replace(/^www\./, '')
  } catch {
    return link
  }
}

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/**
 * Local name matching, so typing a person's name is instant and does not wait
 * on the search request. 3 = the name starts with the term, 2 = every word of
 * the term begins a word of the name, 1 = substring.
 */
export function nameScore(name: string, term: string) {
  const n = strip(name)
  const q = strip(term)
  if (q.length < 2) return 0
  if (n.startsWith(q)) return 3
  const words = n.split(/[\s,\-()]+/)
  const tokens = q.split(/\s+/).filter(Boolean)
  if (tokens.every((t) => words.some((w) => w.startsWith(t)))) return 2
  if (q.length >= 3 && n.includes(q)) return 1
  return 0
}
