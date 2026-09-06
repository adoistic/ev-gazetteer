import { NABEEL } from '../lib/types'
import ThemeToggle from './ThemeToggle'

export default function Masthead() {
  return (
    <header className="masthead inverse">
      <div className="shell masthead__in">
        <a className="brand" href="/">
          <span className="brand__label">
            <span className="brand__text">
              The Emergent Ventures <b>Gazetteer</b>
            </span>
          </span>
        </a>
        <nav className="mastnav" aria-label="Primary">
          <a className="opt" href="#grants">Grants</a>
          <a className="opt" href="#about">About</a>
          <a className="is-cta opt" href={NABEEL.site} target="_blank" rel="noopener noreferrer">
            evwinners.org
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
