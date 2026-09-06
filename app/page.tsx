import Masthead from './components/Masthead'
import ProgrammeDiagram from './components/ProgrammeDiagram'
import Explorer from './components/Explorer'
import Credit from './components/Credit'
import About from './components/About'
import Footer from './components/Footer'
import type { Gazetteer } from './lib/types'
import raw from './data/gazetteer.json'

const data = raw as unknown as Gazetteer

export default function Page() {
  const dates = data.grants.map((g) => g.date).filter(Boolean) as string[]
  const earliest = dates.reduce((a, b) => (a < b ? a : b))
  const latest = data.updated
  const repeat = data.people.filter((p) => p.repeat).length
  const countries = data.facets.country.length

  return (
    <>
      <Masthead />
      <main>
        <section className="hero inverse">
          <div className="shell hero__grid">
            <div>
              <p className="eyebrow">Emergent Ventures</p>
              <h1>
                Every winner, <em>classified</em>
              </h1>
            </div>
            <div>
              <p className="narration">
                Every grant read and tagged, so a search for a subject
                finds the people working on it.
              </p>
            </div>
          </div>

          <div className="shell stats-wrap">
            <dl className="stats">
              <div className="stat">
                <dt>Grants</dt>
                <dd className="num">{data.grants.length.toLocaleString('en-GB')}</dd>
              </div>
              <div className="stat">
                <dt>People</dt>
                <dd className="num">{data.people.length.toLocaleString('en-GB')}</dd>
              </div>
              <div className="stat">
                <dt>Countries</dt>
                <dd className="num">{countries}</dd>
              </div>
              <div className="stat">
                <dt>Announced</dt>
                <dd className="num range">
                  {earliest.slice(0, 4)} to {latest.slice(0, 4)}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <Explorer data={data} />

        <ProgrammeDiagram
          series={data.facets.series}
          tranches={data.facets.tranche}
          total={data.grants.length}
        />

        <Credit grants={data.grants.length} />
        <About data={data} />
      </main>
      <Footer updated={latest} />
      <p className="sr-note">
        {repeat} people hold more than one grant.
      </p>
    </>
  )
}
