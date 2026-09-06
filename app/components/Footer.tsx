import { ADDED_HERE, NABEEL, THOTHICA } from '../lib/types'
import { formatLongDate } from '../lib/format'

export default function Footer({ updated }: { updated: string }) {
  return (
    <footer className="foot inverse">
      <div className="shell">
        <div className="foot__grid">
          <div>
            <p className="foot__built">
              Built by <b>Adnan</b>, Founder and CEO, Thothica.
            </p>
            <p className="foot__note">
              Extending{' '}
              <a className="link" href={NABEEL.site} target="_blank" rel="noopener noreferrer">
                {NABEEL.name}&rsquo;s Emergent Ventures Winners
              </a>
              . He built the original site and collected most of the entries. I added {ADDED_HERE} of them,
              the tags, and the links recovered from the announcement posts.
            </p>
          </div>

          <div className="foot__meta">
            <span><a className="link" href={NABEEL.site} target="_blank" rel="noopener noreferrer">evwinners.org</a></span>
            <span><a className="link" href={NABEEL.repo} target="_blank" rel="noopener noreferrer">Source data on GitHub</a></span>
            <span><a className="link" href="https://github.com/adoistic/ev-gazetteer" target="_blank" rel="noopener noreferrer">This site on GitHub</a></span>
            <span><a className="link" href={THOTHICA} target="_blank" rel="noopener noreferrer">thothica.com</a></span>
            <span className="num">Updated {formatLongDate(updated)}</span>
          </div>
        </div>

        <div className="foot__base">
          <span>Not affiliated with Emergent Ventures or the Mercatus Center.</span>
          <span>Descriptions are quoted from the announcement posts. The tags are mine.</span>
        </div>
      </div>
    </footer>
  )
}
