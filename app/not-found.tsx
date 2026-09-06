import Masthead from './components/Masthead'
import { NABEEL } from './lib/types'

/**
 * Replaces the framework's default not found page, which ships its own grey
 * palette. Two inks only, like everything else.
 */
export default function NotFound() {
  return (
    <>
      <Masthead />
      <main className="shell" style={{ padding: 'var(--s9) 0' }}>
        <p className="eyebrow">Page not found</p>
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 4.5rem)', marginTop: 'var(--s4)' }}>
          That page is not here
        </h1>
        <p className="narration" style={{ marginTop: 'var(--s5) ' }}>
          The grantee list is one page, and it is this way.
        </p>
        <p style={{ marginTop: 'var(--s6)', display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap' }}>
          <a className="bigbtn" href="/">Back to the grantees</a>
          <a className="bigbtn" href={NABEEL.site} target="_blank" rel="noopener noreferrer">
            evwinners.org
          </a>
        </p>
      </main>
    </>
  )
}
