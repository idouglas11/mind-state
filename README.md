# Mind State

Code extracted from `Mind State Basic _ Base44.pdf` (a Base44 "Save as PDF" source export) and wired up as a runnable Vite + React app.

## Run it

```
npm install
npm run dev
```

## What this is

Base44 apps are Vite + React + react-router-dom + Tailwind under the hood, not Next.js — so this was kept as Vite (confirmed with you before scaffolding).

## What was extracted vs. added

The PDF export listed "25 files" and that's exactly what's under `src/` and `tailwind.config.js` — the pages, layout, page-routing config, and two journal components. Everything else in this repo was added so the extracted code would actually run:

- **`src/utils.js`, `src/lib/query-client.js`** — small, mechanical platform helpers, safely reconstructed from how they're called.
- **`src/lib/AuthContext.jsx`, `src/lib/NavigationTracker.jsx`, `src/lib/PageNotFound.jsx`, `src/components/UserNotRegisteredError.jsx`** — Base44 injects these automatically; they're stubbed here (auth always "logged in", tracker is a no-op) so the app boots.
- **`src/api/base44Client.js`** — Base44's hosted database SDK isn't something a PDF can export. This talks to a real Supabase Postgres database instead (see below), with the same `base44.entities.<Entity>.list/filter/create/update/delete` shape the pages expect.
- **`src/components/ui/*`** — standard shadcn/ui primitives (button, input, textarea, dialog, select, alert-dialog, toaster). Generic library code, not app-specific.
- **Anything rendering "wasn't included in the PDF export"** — `MoodSelector`, `GratitudeInput`, `ReflectionsTab`, `LittleMemoriesTab`, `ValuesIdentityWorksheet`, `LimitingBeliefsWorksheet`, `LifeTimelineWorksheet`, `SelfConceptWheel`, `SectionPanel`. These are referenced by the pages but weren't among the 25 exported files (Base44's PDF export only grabs the files open/expanded in its file panel). Their actual implementations live only in your Base44 project — re-export them from there, or rebuild them, to restore that part of the UI.

## About the extraction itself

PDF text extraction doesn't preserve source code perfectly — very long lines got soft-wrapped in Base44's code viewer and needed rejoining, and a handful of emoji/em-dash characters were mangled by the PDF's font encoding. Both were fixed by cross-checking against the PDF's word-position data and validating every file parses as valid JS. If you spot anything that still looks off (an unlikely-looking string, an odd line break), it's worth a quick compare against the original PDF.

## Backend: Supabase (free tier)

Real data, not a local mock. One Postgres project (`anna-journal`), free tier, single table:

```sql
create table app_records (
  id uuid primary key default gen_random_uuid(),
  entity text not null,           -- e.g. "Affirmation", "JournalEntry", "MorningPractice"...
  data jsonb not null default '{}',
  owner uuid not null default auth.uid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
```

Every entity the app uses (`Affirmation`, `JournalEntry`, `MorningPractice`, `MorningPracticeTemplate`, `EveningPractice`, `EveningPracticeTemplate`, `Values`, `Goals`-related fields on `Values`, `DPJEntry`, `WorksheetResponse`, `DailyRecord`, `ThoughtReframe`, `PrimingEntry`, `SelfConcept`, `WeeklyPlan`, `Archive`) shares this one table, distinguished by the `entity` column — no per-entity migrations needed as the app grows.

**Auth:** simple Supabase email/password login (`src/lib/AuthContext.jsx` + a login screen + a change-password option in the account menu), one account: `anna@leat.nz`.

**Security, as actually configured (not just intended):**
- RLS policy scopes every row to `owner = auth.uid()` — even if a second account existed, it could never see this data. `owner` defaults to the inserting user automatically, so the app code never has to set it.
- Public sign-up is **disabled** at the Supabase project level (Authentication → Sign In/Providers). Without this, anyone with the site's URL could call the public signup API directly (bypassing the login form entirely) and create their own authenticated account — this was tested and confirmed possible before the setting was turned off, so don't re-enable it without also re-checking the RLS policy holds up.
- The anon/publishable key in `.env` and baked into the deployed JS bundle is meant to be public — Supabase's model relies on RLS + auth for protection, not key secrecy.
- No AI/LLM calls anywhere in the app, so prompt injection isn't an applicable risk here.

**Config:** connection details live in `.env` (gitignored) as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — both safe to expose client-side (RLS is what actually protects the data, not key secrecy). If you ever need to recreate `.env`:

```
VITE_SUPABASE_URL=https://clqwtcjcykuxlqfsveur.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_SnydxgRiz1X6qxachB5jkw_VjPs7m5Q
```

Manage the project at [supabase.com/dashboard/project/clqwtcjcykuxlqfsveur](https://supabase.com/dashboard/project/clqwtcjcykuxlqfsveur).
