'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import WinnerRow from './WinnerRow'
import { PROGRAMMES, type ProgrammeId, type Winner } from '../lib/types'
import { nameScore } from '../lib/format'

const PAGE = 30

type Ranked = { id: number; score: number }

/**
 * Search and filtering. Every record is already in the browser, so programme
 * filters and name matching are instant. Only the semantic ranking needs the
 * Worker, and while it is in flight the local name matches already show.
 */
export default function Explorer({ winners }: { winners: Winner[] }) {
  const [term, setTerm] = useState('')
  const [query, setQuery] = useState('')
  const [programme, setProgramme] = useState<ProgrammeId | null>(null)
  const [ranked, setRanked] = useState<Ranked[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const inputRef = useRef<HTMLInputElement>(null)

  const byId = useMemo(() => new Map(winners.map((w) => [w.id, w])), [winners])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const w of winners) c[w.programme] = (c[w.programme] ?? 0) + 1
    return c
  }, [winners])

  // Press / anywhere to reach the search field.
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

  // Debounce the typed term into the committed query.
  useEffect(() => {
    const id = setTimeout(() => setQuery(term.trim()), 260)
    return () => clearTimeout(id)
  }, [term])

  // Ask the Worker to rank. Aborts a request the user has already typed past.
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

  const retry = useCallback(() => setQuery((q) => `${q}`), [])

  /**
   * Order: exact-ish name matches first, then the semantic ranking. Without a
   * query, the natural order (newest tranche first) stands.
   */
  const list = useMemo(() => {
    const pool = programme ? winners.filter((w) => w.programme === programme) : winners
    if (query.length < 2) return pool.map((w) => ({ winner: w, score: undefined as number | undefined }))

    const names = new Map<number, number>()
    for (const w of pool) {
      const s = nameScore(w.name, query)
      if (s >= 2) names.set(w.id, s)
    }

    const out: { winner: Winner; score?: number }[] = []
    const used = new Set<number>()
    for (const [id] of [...names.entries()].sort((a, b) => b[1] - a[1])) {
      const w = byId.get(id)
      if (w) {
        out.push({ winner: w, score: undefined })
        used.add(id)
      }
    }
    if (ranked) {
      for (const r of ranked) {
        if (used.has(r.id)) continue
        const w = byId.get(r.id)
        if (!w) continue
        if (programme && w.programme !== programme) continue
        out.push({ winner: w, score: r.score })
        used.add(r.id)
      }
    }
    return out
  }, [winners, programme, query, ranked, byId])

  const searching = query.length >= 2
  const visible = list.slice(0, shown)

  return (
    <>
      <section className="search" aria-labelledby="s-h">
        <div className="shell">
          <p className="eyebrow" id="s-h">Search {winners.length} grantees</p>
          <div className="search__field" style={{ marginTop: 'var(--s3)' }}>
            <input
              ref={inputRef}
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="biotech in Bangalore, or a name"
              aria-label="Search grantees by topic or name"
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
            <span>
              Meaning, not keywords. Try climate, or archives, or teaching physics.
            </span>
            <span>
              Press <kbd>/</kbd> to search
            </span>
          </div>

          <div className="chips" role="group" aria-label="Filter by programme">
            <button
              type="button"
              className="chip"
              aria-pressed={programme === null}
              onClick={() => { setProgramme(null); setShown(PAGE) }}
            >
              All <span className="c num">{winners.length}</span>
            </button>
            {PROGRAMMES.map((p) => (
              <button
                key={p.id}
                type="button"
                className="chip"
                aria-pressed={programme === p.id}
                onClick={() => { setProgramme(programme === p.id ? null : p.id); setShown(PAGE) }}
              >
                {p.label} <span className="c num">{counts[p.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="results" id="grantees" aria-live="polite" aria-busy={loading}>
        <div className="shell">
          <div className="results__bar">
            <span>
              <strong className="num">{list.length}</strong>{' '}
              {list.length === 1 ? 'grantee' : 'grantees'}
              {programme && ` in ${PROGRAMMES.find((p) => p.id === programme)?.label}`}
              {searching && ` for "${query}"`}
            </span>
            <span>
              {loading ? 'Ranking by meaning' : searching ? 'Closest first' : 'Newest tranche first'}
            </span>
          </div>

          {failed && (
            <div className="empty">
              <p>The search service did not answer. The list below is unranked.</p>
              <button className="more" type="button" onClick={retry} style={{ maxWidth: 260, margin: '0 auto' }}>
                Try again
              </button>
            </div>
          )}

          {list.length === 0 ? (
            <div className="empty">
              <p className="narration" style={{ margin: '0 auto var(--s4)' }}>
                Nothing here matches that.
              </p>
              <p>Try a broader idea, or clear the programme filter.</p>
            </div>
          ) : (
            <>
              <ul className="rowlist">
                {visible.map(({ winner, score }) => (
                  <WinnerRow key={winner.id} winner={winner} score={score} />
                ))}
              </ul>
              {shown < list.length && (
                <button className="more" type="button" onClick={() => setShown((s) => s + PAGE * 2)}>
                  Show more, {list.length - shown} remaining
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
