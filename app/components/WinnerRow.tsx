import { ADNAN_ID, type Winner } from '../lib/types'
import { formatDate, href, linkLabel } from '../lib/format'

/** One grantee. Name, what they are doing, and where it was announced. */
export default function WinnerRow({ winner, score }: { winner: Winner; score?: number }) {
  const post = href(winner.link)
  const date = formatDate(winner.date)
  const extra = [...winner.project_links, ...winner.personal_links].slice(0, 3)

  return (
    <li className="row" id={`grantee-${winner.id}`}>
      <div>
        <h3 className="row__name">
          {winner.name}
          {winner.id === ADNAN_ID && <span className="row__self" style={{ marginLeft: 'var(--s3)' }}>Built this site</span>}
        </h3>
        {winner.description && <p className="row__desc">{winner.description}</p>}
        <div className="row__links">
          {post && (
            <a className="link" href={post} target="_blank" rel="noopener noreferrer">
              Announcement post
            </a>
          )}
          {extra.map((l) => (
            <a className="link" key={l} href={href(l) as string} target="_blank" rel="noopener noreferrer">
              {linkLabel(l)}
            </a>
          ))}
        </div>
      </div>

      <div className="row__meta">
        <dl>
          <dt>Cohort</dt>
          <dd>{winner.batch}</dd>
          {date && (
            <>
              <dt>Announced</dt>
              <dd>{date}</dd>
            </>
          )}
          {winner.type && (
            <>
              <dt>Kind</dt>
              <dd>{winner.type}</dd>
            </>
          )}
          {winner.career_stage && (
            <>
              <dt>Stage</dt>
              <dd>{winner.career_stage}</dd>
            </>
          )}
          {typeof score === 'number' && (
            <>
              <dt>Match</dt>
              <dd>
                <span className="row__score num">{Math.round(score * 100)}</span>
              </dd>
            </>
          )}
        </dl>
      </div>
    </li>
  )
}
