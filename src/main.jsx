import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles.css'
import { preloadContent } from './lib/content.js'

// Apply the saved theme (default: dark) before first paint to avoid a flash.
document.documentElement.dataset.theme =
  (() => { try { return localStorage.getItem('theme') } catch { return null } })() || 'dark'

// Pull shared content from Supabase (if configured) into the local cache, then
// import App so the data layer reads the freshest content. Falls back instantly
// when Supabase isn't configured.
async function boot() {
  await preloadContent()
  const { default: App } = await import('./App.jsx')
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
}

boot()
