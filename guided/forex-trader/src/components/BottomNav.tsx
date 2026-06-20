import { Link } from '@tanstack/react-router'

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link
        to="/"
        className="bottom-nav__link"
        activeProps={{ className: 'bottom-nav__link bottom-nav__link--active' }}
        activeOptions={{ exact: true }}
      >
        Trade
      </Link>
      <Link
        to="/history"
        className="bottom-nav__link"
        activeProps={{ className: 'bottom-nav__link bottom-nav__link--active' }}
      >
        History
      </Link>
    </nav>
  )
}
