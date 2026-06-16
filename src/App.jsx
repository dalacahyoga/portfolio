import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Contact from './pages/Contact.jsx'
import Certificates from './pages/Certificates.jsx'
import Report from './pages/Report.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/certificates" element={<Certificates />} />
      <Route path="/report" element={<Report />} />
    </Routes>
  )
}
