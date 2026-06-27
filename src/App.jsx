import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Contact from './pages/Contact.jsx'
import Certificates from './pages/Certificates.jsx'
import Report from './pages/Report.jsx'
import Admin from './pages/Admin.jsx'
import { trackPageView } from './lib/analytics.js'

// Records a page view on every route change (the admin area is skipped inside).
function Tracker() {
  const { pathname } = useLocation()
  useEffect(() => { trackPageView(pathname) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <Tracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/report" element={<Report />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  )
}
