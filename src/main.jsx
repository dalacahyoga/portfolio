import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

// Apply the saved theme (default: dark) before first paint to avoid a flash.
document.documentElement.dataset.theme =
  (() => { try { return localStorage.getItem('theme') } catch { return null } })() || 'dark'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
