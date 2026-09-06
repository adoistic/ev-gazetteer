import { MAIN } from '../lib/types'

export default function Masthead() {
  return (
    <header className="masthead">
      <div className="shell masthead__in">
        <a className="brand" href="/">
          <picture>
            <source srcSet="/brand/thothica-thumb-white.png" media="(prefers-color-scheme: dark)" />
            <img className="brand__mark" src="/brand/thothica-thumb-black.png" alt="" width={26} height={26} />
          </picture>
          <span>
            <span className="brand__text">
              Emergent Ventures <b>beyond the main series</b>
            </span>
            <span className="brand__sub">A Thothica project</span>
          </span>
        </a>
        <nav className="mastnav" aria-label="Primary">
          <a className="opt" href="#grantees">Grantees</a>
          <a className="opt" href="#about">About</a>
          <a className="is-cta" href={MAIN.site} target="_blank" rel="noopener noreferrer">
            Main series
          </a>
        </nav>
      </div>
    </header>
  )
}
