import { ADNAN_ID, MAIN, THOTHICA, type Winner } from '../lib/types'
import { formatLongDate, href } from '../lib/format'

const A = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <a className="link" href={to} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
)

export default function About({ builder, updated }: { builder: Winner | undefined; updated: string | null }) {
  const post = href(builder?.link ?? null)

  return (
    <section className="about" id="about">
      <div className="shell about__grid">
        <div>
          <p className="eyebrow">About</p>
          <h2 style={{ marginTop: 'var(--s3)' }}>Why this site exists</h2>
          <p>
            <A to="https://www.mercatus.org/emergent-ventures">Emergent Ventures</A> is a grant and fellowship
            programme at the Mercatus Center at George Mason University, started by{' '}
            <A to="https://en.wikipedia.org/wiki/Tyler_Cowen">Tyler Cowen</A>. Alongside its numbered cohorts it
            runs four other tranches: India, Africa and Caribbean, the Covid prizes, and one for progress studies.
          </p>
          <p>
            Those four have never been presented together. Reading them as a set shows something the numbered
            cohorts do not: what the programme funds when it goes looking outside its usual reach. This site holds
            all {(469).toLocaleString('en-GB')} of those grantees and lets you search them by meaning rather than
            by keyword.
          </p>
          <p>
            Every entry is drawn from the announcement posts on{' '}
            <A to="https://marginalrevolution.com">Marginal Revolution</A> and carries a link back to the post it
            came from. The data is a snapshot of{' '}
            <A to={`${MAIN.repo}/blob/main/pipeline/data/ev-winners.csv`}>the shared CSV</A>. Corrections belong
            upstream in that repository, so both sites benefit.
          </p>
          <p>
            This is an independent project. It is not affiliated with Emergent Ventures or the Mercatus Center.
          </p>
        </div>

        <div>
          <div className="card">
            <p className="eyebrow">Built by</p>
            <h3 style={{ marginTop: 'var(--s2)' }}>Adnan Abbasi</h3>
            <p>
              Founder and CEO, <A to={THOTHICA}>Thothica</A>, which builds AI native knowledge infrastructure:
              structuring a domain, writing down how its parts relate, and putting a queryable layer over it with
              provenance on every answer.
            </p>
            {builder && (
              <>
                <p>
                  He is also an Emergent Ventures grantee, in the same India tranche this site covers. The grant
                  went to an archive reader that makes rare historical texts readable through AI translation.
                </p>
                <dl>
                  <dt>Cohort</dt>
                  <dd>{builder.batch}</dd>
                  <dt>Announced</dt>
                  <dd>{formatLongDate(builder.date)}</dd>
                  <dt>Post</dt>
                  <dd>{post && <A to={post}>Marginal Revolution</A>}</dd>
                  <dt>Entry</dt>
                  <dd>
                    <a className="link" href={`#grantee-${ADNAN_ID}`}>
                      See it in the list
                    </a>
                  </dd>
                </dl>
              </>
            )}
          </div>

          <div className="card">
            <p className="eyebrow">Inspired by</p>
            <h3 style={{ marginTop: 'var(--s2)' }}>Nabeel&rsquo;s project</h3>
            <p>
              <A to={MAIN.site}>Emergent Ventures Winners</A> by{' '}
              <A to={MAIN.author}>Nabeel S. Qureshi</A> collects the numbered cohorts and gave this one its shape,
              its data and its search idea. Go there for cohorts 1 to {MAIN.cohorts}.
            </p>
            <dl>
              <dt>Site</dt>
              <dd><A to={MAIN.site}>evwinners.org</A></dd>
              <dt>Source</dt>
              <dd><A to={MAIN.repo}>nqureshi/ev-winners</A></dd>
            </dl>
          </div>

          <div className="card">
            <p className="eyebrow">How search works</p>
            <p>
              Each grantee is turned into a vector by{' '}
              <A to="https://huggingface.co/BAAI/bge-base-en-v1.5">bge-base-en-v1.5</A> running on{' '}
              <A to="https://developers.cloudflare.com/workers-ai/">Workers AI</A>. Your query is embedded the same
              way and compared against all of them, so a search for an idea finds people who never used your words.
            </p>
            <dl>
              <dt>Hosting</dt>
              <dd>Cloudflare Workers</dd>
              <dt>Updated</dt>
              <dd>{updated ?? 'Unknown'}</dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
