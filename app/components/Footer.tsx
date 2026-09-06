import { MAIN, THOTHICA } from '../lib/types'

export default function Footer({ updated }: { updated: string | null }) {
  return (
    <footer className="foot">
      <div className="shell">
        <div className="foot__grid">
          <div>
            <a href={THOTHICA} target="_blank" rel="noopener noreferrer">
              <picture>
                <source srcSet="/brand/thothica-logo-white.png" media="(prefers-color-scheme: dark)" />
                <img className="foot__logo" src="/brand/thothica-logo-black.png" alt="Thothica" height={26} />
              </picture>
            </a>
            <p className="foot__built">
              Built by <b>Adnan</b>, Founder and CEO, Thothica.
            </p>
            <p className="foot__note">
              Inspired by{' '}
              <a className="link" href={MAIN.site} target="_blank" rel="noopener noreferrer">
                Nabeel Qureshi&rsquo;s Emergent Ventures Winners
              </a>
              , which covers the numbered cohorts and supplied the data and the idea behind this one.
            </p>
          </div>

          <div className="foot__meta">
            <span>
              <a className="link" href={MAIN.site} target="_blank" rel="noopener noreferrer">evwinners.org</a>
              {' '}for cohorts 1 to {MAIN.cohorts}
            </span>
            <span>
              <a className="link" href={MAIN.repo} target="_blank" rel="noopener noreferrer">Source data on GitHub</a>
            </span>
            <span>
              <a className="link" href={THOTHICA} target="_blank" rel="noopener noreferrer">thothica.com</a>
            </span>
            <span className="num">Updated {updated ?? 'recently'}</span>
          </div>
        </div>

        <div className="foot__base">
          <span>Not affiliated with Emergent Ventures or the Mercatus Center.</span>
          <span>Grantee data from the announcement posts on Marginal Revolution.</span>
        </div>
      </div>
    </footer>
  )
}
