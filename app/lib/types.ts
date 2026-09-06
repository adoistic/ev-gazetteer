export type Grant = {
  id: number
  name: string
  batch: string
  series: string
  tranche: string | null
  date: string | null
  link: string | null
  description: string | null
  personal_info: string | null
  personal_links: string[]
  project_links: string[]
  fields: string[]
  topics: string[]
  outputs: string[]
  purpose: string
  country: string | null
  origin: string | null
  stage: string
  age: number | null
  org: string | null
  people: string[]
  team: string | null
}

export type Person = {
  key: string
  name: string
  grants: number[]
  repeat: boolean
  mergeNote: string | null
  jointNotes: string[]
}

export type FacetValue = { id: string; label: string; count: number }

export type Gazetteer = {
  grants: Grant[]
  people: Person[]
  uncertain: { ids: number[]; names: string[]; note: string }[]
  facets: Record<string, FacetValue[]>
  vocab: { field: Record<string, string>; output: Record<string, string>; purpose: Record<string, string>; stage: Record<string, string> }
  series: { id: string; label: string }[]
  tranches: { id: string; label: string }[]
  updated: string
}

/** The facets offered in the interface, in the order they appear. */
export const FACETS = [
  { key: 'field', label: 'Field', initial: 10 },
  { key: 'output', label: 'What they made', initial: 8 },
  { key: 'purpose', label: 'Kind of grant', initial: 5 },
  { key: 'stage', label: 'Stage', initial: 6 },
  { key: 'series', label: 'Series', initial: 5 },
  { key: 'tranche', label: 'Tranche', initial: 4 },
  { key: 'country', label: 'Country', initial: 10 },
  { key: 'topic', label: 'Topic', initial: 10 },
] as const

export const NABEEL = {
  site: 'https://evwinners.org',
  repo: 'https://github.com/nqureshi/ev-winners',
  home: 'https://nabeelqu.co',
  name: 'Nabeel S. Qureshi',
}

export const THOTHICA = 'https://thothica.com'
export const ADNAN_ID = 1070
