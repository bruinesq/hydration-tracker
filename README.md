# HydrationTracker

A small household hydration tracker for up to 4 people. Log drinks and food
(converted to fluid-oz equivalents), get a personalized daily goal based on
gender/height/weight, and watch an animated water glass fill up.

- **Frontend/backend:** Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Database:** [Neon](https://neon.com) (serverless Postgres) via [Drizzle ORM](https://orm.drizzle.team)
- **Hosting:** [Render](https://render.com), auto-deployed from this GitHub repo

## 1. Set up the database (Neon)

1. Create a free account/project at [neon.com](https://neon.com).
2. In the Neon dashboard, open your project's **Connection Details** and copy the
   **pooled connection string** (starts with `postgresql://...`).
3. Copy `.env.local.example` to `.env.local` and paste the connection string in as `DATABASE_URL`.

## 2. Install dependencies and push the schema

```bash
npm install
npm run db:push   # creates the users/drink_types/food_items/logs tables in Neon
npm run db:seed   # seeds the drink types and food-to-fluid-oz conversion table
```

## 3. Run locally

```bash
npm run dev
```

Visit http://localhost:3000. Since no profiles are seeded, you'll land on
"Add your first profile" - fill in name/gender/height/weight and a daily
goal is calculated automatically (you can override it any time under
**Manage profiles**).

## 4. Deploy

### GitHub
Push this repo to GitHub (see the accompanying setup instructions if you're
doing this for the first time).

### Render
1. Create a free account at [render.com](https://render.com) and connect your GitHub account.
2. **New +** → **Web Service** → select this repo.
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Add an environment variable `DATABASE_URL` with your Neon pooled connection string.
6. Deploy. Every push to `main` will auto-deploy.

Note: Render's free tier spins the service down after periods of
inactivity, so the first request after a while will be a bit slow to wake
back up - normal for a small household app.

## Notes on the daily goal formula

The personalized goal (`src/lib/goal.ts`) starts from the U.S. National
Academies (NASEM) Dietary Reference Intake for total water (~125 fl oz/day
for men, ~91 fl oz/day for women, at reference body weights), scaled by each
user's actual weight and lightly adjusted for height. **This is a general
wellness estimate, not medical advice** - it doesn't account for activity
level, climate, pregnancy, medications, or medical conditions. Every
profile's goal can be manually overridden under Manage profiles.

## Notes on food conversions

`src/db/seed.ts` seeds a curated table of common foods with approximate
fluid-oz-equivalent values per serving (each with a short source note).
These are practical estimates for a personal tracker, not lab-grade
nutrition data - add or adjust rows there any time; no code changes needed
elsewhere.
