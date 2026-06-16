import { certificates } from '../data/profile.js'
import Layout from '../components/Layout.jsx'
import { CertIcon, ExternalIcon } from '../components/Icons.jsx'

export default function Certificates() {
  return (
    <Layout>
      <div className="page-head">
        <p className="eyebrow">Qualifications</p>
        <h1 className="display">My <span className="grad-text">Certificates</span></h1>
        <p className="muted">
          {certificates.length} certifications &amp; achievements — click any card to view the credential.
        </p>
      </div>

      <div className="cert-grid">
        {certificates.map((c) => {
          const CardTag = c.link ? 'a' : 'div'
          const linkProps = c.link
            ? { href: c.link, target: '_blank', rel: 'noreferrer' }
            : {}
          return (
            <CardTag className="card cert-card" key={c.title} {...linkProps}>
              {c.image && (
                <div className="cert-card__shot">
                  <img src={c.image} alt={c.title} loading="lazy" />
                  {c.link && <span className="cert-card__view"><ExternalIcon /> View</span>}
                </div>
              )}
              <div className="cert-card__top">
                <span className="cert-card__icon"><CertIcon /></span>
                <span className="cert-card__year">{c.year}</span>
              </div>
              <h3 className="cert-card__title">{c.title}</h3>
              <p className="cert-card__issuer">{c.issuer}</p>
              <p className="cert-card__desc">{c.desc}</p>
            </CardTag>
          )
        })}
      </div>
    </Layout>
  )
}
