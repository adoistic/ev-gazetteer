import { NABEEL } from '../lib/types'

/** Nabeel's site is the origin of this one. Say so where nobody can miss it. */
export default function Credit({ grants }: { grants: number }) {
  return (
    <section className="band inverse">
      <div className="shell band__grid">
        <div>
          <p className="eyebrow">Built on</p>
          <h2 style={{ marginTop: 'var(--s3)' }}>Nabeel Qureshi&rsquo;s Emergent Ventures Winners</h2>
          <p>
            He collected all {grants.toLocaleString('en-GB')} grantees and their announcement posts, and built the
            semantic search that made them findable. This site takes that dataset and adds a layer on top: every
            grant read and classified by field, by what was made, by where and by whom, with repeat winners
            resolved into one person. Corrections belong upstream in his repository, so both sites improve.
          </p>
        </div>
        <a className="bigbtn" href={NABEEL.site} target="_blank" rel="noopener noreferrer">
          evwinners.org
        </a>
      </div>
    </section>
  )
}
