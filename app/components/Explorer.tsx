'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GrantRow from './GrantRow'
import type { FacetValue, Gazetteer, Grant } from '../lib/types'
import { nameScore } from '../lib/format'

const PAGE = 25
const FIELDS_SHOWN = 8

/**
 * Groups behind the Refine disclosure. Field is deliberately not here: it is
 * the one axis worth showing without being asked for, so it sits above as
 * chips. Series and tranche are one question, "which part of the programme",
 * and are merged rather than presented as two lists.
 */
const GROUPS = [
  { key: 'programme', label: 'Programme', initial: 6, sort: 'count' },
  // Cohorts stay in programme order. Someone wants "India 15" or "58", and
  // hunting for it in a list ranked by size is the wrong way round.
  { key: 'cohort', label: 'Cohort', initial: 8, sort: 'fixed' },
  { key: 'output', label: 'What they made', initial: 6, sort: 'count' },
  { key: 'stage', label: 'Who they were', initial: 6, sort: 'count' },
  { key: 'purpose', label: 'Kind of grant', initial: 5, sort: 'count' },
  { key: 'country', label: 'Country', initial: 6, sort: 'count' },
  { key: 'topic', label: 'Topic', initial: 6, sort: 'count' },
] as const

type Selected = Record<string, string[]>

/** One place that decides whether a grant carries a facet value. */
function has(g: Grant, facet: string, v: string): boolean {
  switch (facet) {
    case 'field': return g.fields.includes(v)
    case 'output': return g.outputs.includes(v)
    case 'topic': return g.topics.includes(v)
    case 'purpose': return g.purpose === v
    case 'stage': return g.stage === v
    case 'country': return g.country === v
    case 'programme': return g.series === v || g.tranche === v
    case 'cohort': return g.batch === v
    default: return false
  }
}

function valuesOf(g: Grant, facet: string): string[] {
  switch (facet) {
    case 'field': return g.fields
    case 'output': return g.outputs
    case 'topic': return g.topics
    case 'purpose': return [g.purpose]
    case 'stage': return [g.stage]
    case 'country': return g.country ? [g.country] : []
    case 'programme': return [g.series, ...(g.tranche ? [g.tranche] : [])]
    case 'cohort': return [g.batch]
    default: return []
  }
}

