# Portfolio — I Ketut Dala Cahyoga

Personal portfolio of **I Ketut Dala Cahyoga**, a Software Quality Assurance Engineer.
Built with **React + Vite**, featuring a space-themed bento-grid design with a
dark/light theme toggle.

## Pages

| Page | Description |
|------|-------------|
| **Home** | Profile, experience, education, projects, and skills in a responsive bento grid. |
| **Portfolio** | Banking projects (BI-FAST, BRI Merchant, Amar Bank Bisnis) plus a live, replayable test-automation demo (Web UI & REST API). |
| **Contact** | Contact details and a message form. |
| **Certificates** | Industry certifications & achievements with credential links. |
| **Admin** (`/admin`) | Hidden dashboard — visitor analytics, event tracker, and content editing. Login required. |

## Tech

- React 18 + React Router
- Vite
- Pure CSS (dark/light theme, fully responsive)
- **Supabase** *(optional)* — secure admin auth + shared analytics & content
- **Resend** *(optional)* — email notifications

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Admin & backend (optional)

The site runs fully **without a backend** — analytics and content edits fall back
to `localStorage` (admin login `dcgnrg` / `dcgnrg`, per-browser data).

Connect **Supabase** to make it real: secure login, plus visitor analytics,
event tracking, per-visitor aliases, and content edits shared across all
visitors. Optionally add **Resend** for email alerts.

- Backend setup → [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)
- Email notifications (new visitor + weekly report) → [`docs/EMAIL_NOTIFICATIONS.md`](docs/EMAIL_NOTIFICATIONS.md)
- Environment variables → [`.env.example`](.env.example)

## Customize

- `src/data/profile.js` — name, role, about, experience, education, skills, projects, certificates.
- `public/` — profile photo and certificate images.
- Content can also be edited live from the **Admin** page (saved to Supabase, or `localStorage` without it).

## Deploy

- **GitHub Pages** — build with the Supabase env vars set, then publish `dist/` to the `gh-pages` branch.
- **Netlify** — connected to the repo; set the env vars in Site settings and it auto-builds (`netlify.toml` included).
