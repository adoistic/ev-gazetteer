// Which Emergent Ventures grantees belong on this site, and how they group.
//
// The main series numbers its cohorts (1 through 58 and counting) and is
// covered at evwinners.org. Everything else is a regional or thematic tranche
// and belongs here. The test is mechanical rather than a list of names, so a
// new tranche needs no code change.

/** True for the main series: a batch whose name is entirely digits. */
export function isMainCohort(batch) {
  return /^\d+$/.test(String(batch ?? '').trim())
}

/** The four programmes this site holds, in the order they are presented. */
export const PROGRAMMES = [
  {
    id: 'india',
    label: 'India',
    match: /^india\b/i,
    blurb: 'The India tranche, run since 2020 and by far the largest of the four.',
  },
  {
    id: 'africa',
    label: 'Africa and Caribbean',
    match: /^africa\b/i,
    blurb: 'Grants for the Africa and Caribbean programme.',
  },
  {
    id: 'covid',
    label: 'Covid prizes',
    match: /^covid\b/i,
    blurb: 'Fast prizes awarded during the pandemic for work that helped immediately.',
  },
  {
    id: 'progress',
    label: 'Progress studies',
    match: /^progress\b/i,
    blurb: 'A single tranche for people studying how progress happens.',
  },
]

/** The programme id for a batch, or null if the batch is not one of ours. */
export function programmeOf(batch) {
  const name = String(batch ?? '').trim()
  if (!name || isMainCohort(name)) return null
  const hit = PROGRAMMES.find((p) => p.match.test(name))
  return hit ? hit.id : null
}

/**
 * Sort batch names naturally so "India 2" precedes "India 10", and an
 * unnumbered name such as "India (Oct 2020)" sorts before the numbered ones.
 */
export function compareBatches(a, b) {
  return String(a).localeCompare(String(b), 'en', { numeric: true, sensitivity: 'base' })
}

/** Trailing integer in a batch name, or null. Used only for display. */
export function batchNumber(batch) {
  const m = String(batch ?? '').match(/(\d+)\s*$/)
  return m ? Number(m[1]) : null
}
