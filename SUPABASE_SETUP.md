# Supabase backend setup

The site works without a backend (localStorage). Configure Supabase to make the
admin login secure and to share **visitor analytics** + **content edits** across
all visitors.

## 1. Create the project
1. Sign up at https://supabase.com (free tier) and create a new project.
2. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## 2. Create the schema + security policies
Open **SQL Editor** in Supabase and run this:

```sql
-- tables ---------------------------------------------------------------
create table if not exists pageviews (
  id   bigint generated always as identity primary key,
  path text not null,
  ref  text,
  ts   timestamptz not null default now()
);

create table if not exists events (
  id   bigint generated always as identity primary key,
  name text not null,
  meta jsonb,
  ts   timestamptz not null default now()
);

create table if not exists content (
  id         int primary key default 1,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into content (id, data) values (1, '{}'::jsonb)
  on conflict (id) do nothing;

-- row level security ---------------------------------------------------
alter table pageviews enable row level security;
alter table events    enable row level security;
alter table content   enable row level security;

-- anyone (anon) may RECORD a visit/event; only logged-in admin may READ/DELETE
create policy "pv insert"  on pageviews for insert to anon, authenticated with check (true);
create policy "pv read"    on pageviews for select to authenticated using (true);
create policy "pv delete"  on pageviews for delete to authenticated using (true);

create policy "ev insert"  on events for insert to anon, authenticated with check (true);
create policy "ev read"    on events for select to authenticated using (true);
create policy "ev delete"  on events for delete to authenticated using (true);

-- content is public to READ (the site needs it); only admin may WRITE
create policy "content read"   on content for select to anon, authenticated using (true);
create policy "content insert" on content for insert to authenticated with check (true);
create policy "content update" on content for update to authenticated using (true);
```

## 3. Create the admin user
**Authentication → Users → Add user** (email + password). The login form maps
the username to an email by appending `@dcgnrg.local`, so to keep
username `dcgnrg` / password `dcgnrg`:

- **Email:** `dcgnrg@dcgnrg.local`
- **Password:** `dcgnrg`  (pick something stronger if you like)
- Turn **Auto Confirm User** on (or confirm it) so it can log in immediately.

> The login is now real: the password is verified by Supabase, not embedded in
> the front-end. RLS guarantees only this logged-in user can read analytics and
> edit content.

## 4. Wire the keys
- **Local dev:** copy `.env.example` → `.env` and fill in the two values, then
  `npm run dev`.
- **Netlify:** Site settings → Environment variables → add `VITE_SUPABASE_URL`
  and `VITE_SUPABASE_ANON_KEY`, then redeploy.
- **GitHub Pages:** these are injected at build time. Set them in the shell
  before building, e.g. `VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npm run build`
  (or add a GitHub Actions secret if you automate the gh-pages deploy).

## 5. CORS
No extra CORS config is needed — Supabase allows requests from any origin to the
REST/Auth endpoints by default; RLS is what protects the data.

---

Without these env vars the app stays in **localStorage mode** (login `dcgnrg` /
`dcgnrg`, data per-browser). With them set, everything switches to Supabase
automatically — no code change required.
