'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GrantRow from './GrantRow'
import { FACETS, type Gazetteer, type Grant } from '../lib/types'
import { nameScore } from '../lib/format'

const PAGE = 25
type Selected = Record<string, string[]>

/**
 * Search and browse. Every grant is already in the browser, so facets and
 * name matching are instant; only the semantic ranking needs the Worker.
 */
export default function Explorer({ data }: { data: Gazetteer }) {
  const [term, setTerm] = useState('')
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState<Selected>({})
  const [ranked, setRanked] = useState<{ id: number; score: number }[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const byId = useMemo(() => new Map(data.grants.map((g) => [g.id, g])), [data.grants])
  const peopleByKey = useMemo(() => new Map(data.people.map((p) => [p.key, p])), [data.people])

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

  /** A grant must satisfy every chosen facet, and any value within one facet. */
  const matchesFacets = useCallback(
    (g: Grant) =>
      Object.entries(sel).every(([facet, values]) => {
        if (!values.length) return true
        const has = (v: string) => {
          if (facet === 'field') return g.fields.includes(v)
          if (facet === 'output') return g.outputs.includes(v)
          if (facet === 'topic') return g.topics.includes(v)
          if (facet === 'purpose') return g.purpose === v
          if (facet === 'stage') return g.stage === v
          if (facet === 'series') return g.series === v
          if (facet === 'tranche') return g.tranche === v
          if (facet === 'country') return g.country === v
          return false
        }
        return values.some(has)
      }),
    [sel]
  )

  const list = useMemo(() => {
    const pool = data.grants.filter(matchesFacets)
    if (query.length < 2) return pool.map((g) => ({ grant: g, score: undefined as number | undefined }))

    const out: { grant: Grant; score?: number }[] = []
    const used = new Set<number>()
    for (const g of pool) {
      if (nameScore(g.name, query) >= 2) {
        out.push({ grant: g, score: undefined })
        used.add(g.id)
      }
    }
    if (ranked) {
      for (const r of ranked) {
        if (used.has(r.id)) continue
        const g = byId.get(r.id)
        if (!g || !matchesFacets(g)) continue
        out.push({ grant: g, score: r.score })
        used.add(r.id)
      }
    }
    return out
  }, [data.grants, matchesFacets, query, ranked, byId])

  /** Facet counts reflect the other chosen facets, so nothing dead-ends. */
  const liveCounts = useMemo(() => {
    const counts: Record<string, Map<string, number>> = {}
    for (const { key } of FACETS) counts[key] = new Map()
    for (const g of data.grants) {
      for (const { key } of FACETS) {
        const others = Object.fromEntries(Object.entries(sel).filter(([k]) => k !== key))
        const ok = Object.entries(others).every(([facet, values]) =>
          values.some((v) =>
            facet === 'field' ? g.fields.includes(v)
            : facet === 'output' ? g.outputs.includes(v)
            : facet === 'topic' ? g.topics.includes(v)
            : facet === 'purpose' ? g.purpose === v
            : facet === 'stage' ? g.stage === v
            : facet === 'series' ? g.series === v
            : facet === 'tranche' ? g.tranche === v
            : facet === 'country' ? g.country === v
            : false
          )
        )
        if (!ok) continue
        const vals =
          key === 'field' ? g.fields
          : key === 'output' ? g.outputs
          : key === 'topic' ? g.topics
          : key === 'purpose' ? [g.purpose]
          : key === 'stage' ? [g.stage]
          : key === 'series' ? [g.series]
          : key === 'tranche' ? (g.tranche ? [g.tranche] : [])
          : g.country ? [g.country] : []
        for (const v of vals) counts[key].set(v, (counts[key].get(v) ?? 0) + 1)
      }
    }
    return counts
  }, [data.grants, sel])

  const applied = Object.entries(sel).flatMap(([facet, values]) => values.map((v) => ({ facet, value: v })))
  const searching = query.length >= 2
  const visible = list.slice(0, shown)
  const labelOf = (facet: string, id: string) =>
    data.facets[facet]?.find((f) => f.id === id)?.label ?? id

  return (
    <>
      <section className="search" aria-labelledby="s-h">
        <div className="shell">
          <p className="eyebrow" id="s-h">Search {data.grants.length.toLocaleString('en-GB')} grants</p>
          <div className="search__field" style={{ marginTop: 'var(--s3)' }}>
            <input
              ref={inputRef}
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="AI, or archives, or a name"
              aria-label="Search grants by topic or name"
              autoComplete="off"
              spellCheck={false}
            />
            {term && (
              <button className="search__btn" onClick={() => setTerm('')} type="button">
                Clear
              </button>
            )}
          </div>
          <div className="search__hint">
            <span>Meaning, not keywords. The tags are searched too, so short queries work.</span>
            <span>
              Press <kbd>/</kbd> to search
            </span>
          </div>
        </div>
      </section>

      <section className="results" id="grants" aria-live="polite" aria-busy={loading}>
        <div className="shell layout">
          <aside className="facets" aria-label="Filters">
            {FACETS.map(({ key, label, initial }) => {
              const values = (data.facets[key] ?? [])
                .map((f) => ({ ...f, count: liveCounts[key].get(f.id) ?? 0 }))
                .filter((f) => f.count > 0 || (sel[key] ?? []).includes(f.id))
              if (!values.length) return null
              const isOpen = open[key] ?? false
              const list = isOpen ? values : values.slice(0, initial)
              return (
                <div className="facet" key={key}>
                  <div className="facet__head">
                    <h3>{label}</h3>
                    <span>{values.length}</span>
                  </div>
                  <ul>
                    {list.map((f) => (
                      <li key={f.id}>
                        <button
                          type="button"
                          aria-pressed={(sel[key] ?? []).includes(f.id)}
                          onClick={() => toggle(key, f.id)}
                        >
                          <b>{f.label}</b>
                          <i>{f.count}</i>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {values.length > initial && (
                    <button className="facet__more" type="button" onClick={() => setOpen((o) => ({ ...o, [key]: !isOpen }))}>
                      {isOpen ? 'Fewer' : `All ${values.length}`}
                    </button>
                  )}
                </div>
              )
            })}
          </aside>

          <div>
            {applied.length > 0 && (
              <div className="applied">
                {applied.map(({ facet, value }) => (
                  <button key={`${facet}:${value}`} className="applied__tag" type="button" onClick={() => toggle(facet, value)}>
                    <em>{labelOf(facet, value)}</em> ×
                  </button>
                ))}
                <button className="applied__tag" type="button" onClick={clearAll}>
                  Clear all
                </button>
              </div>
            )}

            <div className="results__bar">
              <span>
                <strong className="num">{list.length.toLocaleString('en-GB')}</strong>{' '}
                {list.length === 1 ? 'grant' : 'grants'}
                {searching && ` for "${query}"`}
              </span>
              <span>{loading ? 'Ranking by meaning' : searching ? 'Closest first' : 'Newest first'}</span>
            </div>

            {failed && (
              <div className="empty">
                <p>The search service did not answer. The list below is unranked.</p>
              </div>
            )}

            {list.length === 0 ? (
              <div className="empty">
                <p className="narration" style={{ margin: '0 auto var(--s4)' }}>Nothing matches all of that.</p>
                <button className="more" type="button" onClick={clearAll} style={{ maxWidth: 260, margin: '0 auto' }}>
                  Clear the filters
                </button>
              </div>
            ) : (
              <>
                <ul className="rowlist">
                  {visible.map(({ grant, score }) => {
                    const person = grant.people.map((k) => peopleByKey.get(k)).find((p) => p?.repeat)
                    const others = person
                      ? person.grants.filter((id) => id !== grant.id).map((id) => byId.get(id)!).filter(Boolean)
                      : []
                    return (
                      <GrantRow
                        key={grant.id}
                        grant={grant}
                        score={score}
                        vocab={data.vocab}
                        person={person}
                        otherGrants={others}
                        onTag={toggle}
                      />
                    )
                  })}
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
    </>
  )
}
