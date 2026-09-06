import { ADNAN_ID, NABEEL, THOTHICA, type Gazetteer } from '../lib/types'
import { formatLongDate, href } from '../lib/format'

const A = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <a className="link" href={to} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
)

export default function About({ data }: { data: Gazetteer }) {
  const builder = data.grants.find((g) => g.id === ADNAN_ID)
  const repeat = data.people.filter((p) => p.repeat).length
  const uncertain = data.uncertain[0]

  return (
    <section className="about" id="about">
      <div className="shell about__grid">
        <div>
          <p className="eyebrow">About</p>
          <h2 style={{ marginTop: 'var(--s3)' }}>What this adds</h2>
          <p>
            <A to="https://www.mercatus.org/emergent-ventures">Emergent Ventures</A> is a grant and fellowship
            programme at the Mercatus Center at George Mason University, started by{' '}
            <A to="https://en.wikipedia.org/wiki/Tyler_Cowen">Tyler Cowen</A>. Its winners were already collected,
            with their announcement posts, at <A to={NABEEL.site}>evwinners.org</A>. What was missing was structure.
          </p>
          <p>
            The source data carries a subject for only 18 per cent of grants and a career stage for 3 per cent.
            So every one of the {data.grants.length.toLocaleString('en-GB')} entries was read and classified:
            field, what was made, why the grant was given, where the person was and what stage they were at.
            That is what lets you ask for machine learning in India by a school student, or for everyone who
            built a podcast, and get an answer.
          </p>
          <p>
            Reading rather than pattern matching turned up things the data does not say. Four tranches are
            announced inside numbered cohorts and marked only in prose: Ukraine, archaeology, science education
            and science communication. {repeat} people hold more than one grant, sometimes under different
            spellings, and they now read as one person with a history rather than as strangers.
          </p>
          <p>
            The classification is a judgement, not a fact. Where a description does not support a value it is
            left blank instead of guessed, and where two rows might be one person but the evidence does not
            settle it, they stay separate and the doubt is recorded.
            {uncertain && ` ${uncertain.note}`}
          </p>
          <p>
            This is an independent project. It is not affiliated with Emergent Ventures or the Mercatus Center.
          </p>
        </div>

        <div>
          <div className="card">
            <p className="eyebrow">How search works</p>
            <p>
              Each grant is turned into a vector by{' '}
              <A to="https://huggingface.co/BAAI/bge-base-en-v1.5">bge-base-en-v1.5</A> on{' '}
              <A to="https://developers.cloudflare.com/workers-ai/">Workers AI</A>, from its description
              together with its tags. Including the tags is what makes a two letter query like &ldquo;AI&rdquo;
              work: on the description alone it has too little to match.
            </p>
            <dl>
              <dt>Grants</dt>
              <dd className="num">{data.grants.length.toLocaleString('en-GB')}</dd>
              <dt>People</dt>
              <dd className="num">{data.people.length.toLocaleString('en-GB')}</dd>
              <dt>Hosting</dt>
              <dd>Cloudflare Workers</dd>
              <dt>Updated</dt>
              <dd>{formatLongDate(data.updated)}</dd>
            </dl>
          </div>

          <div className="card">
            <p className="eyebrow">Data</p>
            <p>
              A snapshot of the shared CSV. Missing or wrong entries should be fixed{' '}
              <A to={`${NABEEL.repo}/tree/main/pipeline/data`}>upstream</A>, where both sites read from.
            </p>
            <dl>
              <dt>Source</dt>
              <dd><A to={NABEEL.repo}>nqureshi/ev-winners</A></dd>
              <dt>Posts</dt>
              <dd><A to="https://marginalrevolution.com">Marginal Revolution</A></dd>
            </dl>
          </div>

          {builder && (
            <div className="card">
              <p className="eyebrow">Built by</p>
              <p>
                Adnan, Founder and CEO of <A to={THOTHICA}>Thothica</A>, and himself an Emergent Ventures grantee.
              </p>
              <dl>
                <dt>Cohort</dt>
                <dd>{builder.batch}</dd>
                <dt>Announced</dt>
                <dd>{formatLongDate(builder.date)}</dd>
                <dt>Post</dt>
                <dd>{builder.link && <A to={href(builder.link) as string}>Marginal Revolution</A>}</dd>
                <dt>Entry</dt>
                <dd><a className="link" href={`#grant-${ADNAN_ID}`}>In the list</a></dd>
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
