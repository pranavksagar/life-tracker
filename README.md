# Life Tracker

A single-user personal life-tracking app — part to-do list, part habit tracker,
part "agile for your own life." Track tasks, habits, exercise, food, goals, and
plan personal work in time-boxed **sprints**.

Built with **React + TypeScript + Vite**, **Tailwind v4** + **shadcn/ui**,
**Recharts**, and **Supabase** (Postgres + Auth) with row-level security. It's an
installable **PWA**, so it works on a phone home screen too.

---

## Quick start

```bash
npm install
cp .env.example .env.local      # then fill in your Supabase values (see below)
npm run dev
```

Open the printed URL (default http://localhost:5173). Without Supabase env vars
the app loads and tells you what's missing instead of crashing.

Scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run typecheck` | Type-check only |
| `npm run lint` | Lint with oxlint |
| `npm run preview` | Preview the production build (test the PWA/service worker) |

---

## Setting up Supabase

You need a free Supabase project. This takes about 5 minutes.

1. **Create a project** at <https://supabase.com> → *New project*. Pick a name and
   a database password (you won't need the password for this app).
2. **Get your keys.** In the project dashboard: *Project Settings → API*. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

   Put both in `.env.local`. These are browser-safe; your data stays private
   because every table is protected by row-level security. **Never** put the
   `service_role` key in this app.
3. **Enable email auth.** *Authentication → Providers → Email* — make sure it's
   enabled. For a solo project you may turn *Confirm email* off (under
   *Authentication → Sign In / Providers*) so sign-up logs you in immediately;
   leave it on if you want the confirmation step.
4. **Run the migrations.** Open *SQL Editor → New query*, then paste and run, in
   order:
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
5. **(Optional) Seed sample data.** First **sign up once in the app** so an auth
   user exists, then run `supabase/seed.sql` in the SQL Editor. It attaches demo
   areas, tasks, habits, logs, goals, and a sprint to your account so every
   screen has something to show.

That's it — restart `npm run dev` if it was already running so it picks up
`.env.local`.

---

## Architecture

```
src/
  lib/            # supabase client, env, query client, date + recurrence helpers
  data/           # the TYPED DATA-ACCESS LAYER — the only code that talks to Supabase
  hooks/          # React Query hooks wrapping the repositories (added per phase)
  components/
    ui/           # shadcn/ui primitives
    common/       # shared app components (shell, empty/error/loading states)
  pages/          # screen-level views (added per phase)
supabase/
  migrations/     # SQL schema + RLS policies
  seed.sql        # development sample data
```

**The data layer is the seam.** UI and hooks import repositories from
`src/data` (e.g. `tasksRepo`, `habitsRepo`) and the domain types from
`src/data/types`. Only `src/data/*` and `src/lib/supabase.ts` import the
Supabase SDK. To swap the backend later, reimplement the repositories — the UI
doesn't change.

Every repository call returns typed domain objects and throws a normalized
`DataError` (with friendly messages for permission/expiry/conflict cases) on
failure.

---

## Data model

All tables are owned by a Supabase auth user via a `user_id` column that
defaults to `auth.uid()`. **Row-level security** is enabled on every table with
identical owner-only policies for select/insert/update/delete, so a user can
only ever see or change their own rows.

| Table | Purpose | Key links |
| --- | --- | --- |
| `areas` | Top-level grouping (Health, Work, Personal…) | referenced by most tables |
| `sprints` | Time-boxed period with capacity + retro notes | contains goals & tasks |
| `goals` | Measurable objective with progress | → `areas`, `sprints` |
| `tasks` | To-dos with priority/status/tags/recurrence | → `areas`, `goals`, `sprints` |
| `habits` | Recurring habit with cadence + target | → `areas`, `goals` |
| `habit_logs` | One completion row per habit per day | → `habits` (cascade) |
| `exercise_logs` | Workout entries | → `areas` |
| `food_logs` | Meal entries (nutrition optional) | → `areas` |

Notable choices:

- **Tasks/habits link to at most one goal** (`goal_id` FK) — simple and enough
  for a solo tracker. Deleting a goal sets those links to null, never deletes
  the task/habit.
- **Streaks are computed** in the data/UI layer from `habit_logs`, not stored.
- **Recurrence** is a small JSON rule on tasks: `{ "freq": "daily|weekly|monthly", "interval": 1 }`.
- **Calendar dates** (`due_date`, `date`, …) are stored as `yyyy-mm-dd` and
  formatted from local components to avoid timezone off-by-one bugs.

---

## Offline, install & backups

- **Installable PWA.** On Chromium browsers, *Settings → Install app* offers an
  install button; on iOS use Safari's *Share → Add to Home Screen*. The app
  runs standalone with safe-area-aware layout.
- **Offline.** The app shell and assets are precached by a service worker, so it
  opens offline; an offline banner tells you changes will sync on reconnect, and
  you're prompted to reload when a new version is deployed.
- **Backups.** *Settings → Data backup* exports all your data to a JSON file and
  re-imports it. Import is idempotent (records merge by id), so restoring the
  same file twice is safe.

## Privacy & secrets

- Only the public anon key and project URL live in the client (`.env.local`),
  and `.env*` is gitignored. `.env.example` documents the shape.
- Data isolation is enforced server-side by RLS, not by the client.

## Build phases

The project was built in phases (scaffold → auth → tasks → habits →
exercise/food → goals/sprints → analytics → PWA polish). See the git history for
the per-phase commits.
