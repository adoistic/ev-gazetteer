import { MAIN } from '../lib/types'

/** The main series is not here. Say so plainly and send people to it. */
export default function Elsewhere() {
  return (
    <div className="shell">
      <div className="elsewhere">
        <div>
          <p className="eyebrow">Looking for cohorts 1 to {MAIN.cohorts}?</p>
          <h2 style={{ marginTop: 'var(--s3)' }}>The main series lives at evwinners.org</h2>
          <p>
            Nabeel Qureshi already collects all {MAIN.winners.toLocaleString('en-GB')} grantees of the numbered
            cohorts, with the same kind of search. This site does not duplicate that work. It covers the four
            regional and thematic tranches that sit alongside it.
          </p>
        </div>
        <a className="bigbtn" href={MAIN.site} target="_blank" rel="noopener noreferrer">
          Go to evwinners.org
        </a>
      </div>
    </div>
  )
}
