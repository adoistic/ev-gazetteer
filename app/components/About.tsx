import { ADDED_HERE, ADNAN_ID, NABEEL, THOTHICA, type Gazetteer } from '../lib/types'
import { formatLongDate, href } from '../lib/format'

const A = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <a className="link" href={to} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
)

export default function About({ data }: { data: Gazetteer }) {
  const builder = data.grants.find((g) => g.id === ADNAN_ID)
  const repeat = data.people.filter((p) => p.repeat).length
  const withLinks = data.grants.filter((g) => g.links && g.links.length).length
  const uncertain = data.uncertain[0]

  return (
    <section className="about" id="about">
      <div className="shell about__grid">
        <div>
          <p className="eyebrow">About</p>
          <h2 style={{ marginTop: 'var(--s3)' }}>What this adds</h2>

          <p>
            <A to="https://www.mercatus.org/emergent-ventures">Emergent Ventures</A> is a grant and
            fellowship programme at the Mercatus Center at George Mason University, started by{' '}
            <A to="https://en.wikipedia.org/wiki/Tyler_Cowen">Tyler Cowen</A>. Nabeel Qureshi already
            collected its winners and their announcement posts at <A to={NABEEL.site}>evwinners.org</A>.
            I added {ADDED_HERE} entries to that collection and then did three things to all of it.
          </p>

          <p>
            <strong>Tagged every grant.</strong> The data names a subject for 18 per cent of grants and a
            career stage for 3 per cent. I read all {data.grants.length.toLocaleString('en-GB')} entries
            and tagged each one: the field, what the grant produced, why it was given, where the person
            was, and what stage they had reached. You can now ask for machine learning in India by a
            school student, or for everyone who made a podcast.
          </p>

          <p>
            <strong>Put the links back.</strong> The announcement posts carry hyperlinks inside the text.
            The shared CSV keeps the words and drops the addresses, so a phrase like &ldquo;here is his
            blog&rdquo; lost the blog, and a linked company name lost the company. I took those links
            from archived copies of the posts and restored them. {withLinks.toLocaleString('en-GB')}{' '}
            grants carry at least one.
          </p>

          <p>
            <strong>Joined up the people.</strong> Reading every entry found four tranches the data does
            not label. Ukraine, archaeology, science education and science communication are each
            announced inside a numbered cohort and named only in the text. It also found {repeat} people
            holding more than one grant, several of them spelled differently each time. They now appear
            once, with all their grants listed.
          </p>

          <p>
            The tags are my judgement and some will be wrong. Where a description gives no evidence for a
            value, the value is blank. Where two rows might be the same person and the evidence is thin,
            they stay separate and the doubt is written down.
            {uncertain && ` ${uncertain.note}`}
          </p>

          <p>
            This is an independent project. It is not affiliated with Emergent Ventures or the Mercatus
            Center.
          </p>
        </div>

        <div>
          <div className="card">
            <p className="eyebrow">How search works</p>
            <p>
              Each grant becomes a vector, built from its description and its tags. Your query becomes a
              vector the same way, and the nearest grants come back. The tags matter here.
              &ldquo;AI&rdquo; is two letters, and a description on its own gives the model too little to
              work with.
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
              A snapshot of the shared CSV, plus links taken from archived copies of the announcement
              posts. Wrong or missing entries should be fixed{' '}
              <A to={`${NABEEL.repo}/tree/main/pipeline/data`}>upstream</A>, where both sites read from.
            </p>
            <dl>
              <dt>Source</dt>
              <dd><A to={NABEEL.repo}>nqureshi/ev-winners</A></dd>
              <dt>Posts</dt>
              <dd><A to="https://marginalrevolution.com">Marginal Revolution</A></dd>
              <dt>This site</dt>
              <dd><A to="https://github.com/adoistic/ev-gazetteer">adoistic/ev-gazetteer</A></dd>
            </dl>
          </div>

          {builder && (
            <div className="card">
              <p className="eyebrow">Built by</p>
              <p>
                Adnan, Founder and CEO of <A to={THOTHICA}>Thothica</A>. He holds an Emergent Ventures
                grant himself.
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
