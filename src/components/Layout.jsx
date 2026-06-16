import Navbar from './Navbar.jsx'
import Starfield from './Starfield.jsx'
import { profile } from '../data/profile.js'

// Shared shell for all primary pages: space background + top navigation.
export default function Layout({ children, wide }) {
  return (
    <div className="site">
      <Starfield />
      <Navbar />
      <main className={`site__main ${wide ? 'site__main--wide' : ''}`}>{children}</main>
      <footer className="site__footer">
        © {2026} {profile.firstName} — {profile.role}
      </footer>
    </div>
  )
}
