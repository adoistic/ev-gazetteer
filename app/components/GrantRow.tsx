'use client'

import type { Grant, Person, Gazetteer } from '../lib/types'
import { formatDate, href, linkLabel } from '../lib/format'

/** One grant. The tags are clickable, so a row is also a way to browse. */
export default function GrantRow({
  grant,
  score,
  vocab,
  person,
  otherGrants,
  onTag,
}: {
  grant: Grant
  score?: number
  vocab: Gazetteer['vocab']
  person?: Person
  otherGrants: Grant[]
  onTag: (facet: string, value: string) => void
}) {
  const post = href(grant.link)
  const date = formatDate(grant.date)
  const extra = [...grant.project_links, ...grant.personal_links].slice(0, 2)

  return (
    <li className="row" id={`grant-${grant.id}`}>
      <div>
        <h3 className="row__name">
          {grant.name}
          {person?.repeat && (
            <span className="repeat" style={{ marginLeft: 'var(--s3)' }}>
              {person.grants.length} grants
            </span>
          )}
        </h3>

        {grant.description && <p className="row__desc">{grant.description}</p>}

        <div className="grant__tags">
          {grant.fields.map((f) => (
            <button key={f} type="button" className="tag tag--solid" onClick={() => onTag('field', f)}>
              {vocab.field[f]}
            </button>
          ))}
          {grant.outputs.map((o) => (
            <button key={o} type="button" className="tag" onClick={() => onTag('output', o)}>
              {vocab.output[o]}
            </button>
          ))}
          {grant.topics.slice(0, 4).map((t) => (
            <button key={t} type="button" className="tag" onClick={() => onTag('topic', t)}>
              {t}
            </button>
          ))}
        </div>

        {otherGrants.length > 0 && (
          <p className="grant__other">
            Also funded for{' '}
            {otherGrants.map((g, i) => (
              <span key={g.id}>
                {i > 0 && ', '}
                <a className="link" href={`#grant-${g.id}`}>
                  {g.batch}
                </a>
              </span>
            ))}
            .
          </p>
        )}

        {grant.team && <p className="grant__other">Part of the {grant.team} team.</p>}

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
          <dd>{grant.batch}</dd>
          {date && (
            <>
              <dt>Announced</dt>
              <dd>{date}</dd>
            </>
          )}
          {grant.country && (
            <>
              <dt>Based</dt>
              <dd>{grant.country}</dd>
            </>
          )}
          {grant.origin && (
            <>
              <dt>From</dt>
              <dd>{grant.origin}</dd>
            </>
          )}
          <dt>Stage</dt>
          <dd>
            {vocab.stage[grant.stage]}
            {grant.age ? `, ${grant.age}` : ''}
          </dd>
          <dt>Grant</dt>
          <dd>{vocab.purpose[grant.purpose]}</dd>
          {grant.org && (
            <>
              <dt>Project</dt>
              <dd>{grant.org}</dd>
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
