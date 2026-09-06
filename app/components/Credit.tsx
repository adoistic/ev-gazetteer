import { ADDED_HERE, NABEEL } from '../lib/types'

/** Who collected what. The numbers come from the diff against his repository. */
export default function Credit({ grants }: { grants: number }) {
  return (
    <section className="band inverse">
      <div className="shell band__grid">
        <div>
          <p className="eyebrow">Built on</p>
          <h2 style={{ marginTop: 'var(--s3)' }}>Nabeel Qureshi&rsquo;s Emergent Ventures Winners</h2>
          <p>
            Nabeel Qureshi built the original site. He collected the grantees, tracked down their
            announcement posts, and wrote the semantic search that made them findable. His repository
            holds {NABEEL.entries} entries.
          </p>
          <p>
            This one holds {grants.toLocaleString('en-GB')}. I collected the other {ADDED_HERE}: the India
            cohorts 3 to 18, the Africa and Caribbean programme, and the Covid prizes. They are in an open
            pull request to his repository. Corrections to any entry belong there, so both sites get them.
          </p>
        </div>
        <a className="bigbtn" href={NABEEL.site} target="_blank" rel="noopener noreferrer">
          evwinners.org
        </a>
      </div>
    </section>
  )
}
