import { MAIN, PROGRAMMES, type ProgrammeId } from '../lib/types'

type Counts = Record<ProgrammeId, number>

/**
 * The scope argument, drawn rather than written: Emergent Ventures branches
 * into a numbered main series and four regional and thematic tranches. Solid
 * means held on this site. Dashed and hatched means held at evwinners.org.
 *
 * Orientation follows the canvas. The wide drawing is a spine with branch
 * rows; below 900px it is redrawn as a vertical rail rather than squeezed.
 * Plain paths, rects, lines and text only, so it prints and scales cleanly.
 */
export default function ProgrammeDiagram({ counts }: { counts: Counts }) {
  const rows = [
    { key: 'main', label: `Main series, cohorts 1 to ${MAIN.cohorts}`, count: MAIN.winners, here: false },
    ...PROGRAMMES.map((p) => ({ key: p.id, label: p.label, count: counts[p.id], here: true })),
  ]

  return (
    <section className="diagram" aria-labelledby="dg-h">
      <div className="shell">
        <div className="diagram__head">
          <div>
            <p className="eyebrow">How the programme divides</p>
            <h2 id="dg-h" style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', marginTop: 'var(--s2)' }}>
              Five branches, four of them here
            </h2>
          </div>
          <p className="diagram__note">
            Solid means the grantees are on this site. Hatched means they are held at evwinners.org,
            where the main series is already covered properly.
          </p>
        </div>

        {/* Wide: a spine with one row per branch. */}
        <svg className="dg-wide" viewBox="0 0 1180 372" role="img"
             aria-label={`Emergent Ventures divides into the main series of ${MAIN.winners} winners held at evwinners.org, and four tranches held here: ${PROGRAMMES.map((p) => `${p.label}, ${counts[p.id]}`).join('; ')}.`}>
          <defs>
            <pattern id="dg-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" className="dg-ground" />
              <rect width="1.5" height="6" fill="currentColor" />
            </pattern>
          </defs>

          {/* Root */}
          <rect x="1" y="140" width="236" height="92" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="20" y="176" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="26" fill="currentColor">Emergent</text>
          <text x="20" y="204" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="26" fill="currentColor">Ventures</text>
          <text x="20" y="224" fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="10" fontWeight="700" letterSpacing="2" fill="currentColor">
            MERCATUS CENTER, SINCE 2018
          </text>

          {/* Spine */}
          <line x1="237" y1="186" x2="286" y2="186" stroke="currentColor" strokeWidth="2" />
          <line x1="286" y1="30" x2="286" y2="342" stroke="currentColor" strokeWidth="2" />

          {rows.map((r, i) => {
            const y = 30 + i * 78
            return (
              <g key={r.key}>
                <line x1="286" y1={y} x2="336" y2={y} stroke="currentColor" strokeWidth={r.here ? 2 : 1}
                      strokeDasharray={r.here ? undefined : '5 4'} />
                <rect x="336" y={y - 27} width="843" height="54" fill={r.here ? 'none' : 'url(#dg-hatch)'}
                      stroke="currentColor" strokeWidth={r.here ? 2 : 1} strokeDasharray={r.here ? undefined : '5 4'} />
                {!r.here && <rect x="352" y={y - 19} width="560" height="38" className="dg-ground" />}
                <text x={r.here ? 360 : 366} y={y + 7} fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="17" fontWeight="700" fill="currentColor">
                  {r.label}
                </text>
                <text x="1163" y={y + 10} textAnchor="end" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="30" fill="currentColor"
                      style={{ fontFeatureSettings: "'lnum' 1,'tnum' 1" }}>
                  {r.count}
                </text>
                <text x="1163" y={y - 14} textAnchor="end" fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="9" fontWeight="700"
                      letterSpacing="1.6" fill="currentColor">
                  {r.here ? 'HERE' : 'AT EVWINNERS.ORG'}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Narrow: a vertical rail, redrawn rather than squeezed. */}
        <svg className="dg-tall" viewBox="0 0 380 470" role="img" aria-hidden="true">
          <defs>
            <pattern id="dg-hatch2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" className="dg-ground" />
              <rect width="1.5" height="6" fill="currentColor" />
            </pattern>
          </defs>

          <rect x="1" y="1" width="378" height="62" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="16" y="34" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="24" fill="currentColor">Emergent Ventures</text>
          <text x="16" y="52" fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1.8" fill="currentColor">
            MERCATUS CENTER, SINCE 2018
          </text>

          <line x1="26" y1="63" x2="26" y2="446" stroke="currentColor" strokeWidth="2" />

          {rows.map((r, i) => {
            const y = 108 + i * 72
            return (
              <g key={r.key}>
                <line x1="26" y1={y} x2="52" y2={y} stroke="currentColor" strokeWidth={r.here ? 2 : 1}
                      strokeDasharray={r.here ? undefined : '4 3'} />
                <circle cx="26" cy={y} r="5" fill="currentColor" />
                <rect x="52" y={y - 26} width="327" height="52" fill={r.here ? 'none' : 'url(#dg-hatch2)'}
                      stroke="currentColor" strokeWidth={r.here ? 2 : 1} strokeDasharray={r.here ? undefined : '4 3'} />
                {!r.here && <rect x="60" y={y - 18} width="235" height="36" className="dg-ground" />}
                <text x="66" y={y - 2} fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="13" fontWeight="700" fill="currentColor">
                  {r.key === 'main' ? `Main series, 1 to ${MAIN.cohorts}` : r.label}
                </text>
                <text x="66" y={y + 14} fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1.4" fill="currentColor">
                  {r.here ? 'HERE' : 'AT EVWINNERS.ORG'}
                </text>
                <text x="370" y={y + 8} textAnchor="end" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="24" fill="currentColor"
                      style={{ fontFeatureSettings: "'lnum' 1,'tnum' 1" }}>
                  {r.count}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}
