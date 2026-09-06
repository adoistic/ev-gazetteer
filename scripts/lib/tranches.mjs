// How Emergent Ventures actually divides, which is not what the batch column
// alone says. Reading every description turned up tranches that live inside
// numbered cohorts and are marked only by a phrase in the prose.

/** The named series, taken from the batch column. */
export const SERIES = [
  { id: 'main', label: 'Main series', match: /^\d+$/ },
  { id: 'india', label: 'India', match: /^india\b/i },
  { id: 'africa', label: 'Africa and Caribbean', match: /^africa\b/i },
  { id: 'covid', label: 'Covid prizes', match: /^covid\b/i },
  { id: 'progress', label: 'Progress studies', match: /^progress\b/i },
]

/**
 * Tranches announced inside a cohort rather than as their own batch. These are
 * only discoverable by reading the announcement text.
 */
export const TRANCHES = [
  { id: 'ukraine', label: 'Ukraine', match: /\bukraine (tranche|cohort)\b/i },
  { id: 'archaeology', label: 'Archaeology', match: /\barchaeology tranche\b/i },
  { id: 'science-education', label: 'Science education', match: /\bscience education tranche\b/i },
  { id: 'science-communication', label: 'Science communication', match: /\bscience communication tranche\b/i },
]

export function seriesOf(batch) {
  const name = String(batch ?? '').trim()
  const hit = SERIES.find((s) => s.match.test(name))
  return hit ? hit.id : 'main'
}

export function trancheOf(description) {
  const text = String(description ?? '')
  const hit = TRANCHES.find((t) => t.match.test(text))
  return hit ? hit.id : null
}

/** Sort batch names naturally so "India 2" precedes "India 10". */
export function compareBatches(a, b) {
  return String(a).localeCompare(String(b), 'en', { numeric: true, sensitivity: 'base' })
}
