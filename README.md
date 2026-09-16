# HydrationTracker

A small household hydration tracker for up to 4 people. Log drinks and food
(converted to fluid-oz equivalents), get a personalized daily goal based on
gender/height/weight, and watch an animated water glass fill up.

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Database:** [Neon](https://neon.com) (serverless Postgres), queried directly from the browser via `@neondatabase/serverless`
- **Hosting:** GitHub Pages, auto-deployed from this repo via GitHub Actions

## Architecture: just GitHub and Neon, nothing else

This app has **no server component at all**. It's a static site (built by
Vite, hosted on GitHub Pages) whose client-side JavaScript talks straight to
Neon's Postgres over HTTPS. There's no Render/Vercel/Node process to keep
alive, which also means there's no "free tier spins down after inactivity"
problem - GitHub Pages just serves files and is always up.

**The trade-off, stated plainly:** the Neon connection string lives in
`src/lib/db.ts` and ships in the JavaScript bundle anyone downloads when
they open the page. There is no login and no server-side secret. Anyone who
has this app's URL and opens their browser's dev tools can read that
connection string and get full read/write/delete access to this Neon
database. That's an acceptable trade-off for a small household tool with
nothing sensitive in it, but it's worth knowing plainly rather than
discovering by accident. If that ever needs to change, two ways back out:

1. Put a real server back in front of the database (see this repo's git
   history for the previous Next.js + Render version).
2. Move to Supabase and use its public "anon" key protected by Row Level
   Security instead of a raw Postgres credential - see the sibling
   `careconnect` app for that pattern.

## 1. Set up the database (Neon)

The Neon project and its `users` / `drink_types` / `food_items` / `logs`
tables already exist (created by the earlier Next.js version of this app).
If you're starting a brand-new Neon project instead, run the SQL in
`schema.sql` (or equivalent `CREATE TABLE` statements) against it first,
then update the `DATABASE_URL` constant in `src/lib/db.ts` and
`scripts/seed.mjs`.

## 2. Install dependencies and run locally

```bash
npm install
npm run dev
```

Visit the local URL Vite prints. Since profiles already exist in the
database, you'll land on the profile picker; use **Add profile** to create
a new one.

## 3. Seeding new drink types / foods

`scripts/seed.mjs` is a one-off admin script (not part of the deployed
app) that adds any new rows to `DRINKS`/`FOODS` there without touching
existing rows, overrides, or logged history:

```bash
npm run seed
```

## 4. Deploy

Push to `main` on GitHub. `.github/workflows/deploy.yml` builds the Vite
app and publishes `dist/` to GitHub Pages automatically - no separate
hosting account, no environment variables to configure, nothing else to
keep alive. Make sure GitHub Pages is enabled for this repo under
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Notes on the daily goal formula

The personalized goal (`src/lib/goal.ts`) starts from the U.S. National
Academies (NASEM) Dietary Reference Intake for total water (~125 fl oz/day
for men, ~91 fl oz/day for women, at reference body weights), scaled by each
user's actual weight and lightly adjusted for height. **This is a general
wellness estimate, not medical advice** - it doesn't account for activity
level, climate, pregnancy, medications, or medical conditions. Every
profile's goal can be manually overridden under Manage profiles, or with
the +/- stepper on the dashboard.

## Notes on food conversions

`scripts/seed.mjs` seeds a curated table of common foods with approximate
fluid-oz-equivalent values per serving (each with a short source note).
These are practical estimates for a personal tracker, not lab-grade
nutrition data - add or adjust rows there any time; no other code changes
needed.
