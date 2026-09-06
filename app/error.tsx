'use client'

import Masthead from './components/Masthead'

/** Route level fallback, in the two inks. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <Masthead />
      <main className="shell" style={{ padding: 'var(--s9) 0' }}>
        <p className="eyebrow">Something broke</p>
        <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', marginTop: 'var(--s4)' }}>The page did not load</h1>
        <button className="bigbtn" style={{ marginTop: 'var(--s6)' }} onClick={reset} type="button">
          Try again
        </button>
      </main>
    </>
  )
}