export default function Explorer({ data }: { data: Gazetteer }) {
  const [term, setTerm] = useState('')
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState<Selected>({})
  const [ranked, setRanked] = useState<{ id: number; score: number }[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const [refineOpen, setRefineOpen] = useState(false)
  const [allFields, setAllFields] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const byId = useMemo(() => new Map(data.grants.map((g) => [g.id, g])), [data.grants])
  const peopleByKey = useMemo(() => new Map(data.people.map((p) => [p.key, p])), [data.people])

  /** Programme is a merged facet, so its values are assembled here. */
  const catalogue: Record<string, FacetValue[]> = useMemo(
    () => ({ ...data.facets, programme: [...data.facets.series, ...data.facets.tranche] }),
    [data.facets]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing = t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && typing) inputRef.current?.blur()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setQuery(term.trim()), 260)
    return () => clearTimeout(id)
  }, [term])

  useEffect(() => {
    setShown(PAGE)
    if (query.length < 2) {
      setRanked(null)
      setLoading(false)
      setFailed(false)
      return
    }
    const ac = new AbortController()
    setLoading(true)
    setFailed(false)
    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        setRanked(Array.isArray(d.results) ? d.results : [])
        setLoading(false)
      })
      .catch((e) => {
        if (e.name === 'AbortError') return
        setFailed(true)
        setLoading(false)
      })
    return () => ac.abort()
  }, [query])

  const toggle = useCallback((facet: string, value: string) => {
    setShown(PAGE)
    setSel((s) => {
      const have = s[facet] ?? []
      const next = have.includes(value) ? have.filter((v) => v !== value) : [...have, value]
      const out = { ...s, [facet]: next }
      if (!next.length) delete out[facet]
      return out
    })
  }, [])

  const clearAll = useCallback(() => {
    setSel({})
    setTerm('')
    setShown(PAGE)
  }, [])

  const passes = useCallback(
    (g: Grant, skip?: string) =>
      Object.entries(sel).every(([facet, values]) =>
        facet === skip || !values.length ? true : values.some((v) => has(g, facet, v))
      ),
    [sel]
  )

  const list = useMemo(() => {
    const pool = data.grants.filter((g) => passes(g))
    if (query.length < 2) return pool.map((g) => ({ grant: g, score: undefined as number | undefined }))

    const out: { grant: Grant; score?: number }[] = []
    const used = new Set<number>()
    for (const g of pool) {
      if (nameScore(g.name, query) >= 2) {
        out.push({ grant: g })
        used.add(g.id)
      }
    }
    if (ranked) {
      for (const r of ranked) {
        if (used.has(r.id)) continue
        const g = byId.get(r.id)
        if (!g || !passes(g)) continue
        out.push({ grant: g, score: r.score })
        used.add(r.id)
      }
    }
    return out
  }, [data.grants, passes, query, ranked, byId])

  /** Counts reflect every other chosen facet, so a value never leads nowhere. */
  const counts = useMemo(() => {
    const out: Record<string, Map<string, number>> = {}
    const facets = ['field', ...GROUPS.map((g) => g.key)]
    for (const f of facets) out[f] = new Map()
    for (const g of data.grants) {
      for (const f of facets) {
        if (!passes(g, f)) continue
        for (const v of valuesOf(g, f)) out[f].set(v, (out[f].get(v) ?? 0) + 1)
      }
    }
    return out
  }, [data.grants, passes])

  const live = (facet: string, sort: string = 'count') => {
    const rows = (catalogue[facet] ?? [])
      .map((f) => ({ ...f, count: counts[facet]?.get(f.id) ?? 0 }))
      .filter((f) => f.count > 0 || (sel[facet] ?? []).includes(f.id))
    // 'fixed' keeps the order the build step chose.
    return sort === 'fixed' ? rows : rows.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }

  const fields = live('field')
  const shownFields = allFields ? fields : fields.slice(0, FIELDS_SHOWN)
  const active = Object.entries(sel).flatMap(([facet, vs]) => vs.map((v) => ({ facet, value: v })))
  const labelOf = (facet: string, id: string) => catalogue[facet]?.find((f) => f.id === id)?.label ?? id
  const refineCount = active.filter((a) => a.facet !== 'field').length
  const searching = query.length >= 2
  const visible = list.slice(0, shown)

  return (
    <section className="tool" id="grants" aria-live="polite" aria-busy={loading}>
      <div className="tool__in tool__grid">
        <div className="controls">
        <div className="find">
          <input
            ref={inputRef}
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search 1,266 grants"
            aria-label="Search grants by topic or name"
            autoComplete="off"
            spellCheck={false}
          />
          {term && (
            <button type="button" onClick={() => setTerm('')}>
              Clear
            </button>
          )}
        </div>
        <div className="hint">
          <span>Type a name, a subject, or a place. The search matches meaning, so &ldquo;archives&rdquo; finds work on digital preservation.</span>
          <span>
            Press <kbd>/</kbd> to search
          </span>
        </div>

        <div className="axis">
          <p className="axis__label">Browse by field</p>
          <div className="chips" role="group" aria-label="Filter by field">
            {shownFields.map((f) => (
              <button
                key={f.id}
                type="button"
                className="chip"
                aria-pressed={(sel.field ?? []).includes(f.id)}
                onClick={() => toggle('field', f.id)}
              >
                {f.label} <i>{f.count}</i>
              </button>
            ))}
            {fields.length > FIELDS_SHOWN && (
              <button type="button" className="chip" onClick={() => setAllFields((v) => !v)}>
                {allFields ? 'Fewer' : `All ${fields.length} fields`}
              </button>
            )}
          </div>
        </div>

        <div className="refine">
          <button
            className="refine__toggle"
            type="button"
            aria-expanded={refineOpen}
            aria-controls="refine-body"
            onClick={() => setRefineOpen((v) => !v)}
          >
            <span aria-hidden="true">{refineOpen ? '−' : '+'}</span>
            Refine{refineCount > 0 ? ` (${refineCount})` : ''}
          </button>

          {/* Always rendered. Below the sidebar breakpoint CSS hides it behind
              the toggle; in the sidebar there is room, so it simply shows. */}
          <div className={refineOpen ? 'refine__body' : 'refine__body is-closed'} id="refine-body">
              {GROUPS.map(({ key, label, initial, sort }) => {
                const values = live(key, sort)
                if (!values.length) return null
                const open = expanded[key] ?? false
                const rows = open ? values : values.slice(0, initial)
                const groupOpen = openGroups[key] ?? false
                return (
                  <div className={groupOpen ? 'group' : 'group is-collapsed'} key={key}>
                    {/* A button on a phone, where each group collapses to keep the
                        panel short. Inert above 700px, where the columns fit. */}
                    <h3>
                      <button
                        type="button"
                        aria-expanded={groupOpen}
                        onClick={() => setOpenGroups((o) => ({ ...o, [key]: !groupOpen }))}
                      >
                        {label}
                        <span aria-hidden="true">{groupOpen ? '−' : '+'}</span>
                      </button>
                    </h3>
                    <ul>
                      {rows.map((f) => (
                        <li key={f.id}>
                          <button
                            type="button"
                            aria-pressed={(sel[key] ?? []).includes(f.id)}
                            onClick={() => toggle(key, f.id)}
                          >
                            <span>{f.label}</span>
                            <i>{f.count}</i>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {values.length > initial && (
                      <button
                        className="group__more"
                        type="button"
                        onClick={() => setExpanded((e) => ({ ...e, [key]: !open }))}
                      >
                        {open ? 'Fewer' : `All ${values.length}`}
                      </button>
                    )}
                  </div>
                )
              })}
          </div>
        </div>

        </div>

        <div className="results">
        <div className="state">
          <span className="state__count">
            <strong>{list.length.toLocaleString('en-GB')}</strong>{' '}
            {list.length === 1 ? 'grant' : 'grants'}
            {loading ? ', ranking' : searching ? ', closest first' : ''}
          </span>
          {active.map(({ facet, value }) => (
            <button key={`${facet}:${value}`} className="pill" type="button" onClick={() => toggle(facet, value)}>
              <b>{labelOf(facet, value)}</b> ×
            </button>
          ))}
          {(active.length > 0 || term) && (
            <button className="pill" type="button" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>

        {failed && (
          <div className="empty">
            <p>The search service did not answer. The list below is unranked.</p>
          </div>
        )}

        {list.length === 0 ? (
          <div className="empty">
            <p className="narration" style={{ margin: '0 auto var(--s4)' }}>Nothing matches all of that.</p>
            <button className="more" type="button" onClick={clearAll} style={{ maxWidth: 240, margin: '0 auto' }}>
              Start again
            </button>
          </div>
        ) : (
          <>
            <ul className="grants">
              {visible.map(({ grant, score }) => (
                <GrantRow
                  key={grant.id}
                  grant={grant}
                  score={score}
                  vocab={data.vocab}
                  person={grant.people.map((k) => peopleByKey.get(k)).find((p) => p?.repeat)}
                  onTag={toggle}
                />
              ))}
            </ul>
            {shown < list.length && (
              <button className="more" type="button" onClick={() => setShown((s) => s + PAGE * 2)}>
                Show more, {(list.length - shown).toLocaleString('en-GB')} remaining
              </button>
            )}
          </>
        )}
        </div>
      </div>
    </section>
  )
}
