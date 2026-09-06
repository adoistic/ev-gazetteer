import Masthead from './components/Masthead'
import ProgrammeDiagram from './components/ProgrammeDiagram'
import Explorer from './components/Explorer'
import Elsewhere from './components/Elsewhere'
import About from './components/About'
import Footer from './components/Footer'
import { ADNAN_ID, PROGRAMMES, type ProgrammeId, type Winner } from './lib/types'
import { formatLongDate } from './lib/format'
import data from './data/winners.json'

const winners = data as Winner[]

export default function Page() {
  const counts = Object.fromEntries(
    PROGRAMMES.map((p) => [p.id, winners.filter((w) => w.programme === p.id).length])
  ) as Record<ProgrammeId, number>

  const dates = winners.map((w) => w.date).filter(Boolean) as string[]
  const latest = dates.reduce((a, b) => (a > b ? a : b))
  const earliest = dates.reduce((a, b) => (a < b ? a : b))
  const builder = winners.find((w) => w.id === ADNAN_ID)
  const tranches = new Set(winners.map((w) => w.batch)).size

  return (
    <>
      <Masthead />
      <main>
        <section className="hero">
          <div className="shell hero__grid">
            <div>
              <p className="eyebrow">Emergent Ventures</p>
              <h1>
                The regional and <em>thematic</em> cohorts
              </h1>
            </div>
            <div>
              <p className="narration">
                Four tranches, {winners.length} people, and everything the numbered cohorts leave out.
              </p>
            </div>
          </div>

          <div className="shell" style={{ marginTop: 'var(--s7)' }}>
            <dl className="stats">
              <div className="stat">
                <dt>Grantees</dt>
                <dd className="num">{winners.length}</dd>
              </div>
              <div className="stat">
                <dt>Programmes</dt>
                <dd className="num">{PROGRAMMES.length}</dd>
              </div>
              <div className="stat">
                <dt>Tranches</dt>
                <dd className="num">{tranches}</dd>
              </div>
              <div className="stat">
                <dt>Announced</dt>
                <dd className="num">
                  {earliest.slice(0, 4)} to {latest.slice(0, 4)}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <ProgrammeDiagram counts={counts} />
        <Explorer winners={winners} />
        <Elsewhere />
        <About builder={builder} updated={formatLongDate(latest)} />
      </main>
      <Footer updated={formatLongDate(latest)} />
    </>
  )
}
