import { useState, useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { profile, experience, education, skills, projects } from '../data/profile.js'
import {
  LinkedInIcon, GitHubIcon, LocationIcon, ArrowIcon, ChevronIcon, ExternalIcon,
} from '../components/Icons.jsx'
import Layout from '../components/Layout.jsx'
import { trackEvent } from '../lib/analytics.js'

// Group consecutive entries by a key (company / school) so the name shows once,
// with its roles or degrees nested underneath.
function groupBy(items, key) {
  const groups = []
  items.forEach((it) => {
    const last = groups[groups.length - 1]
    if (last && last.key === it[key]) last.items.push(it)
    else groups.push({ key: it[key], items: [it] })
  })
  return groups
}

export default function Home() {
  const [tab, setTab] = useState('experience')
  const [openRoles, setOpenRoles] = useState(() => new Set())
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  // collapse skills behind "View more": up to "UAT" on desktop, "Java" on mobile
  const javaIdx = skills.indexOf('Java')
  const uatIdx = skills.indexOf('UAT')
  const extraMobile = javaIdx >= 0 ? skills.length - (javaIdx + 1) : 0
  const extraDesktop = uatIdx >= 0 ? skills.length - (uatIdx + 1) : 0

  // On desktop, lock the Experience card to the Projects+Skills stack height while
  // skills are collapsed — so it sits level with Skills, but doesn't grow on "View more".
  const stackRef = useRef(null)
  const [expMinH, setExpMinH] = useState(0)
  // refs so the measure() closure always sees the latest open state
  const openRef = useRef(openRoles)
  openRef.current = openRoles
  const skillsOpenRef = useRef(skillsOpen)
  skillsOpenRef.current = skillsOpen
  // Measure the baseline stack height only when nothing is expanded (mount + resize),
  // never on a toggle — so expanding a project/skill never resizes the Experience card.
  useLayoutEffect(() => {
    const measure = () => {
      const desktop = window.matchMedia('(min-width: 1025px)').matches
      if (!desktop) { setExpMinH(0); return }
      const anyOpen =
        skillsOpenRef.current || [...openRef.current].some((id) => id.startsWith('proj-'))
      if (anyOpen || !stackRef.current) return
      setExpMinH(stackRef.current.offsetHeight)
    }
    measure()
    if (document.fonts?.ready) document.fonts.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  const expGroups = groupBy(experience, 'company')
  const eduGroups = groupBy(education, 'school')

  const toggleRole = (id) =>
    setOpenRoles((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <Layout wide>
      <div className="bento">
        {/* About / profile — the big hero card */}
        <section className="card bento__about">
          <div
            className="bento__about-media"
            onClick={() => setPhotoOpen(true)}
            title="Click to enlarge"
          >
            <img
              src={profile.photo}
              alt={profile.name}
              onError={(e) => { e.currentTarget.src = '/profile.svg' }}
            />
            <span className="status-pill"><span className="status-pill__dot" /> Open to work</span>
            <span className="photo-zoom" aria-hidden="true">⤢</span>
          </div>
          <div className="bento__about-headline">
            <p className="eyebrow">{profile.name}</p>
            <h1 className="display grad-text">{profile.role}</h1>
          </div>
          <p className="muted bento__about-desc">{profile.about}</p>
          <div className="bento__about-actions">
            <Link to="/portfolio" className="btn btn--solid" onClick={() => trackEvent('cta_click', { menu: 'View Portfolio' })}>
              View Portfolio <ArrowIcon />
            </Link>
            <Link to="/contact" className="btn btn--outline" onClick={() => trackEvent('cta_click', { menu: 'Contact me' })}>Contact me</Link>
          </div>
        </section>

        {/* Profiles / socials */}
        <section className="card bento__socials">
          <p className="card__caption">Stay connected</p>
          <h3 className="card__heading">Profiles</h3>
          <div className="social-grid">
            <a className="social-grid__item" href={profile.links.linkedin} target="_blank" rel="noreferrer" onClick={() => trackEvent('social_click', { menu: 'LinkedIn' })}>
              <LinkedInIcon /><span>LinkedIn</span>
            </a>
            <a className="social-grid__item" href={profile.links.github} target="_blank" rel="noreferrer" onClick={() => trackEvent('social_click', { menu: 'GitHub' })}>
              <GitHubIcon /><span>GitHub</span>
            </a>
          </div>
        </section>

        {/* Location */}
        <section className="card bento__location">
          <p className="card__caption">Based in</p>
          <h3 className="card__heading"><LocationIcon /> {profile.location}</h3>
          <p className="muted small">{profile.tagline}</p>
        </section>

        {/* Credentials — experience / education tabs */}
        <section
          className="card bento__credentials"
          style={tab === 'experience' && expMinH ? { minHeight: expMinH } : undefined}
        >
          <div className="cred-tabs">
            <button
              type="button"
              className={`cred-tab ${tab === 'experience' ? 'is-active' : ''}`}
              onClick={() => setTab('experience')}
            >
              Experience
            </button>
            <button
              type="button"
              className={`cred-tab ${tab === 'education' ? 'is-active' : ''}`}
              onClick={() => setTab('education')}
            >
              Education
            </button>
          </div>

          {tab === 'experience' ? (
            <ul className="timeline">
              {expGroups.map((group) => (
                <li
                  className={`timeline__group${group.items.length > 1 ? ' is-multi' : ''}`}
                  key={group.key}
                >
                  <div className="timeline__company">{group.key}</div>
                  <ul className="timeline__roles">
                    {group.items.map((job) => {
                      const id = job.role + job.client
                      const open = openRoles.has(id)
                      return (
                        <li className="timeline__role" key={id}>
                          <div className="timeline__head"><strong>{job.role}</strong></div>
                          {job.client && (
                            <div className="timeline__sub">
                              <span className="timeline__assign">{job.client}</span>
                            </div>
                          )}
                          <span className="timeline__period">{job.period}</span>
                          {job.points?.length > 0 && (
                            <>
                              <button
                                type="button"
                                className="role-toggle"
                                aria-expanded={open}
                                onClick={() => toggleRole(id)}
                              >
                                {open ? 'Hide details' : 'Show details'}
                                <span className={`role-toggle__chev${open ? ' is-open' : ''}`}>
                                  <ChevronIcon />
                                </span>
                              </button>
                              <div className={`role-details${open ? ' is-open' : ''}`}>
                                <ul className="timeline__points">
                                  {job.points.map((p, j) => <li key={j}>{p}</li>)}
                                </ul>
                              </div>
                            </>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="timeline">
              {eduGroups.map((group) => (
                <li
                  className={`timeline__group${group.items.length > 1 ? ' is-multi' : ''}`}
                  key={group.key}
                >
                  <div className="timeline__company">{group.key}</div>
                  <ul className="timeline__roles">
                    {group.items.map((ed) => {
                      const id = ed.school + ed.degree
                      const open = openRoles.has(id)
                      return (
                        <li className="timeline__role" key={ed.degree}>
                          <div className="timeline__head"><strong>{ed.degree}</strong></div>
                          {ed.location && <div className="timeline__sub">{ed.location}</div>}
                          <span className="timeline__period">{ed.period}</span>
                          {ed.points?.length > 0 && (
                            <>
                              <button
                                type="button"
                                className="role-toggle"
                                aria-expanded={open}
                                onClick={() => toggleRole(id)}
                              >
                                {open ? 'Hide details' : 'Show details'}
                                <span className={`role-toggle__chev${open ? ' is-open' : ''}`}>
                                  <ChevronIcon />
                                </span>
                              </button>
                              <div className={`role-details${open ? ' is-open' : ''}`}>
                                <ul className="timeline__points">
                                  {ed.points.map((p, j) => <li key={j}>{p}</li>)}
                                </ul>
                              </div>
                            </>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Projects + Skills stacked together so they sit tight beside Experience */}
        <div className="bento__stack" ref={stackRef}>
          <section className="card bento__projects">
            <p className="card__caption">Selected work</p>
            <h3 className="card__heading">Projects</h3>
            <ul className="project-list">
              {projects.map((p) => {
                const id = `proj-${p.name}`
                const open = openRoles.has(id)
                return (
                  <li className={`project-item${open ? ' is-open' : ''}`} key={p.name}>
                    <div className="project-item__head">
                      {p.link ? (
                        <a className="project-item__link" href={p.link} target="_blank" rel="noreferrer">
                          <strong className="project-item__name">{p.name}</strong>
                          <span className="project-item__ext"><ExternalIcon /></span>
                        </a>
                      ) : (
                        <strong className="project-item__name">{p.name}</strong>
                      )}
                      <button
                        type="button"
                        className="proj-toggle"
                        aria-expanded={open}
                        aria-label="Toggle description"
                        onClick={() => toggleRole(id)}
                      >
                        <span className="proj-toggle__chev"><ChevronIcon /></span>
                      </button>
                    </div>
                    <div className={`role-details${open ? ' is-open' : ''}`}>
                      <div className="project-item__body">
                        <div className="project-item__meta">
                          <span className="timeline__assign">{p.role}</span>
                          <span className="project-item__org">{p.org}</span>
                        </div>
                        <p className="project-item__desc">{p.desc}</p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="card bento__skills">
            <p className="card__caption">Capabilities</p>
            <h3 className="card__heading">Tools &amp; Skills</h3>
            <div className={`chips${skillsOpen ? ' is-open' : ''}`}>
              {skills.map((s, i) => {
                let cls = 'chip'
                if (javaIdx >= 0 && i > javaIdx) cls += ' chip--m-extra'
                if (uatIdx >= 0 && i > uatIdx) cls += ' chip--d-extra'
                return <span className={cls} key={s}>{s}</span>
              })}
            </div>
            {extraDesktop > 0 && (
              <button
                type="button"
                className="skills-more skills-more--d"
                aria-expanded={skillsOpen}
                onClick={() => setSkillsOpen((o) => !o)}
              >
                {skillsOpen ? 'View less' : `View more (+${extraDesktop})`}
                <span className={`skills-more__chev${skillsOpen ? ' is-open' : ''}`}>
                  <ChevronIcon />
                </span>
              </button>
            )}
            {extraMobile > 0 && (
              <button
                type="button"
                className="skills-more skills-more--m"
                aria-expanded={skillsOpen}
                onClick={() => setSkillsOpen((o) => !o)}
              >
                {skillsOpen ? 'View less' : `View more (+${extraMobile})`}
                <span className={`skills-more__chev${skillsOpen ? ' is-open' : ''}`}>
                  <ChevronIcon />
                </span>
              </button>
            )}
          </section>
        </div>

        {/* CTA to certificates */}
        <Link to="/certificates" className="card bento__cta">
          <div>
            <p className="card__caption">Qualifications</p>
            <h3 className="card__heading">Certificates</h3>
            <p className="muted small">Industry certifications &amp; specialist badges</p>
          </div>
          <span className="bento__cta-arrow"><ArrowIcon /></span>
        </Link>
      </div>

      {photoOpen && (
        <div className="photo-lightbox" onClick={() => setPhotoOpen(false)}>
          <img src={profile.photo} alt={profile.name} />
          <button className="photo-lightbox__close" aria-label="Close">×</button>
        </div>
      )}
    </Layout>
  )
}
