'use client'

/** Replaces the framework's default crash screen, which ships a grey palette. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#fff', color: '#000', fontFamily: 'Teachers, sans-serif' }}>
        <main style={{ maxWidth: 640, margin: '0 auto', padding: '96px 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
            Something broke
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 48, fontWeight: 400, margin: '16px 0 0' }}>
            The page did not load
          </h1>
          <p style={{ marginTop: 16 }}>Reload, and if it keeps happening the grantee list is still at evwinners.org.</p>
          <button
            onClick={reset}
            style={{ marginTop: 32, border: '2px solid #000', background: 'none', color: '#000',
                     padding: '16px 24px', fontSize: 13, fontWeight: 700, letterSpacing: '0.14em',
                     textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
