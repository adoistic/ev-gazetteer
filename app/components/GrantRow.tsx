'use client'

import type { Grant, Person, Gazetteer } from '../lib/types'
import { formatDate, href } from '../lib/format'

/**
 * One grant, in four lines: who, what, and a single meta line of facts.
 *
 * The facts are clickable, so a row doubles as a way to browse, but they are
 * set as plain text separated by middots rather than as boxes. Eight bordered
 * tags per row turned the list into noise and competed with the name.
 */
export default function GrantRow({
  grant,
  score,
  vocab,
  person,
  onTag,
}: {
  grant: Grant
  score?: number
  vocab: Gazetteer['vocab']
  person?: Person
  onTag: (facet: string, value: string) => void
}) {
  const post = href(grant.link)
  const date = formatDate(grant.date)

  // At most five facts, chosen so every row reads the same way: what field,
  // what they made, who they were, where. Anything rarer stays out of the list.
  const facts: { key: string; facet?: string; value?: string; label: string; primary?: boolean }[] = []
  for (const f of grant.fields) {
    facts.push({ key: `f${f}`, facet: 'field', value: f, label: vocab.field[f], primary: true })
  }
  if (grant.outputs[0]) {
    facts.push({ key: `o${grant.outputs[0]}`, facet: 'output', value: grant.outputs[0], label: vocab.output[grant.outputs[0]] })
  }
  facts.push({
    key: 'stage',
    facet: 'stage',
    value: grant.stage,
    label: grant.age ? `${vocab.stage[grant.stage]}, ${grant.age}` : vocab.stage[grant.stage],
  })
  if (grant.country) {
    facts.push({ key: 'country', facet: 'country', value: grant.country, label: grant.country })
  }

  return (
    <li className="g" id={`grant-${grant.id}`}>
      <div className="g__top">
        <h3 className="g__name">{grant.name}</h3>
        {person?.repeat && <span className="g__repeat">{person.grants.length} grants</span>}
        {typeof score === 'number' && <span className="g__score">{Math.round(score * 100)}</span>}
        <span className="g__where">
          {grant.batch}
          {date && ` · ${date}`}
        </span>
      </div>

      {grant.desc.length > 0 && (
        <p className="g__desc">
          {grant.desc.map((part, i) =>
            part.href ? (
              <a key={i} className="link" href={part.href} target="_blank" rel="noopener noreferrer">
                {part.text}
              </a>
            ) : (
              <span key={i}>{part.text}</span>
            )
          )}
        </p>
      )}

      <div className="g__meta">
        {facts.map((f) => (
          <button
            key={f.key}
            type="button"
            className={f.primary ? 'is-field' : undefined}
            onClick={() => f.facet && f.value && onTag(f.facet, f.value)}
          >
            {f.label}
          </button>
        ))}
        {grant.org && <span>{grant.org}</span>}
      </div>

      {(post || grant.links.length > 0) && (
        <div className="g__links">
          {post && (
            <a className="link" href={post} target="_blank" rel="noopener noreferrer">
              Announcement post
            </a>
          )}
          {/* Links the post carried whose words are not in the description. */}
          {grant.links.map((l) => (
            <a key={l.href} className="link" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.text}
            </a>
          ))}
        </div>
      )}
    </li>
  )
}
