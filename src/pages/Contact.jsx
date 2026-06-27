import { useState } from 'react'
import { profile } from '../data/profile.js'
import Layout from '../components/Layout.jsx'
import {
  MailIcon, LocationIcon, PhoneIcon, LinkedInIcon, GitHubIcon, ArrowIcon,
} from '../components/Icons.jsx'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  function update(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    // No backend — open the user's mail client with a prefilled message.
    const subject = encodeURIComponent(`Portfolio enquiry from ${form.name || 'a visitor'}`)
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <Layout>
      <div className="page-head">
        <p className="eyebrow">Get in touch</p>
        <h1 className="display grad-text">Let&apos;s talk</h1>
        <p className="muted">Have a role, a project, or a flaky test suite that needs taming? Drop a message.</p>
      </div>

      <div className="contact">
        {/* Contact info cards */}
        <div className="contact__info">
          <a className="card info-row" href={`mailto:${profile.email}`}>
            <span className="info-row__icon"><MailIcon /></span>
            <span>
              <span className="info-row__label">Mail</span>
              <span className="info-row__value">{profile.email}</span>
            </span>
          </a>
          <a className="card info-row" href={`tel:${profile.phone.replace(/\s/g, '')}`}>
            <span className="info-row__icon"><PhoneIcon /></span>
            <span>
              <span className="info-row__label">Phone</span>
              <span className="info-row__value">{profile.phone}</span>
            </span>
          </a>
          <div className="card info-row">
            <span className="info-row__icon"><LocationIcon /></span>
            <span>
              <span className="info-row__label">Location</span>
              <span className="info-row__value">{profile.location}</span>
            </span>
          </div>
          <div className="card contact__socials">
            <span className="info-row__label">Stay connected</span>
            <div className="contact__social-row">
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedInIcon /></a>
              <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub"><GitHubIcon /></a>
            </div>
          </div>
        </div>

        {/* Message form */}
        <form className="card contact__form" onSubmit={onSubmit}>
          <h3 className="card__heading">Dispatch a message</h3>
          {sent && (
            <div className="contact__notice">✔ Message dispatched — your mail client should open.</div>
          )}
          <label className="field">
            <span>Name</span>
            <input type="text" required value={form.name} onChange={update('name')} placeholder="Your name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" required value={form.email} onChange={update('email')} placeholder="you@email.com" />
          </label>
          <label className="field">
            <span>Message</span>
            <textarea required rows={5} value={form.message} onChange={update('message')} placeholder="Tell me about it…" />
          </label>
          <button type="submit" className="btn btn--solid">
            Send message <ArrowIcon />
          </button>
        </form>
      </div>
    </Layout>
  )
}
