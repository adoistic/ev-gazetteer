export type ProgrammeId = 'india' | 'africa' | 'covid' | 'progress'

export type Winner = {
  id: number
  name: string
  batch: string
  programme: ProgrammeId
  date: string | null
  link: string | null
  description: string | null
  type: string | null
  career_stage: string | null
  personal_info: string | null
  personal_links: string[]
  project_links: string[]
  mr_posts: string[]
}

export type Programme = { id: ProgrammeId; label: string; short: string; blurb: string }

export const PROGRAMMES: Programme[] = [
  {
    id: 'india',
    label: 'India',
    short: 'India',
    blurb: 'Running since 2020 and by far the largest of the four.',
  },
  {
    id: 'africa',
    label: 'Africa and Caribbean',
    short: 'Africa',
    blurb: 'Grants across Africa and the Caribbean.',
  },
  {
    id: 'covid',
    label: 'Covid prizes',
    short: 'Covid',
    blurb: 'Fast prizes for work that helped during the pandemic.',
  },
  {
    id: 'progress',
    label: 'Progress studies',
    short: 'Progress',
    blurb: 'One tranche for people studying how progress happens.',
  },
]

/** The main series, which this site does not hold. */
export const MAIN = {
  winners: 797,
  cohorts: 58,
  site: 'https://evwinners.org',
  repo: 'https://github.com/nqureshi/ev-winners',
  author: 'https://nabeelqu.co',
}

export const THOTHICA = 'https://thothica.com'
/** Adnan's own grantee row, so the about section can point at it. */
export const ADNAN_ID = 1070
