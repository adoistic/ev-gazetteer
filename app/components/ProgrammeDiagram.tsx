import type { FacetValue } from '../lib/types'

/**
 * The shape of the programme, drawn from the data rather than asserted.
 *
 * The lower band is the part that reading turned up: tranches announced
 * inside numbered cohorts and marked only by a phrase in the announcement
 * text, so they are invisible to anything that reads the batch column.
 *
 * Solid borders are series taken from the batch column. Dashed borders with a
 * hatched marker are tranches recovered from prose.
 */
export default function ProgrammeDiagram({
  series,
  tranches,
  total,
}: {
  series: FacetValue[]
  tranches: FacetValue[]
  total: number
}) {
  const label = `Emergent Ventures has ${total} grants across ${series.length} series: ${series
    .map((s) => `${s.label}, ${s.count}`)
    .join('; ')}. Inside the numbered cohorts sit further tranches: ${tranches
    .map((t) => `${t.label}, ${t.count}`)
    .join('; ')}.`

  return (
    <section className="diagram" aria-labelledby="dg-h">
      <div className="shell">
        <div className="diagram__head">
          <div>
            <p className="eyebrow">How the programme divides</p>
            <h2 id="dg-h" style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', marginTop: 'var(--s2)' }}>
              Five series, and four tranches inside the cohorts
            </h2>
          </div>
          <p className="diagram__note">
            The five series are labelled in the data. The four tranches are labelled nowhere. Each is
            announced inside a numbered cohort and named only in the text of the post.
          </p>
        </div>

        <svg className="dg-wide" viewBox="0 0 1180 470" role="img" aria-label={label}>
          <defs>
            <pattern id="dg-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" className="dg-ground" />
              <rect width="1.5" height="6" fill="currentColor" />
            </pattern>
          </defs>

          <rect x="1" y="120" width="226" height="92" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="20" y="156" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="26" fill="currentColor">Emergent</text>
          <text x="20" y="184" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="26" fill="currentColor">Ventures</text>
          <text x="20" y="204" fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="10" fontWeight="700" letterSpacing="2" fill="currentColor">
            MERCATUS CENTER, SINCE 2018
          </text>
          <line x1="227" y1="166" x2="276" y2="166" stroke="currentColor" strokeWidth="2" />
          <line x1="276" y1="30" x2="276" y2="302" stroke="currentColor" strokeWidth="2" />

          {series.map((s, i) => {
            const y = 30 + i * 68
            return (
              <g key={s.id}>
                <line x1="276" y1={y} x2="326" y2={y} stroke="currentColor" strokeWidth="2" />
                <rect x="326" y={y - 24} width="853" height="48" fill="none" stroke="currentColor" strokeWidth="2" />
                <text x="350" y={y + 6} fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="16" fontWeight="700" fill="currentColor">
                  {s.label}
                </text>
                <text x="1163" y={y + 9} textAnchor="end" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="27"
                      fill="currentColor" style={{ fontFeatureSettings: "'lnum' 1,'tnum' 1" }}>
                  {s.count}
                </text>
              </g>
            )
          })}

          <text x="326" y="378" fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="10" fontWeight="700"
                letterSpacing="2" fill="currentColor">
            NAMED ONLY IN THE POST TEXT
          </text>
          <line x1="326" y1="390" x2="1179" y2="390" stroke="currentColor" strokeWidth="1" strokeDasharray="5 4" />

          {tranches.map((t, i) => {
            const w = 213
            const x = 326 + i * w
            return (
              <g key={t.id}>
                <rect x={x} y="406" width={w - 10} height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 4" />
                <rect x={x + 1} y="407" width="14" height="46" fill="url(#dg-hatch)" />
                <text x={x + 26} y="428" fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="13" fontWeight="700" fill="currentColor">
                  {t.label}
                </text>
                <text x={x + 26} y="444" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="18" fill="currentColor"
                      style={{ fontFeatureSettings: "'lnum' 1,'tnum' 1" }}>
                  {t.count}
                </text>
              </g>
            )
          })}
        </svg>

        <svg className="dg-tall" viewBox="0 0 380 640" role="img" aria-label={label}>
          <defs>
            <pattern id="dg-hatch2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" className="dg-ground" />
              <rect width="1.5" height="6" fill="currentColor" />
            </pattern>
          </defs>

          <rect x="1" y="1" width="378" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="16" y="33" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="23" fill="currentColor">Emergent Ventures</text>
          <text x="16" y="50" fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1.6" fill="currentColor">
            MERCATUS CENTER, SINCE 2018
          </text>
          <line x1="24" y1="61" x2="24" y2="336" stroke="currentColor" strokeWidth="2" />

          {series.map((s, i) => {
            const y = 100 + i * 58
            return (
              <g key={s.id}>
                <line x1="24" y1={y} x2="50" y2={y} stroke="currentColor" strokeWidth="2" />
                <circle cx="24" cy={y} r="4" fill="currentColor" />
                <rect x="50" y={y - 21} width="329" height="42" fill="none" stroke="currentColor" strokeWidth="2" />
                <text x="64" y={y + 5} fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="13" fontWeight="700" fill="currentColor">
                  {s.label}
                </text>
                <text x="368" y={y + 8} textAnchor="end" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="22"
                      fill="currentColor" style={{ fontFeatureSettings: "'lnum' 1,'tnum' 1" }}>
                  {s.count}
                </text>
              </g>
            )
          })}

          <text x="0" y="412" fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="9" fontWeight="700"
                letterSpacing="1.6" fill="currentColor">
            NAMED ONLY IN THE POST TEXT
          </text>
          <line x1="0" y1="422" x2="379" y2="422" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />

          {tranches.map((t, i) => {
            const y = 444 + i * 50
            return (
              <g key={t.id}>
                <rect x="0" y={y} width="379" height="42" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
                <rect x="1" y={y + 1} width="12" height="40" fill="url(#dg-hatch2)" />
                <text x="26" y={y + 26} fontFamily="Teachers, Trebuchet MS, sans-serif" fontSize="12" fontWeight="700" fill="currentColor">
                  {t.label}
                </text>
                <text x="368" y={y + 28} textAnchor="end" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="20"
                      fill="currentColor" style={{ fontFeatureSettings: "'lnum' 1,'tnum' 1" }}>
                  {t.count}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}
