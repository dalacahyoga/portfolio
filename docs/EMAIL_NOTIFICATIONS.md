# Email notifications (new visitor + weekly report)

Two Supabase Edge Functions send email via [Resend](https://resend.com) (free tier):

- **`notify-visitor`** — emails you when a NEW visitor (unseen `vid`) arrives.
- **`weekly-report`** — emails a 7-day digest, run on a weekly schedule.

No secrets live in the repo — they're stored as Supabase secrets.

---

## 1. Resend (email provider)
1. Sign up at https://resend.com (free: 100 emails/day, 3,000/mo).
2. **API Keys → Create** → copy the key (`re_...`).
3. **From address:**
   - Quick test: use `onboarding@resend.dev` (default in code). In test mode Resend only delivers to **your Resend account email**, so set `NOTIFY_EMAIL` to that.
   - Production: verify your domain in Resend, then set `FROM_EMAIL` to e.g. `Portfolio <noreply@yourdomain.com>`.

## 2. Set Supabase secrets
Install the CLI (`npm i -g supabase`), then link & set secrets:
```bash
supabase login
supabase link --project-ref hecwcrhoyxbpzaczkpif
supabase secrets set \
  RESEND_API_KEY=re_xxx \
  NOTIFY_EMAIL=youremail@example.com \
  FROM_EMAIL="Portfolio <onboarding@resend.dev>"
```
(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.)

## 3. Deploy the functions
Via CLI:
```bash
supabase functions deploy notify-visitor --no-verify-jwt
supabase functions deploy weekly-report  --no-verify-jwt
```
Or **without the CLI**: Dashboard → **Edge Functions → Deploy a new function**,
then paste the code from `supabase/functions/<name>/index.ts`.

> **Important:** turn **Verify JWT OFF** for both functions, otherwise the
> webhook and cron (which call without an auth token) get `401`.

Function URLs become:
- `https://hecwcrhoyxbpzaczkpif.supabase.co/functions/v1/notify-visitor`
- `https://hecwcrhoyxbpzaczkpif.supabase.co/functions/v1/weekly-report`

## 4. New-visitor trigger (Database Webhook)
Supabase Dashboard → **Database → Webhooks → Create a new hook**:
- **Table:** `pageviews` · **Events:** `Insert`
- **Type:** HTTP Request · **Method:** `POST`
- **URL:** the `notify-visitor` function URL above
- Save. Every new page view pings the function; it only emails when the `vid` is new.

## 5. Weekly report (schedule)
Enable extensions (Dashboard → **Database → Extensions**): **`pg_cron`** and **`pg_net`**.
Then in **SQL Editor**:
```sql
-- if you previously scheduled a daily job, remove it first:
-- select cron.unschedule('daily-report');

-- runs every Monday at 01:00 UTC (08:00 WIB)
select cron.schedule(
  'weekly-report',
  '0 1 * * 1',
  $$
  select net.http_post(
    url := 'https://hecwcrhoyxbpzaczkpif.supabase.co/functions/v1/weekly-report',
    headers := '{"Content-Type":"application/json"}'::jsonb
  );
  $$
);
```
(No backend? Alternatively schedule a free weekly cron at https://cron-job.org to POST that URL.)

## Test
- New visitor: open the site in a fresh incognito window → you should get an email.
- Weekly report: run the function once manually —
  ```bash
  curl -X POST https://hecwcrhoyxbpzaczkpif.supabase.co/functions/v1/weekly-report
  ```

## Notes
- `notify-visitor` always returns HTTP 200 (even on errors) so the webhook doesn't retry-storm; check **Functions → Logs** in Supabase if email doesn't arrive.
- To reduce noise it only fires on the *first* page view of a `vid` (new device/browser), not every visit.
