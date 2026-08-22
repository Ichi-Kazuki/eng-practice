# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo has two parts:

- `docs/` — product and design planning documents. These are the source of truth for scope and design decisions; read them before making product or visual changes.
  - `toefl-itp-prd.md` — PRD (problem statement, goals/non-goals, v1 requirements, decided open questions)
  - `toefl-itp-engineering-tasks.md` — engineering breakdown of the PRD into epics with a recommended build order
  - `design-plan.md` — design tokens (color, type, dial values) and layout rules for the public marketing page (LP), based on the `design-taste-frontend` skill
  - `design-plan-app.md` — design plan for the logged-in app screens (practice, mock test, review notebook, score dashboard), based on the `frontend-design` skill. Explicitly out of scope for `design-taste-frontend`; extends the same color/font tokens with its own layout metaphor
- `web/` — the actual Next.js application. All commands below run from `web/`.

The site is branded without "TOEFL" or "ITP" in any public-facing name (trademark reasons — see PRD). Internal docs/identifiers can reference the exam name since that's a factual description of the content, not branding.

## Commands

Run from `web/`:

```
npm run dev              # Next.js dev server (Turbopack)
npm run build             # production build (plain Next.js, no Cloudflare adapter)
npm run lint               # eslint
npm run preview            # opennextjs-cloudflare build, then wrangler preview (local Cloudflare Workers runtime)
npm run deploy              # opennextjs-cloudflare build, then wrangler deploy to Cloudflare
npm run cf-typegen            # regenerate cloudflare-env.d.ts after changing wrangler.jsonc bindings
npm run db:generate             # drizzle-kit generate — produce a SQL migration from src/db/schema.ts into migrations/
npm run db:migrate:local          # apply migrations/ to the local D1 (miniflare sqlite under .wrangler/)
npm run db:migrate:remote          # apply migrations/ to the real Cloudflare D1
```

No test runner is configured yet. CI (`.github/workflows/ci.yml`) runs `npm run lint` and `npm run build` on push/PR.

## Architecture

**Stack**: Next.js 16 (App Router, `src/app`) + Tailwind v4 + shadcn/ui, deployed to Cloudflare via `@opennextjs/cloudflare` (not the older `@cloudflare/next-on-pages`, which doesn't support Next.js 16).

- **Cloudflare bindings** are declared in `wrangler.jsonc` (D1 database `DB`, static `ASSETS`, a self-reference service binding) and typed via `npm run cf-typegen` into `cloudflare-env.d.ts`. Re-run typegen after editing bindings.
- `next.config.ts` calls `initOpenNextCloudflareForDev()` so `next dev` can read Cloudflare bindings locally.
- `open-next.config.ts` currently uses the default (no R2) incremental cache. Switch to the R2-backed cache override once an R2 bucket is provisioned.

**shadcn/ui setup**: `components.json` uses the `base-nova` preset (`@base-ui/react` primitives, not Radix) with Phosphor as the icon library (`@phosphor-icons/react` — not `lucide-react`, which was removed after init). Components live in `src/components/ui/`.

**Design tokens**: `src/app/globals.css` defines the color system as CSS variables under `:root`/`.dark`, generated from `docs/design-plan.md`'s token table (Zinc neutral base + one cobalt accent mapped to shadcn's `--primary`; `--success`/`--destructive` are separate semantic tokens for right/wrong-answer feedback, not the brand accent). Dark mode tokens are defined but there is no manual theme toggle yet (`prefers-color-scheme` only, per PRD).

**Fonts** (`src/app/layout.tsx` + `src/lib/fonts.ts`), loaded per-route rather than all globally:
- Noto Sans JP — default Japanese UI text (mapped to Tailwind's `font-sans`), loaded root-wide since the UI language is Japanese
- Geist / Geist Mono — English button labels / numeric displays (timer, scores); Geist Mono is `font-mono`
- Zen Kaku Gothic New (`src/lib/fonts.ts`) — LP headings only, not loaded globally
- Literata (`src/lib/fonts.ts`) — English reading-passage body text only, not loaded globally

**Product scope (v1, from the PRD)**: only Structure and Written Expression / Reading sections; Listening is deferred to a future phase (design data models so it can be added without reshaping the section model). Auth is Google-only. Score conversion is an unofficial estimate and must be labeled as such in the UI wherever shown.

**Data model** (`src/db/schema.ts`, Drizzle ORM on D1): `sections` (master table, keeps Listening pluggable later), `passages` (Reading bodies), `questions` (shared by all sections; `choices`/`correctIndex`/`explanation`; `status` draft → ai_verified → published gates visibility in practice/mock), `users` (Google `sub` is the natural key), `attempts` (one row per answer, `mode` practice|mock, used both for the review notebook and the score dashboard), `mock_sessions` (JSON `sections`/`answers` columns hold the whole exam's progress so a reload or dropped connection doesn't lose state — see PRD P0-2 acceptance criteria).

**Auth**: hand-rolled Google OAuth (no library) in `src/lib/auth/google.ts` — Cloudflare has no built-in Google-login helper the way Firebase/Supabase do. Flow: `/api/auth/login` builds the Google consent URL and drops a `state` cookie → `/api/auth/callback` exchanges the code, verifies the ID token against Google's JWKS via `jose`, upserts the user, then mints our own HS256 session JWT (`src/lib/auth/session.ts`) into an httpOnly `session` cookie. `getCurrentUser()` (`src/lib/auth/current-user.ts`) reads that cookie. **There is no `proxy.ts`**: Next.js 16's Proxy (the renamed `middleware.ts`) always runs on the Node.js runtime and cannot be forced to Edge, and `@opennextjs/cloudflare` 1.20.2 hard-fails the build (`Node.js middleware is not currently supported`) if one exists. Do not re-add a `proxy.ts` for auth gating without checking whether that adapter limitation has been lifted.

**Guest access**: Section practice and mock test do NOT require login (product decision — lower the barrier to just trying a question); only the review notebook and score dashboard do, since those need history tied to a durable account. This is handled by `src/lib/auth/active-identity.ts`, not by `getCurrentUser()` alone:
- `getOrCreateActiveIdentity()` — for Route Handlers and Server Actions only. Returns the real user if logged in, otherwise reads (or mints) a `guest_id` cookie and a matching synthetic row in `users` (`googleSub: "guest:<uuid>"`, empty email, name "ゲスト"), so `attempts`/`mock_sessions` foreign keys work unchanged. It calls `cookies().set()`, which Next.js only allows outside Server Component rendering — used from `/api/attempts`, `src/app/app/mock/actions.ts`, and the `startMockTest` Server Action.
- `getActiveIdentity()` — read-only counterpart for Server Components (`src/app/app/mock/[sessionId]/*`), which cannot set cookies. Returns `null` if there's neither a session nor an existing guest cookie, rather than creating one.
- `src/app/app/layout.tsx` no longer redirects unauthenticated visitors; each of `notebook/`, `notebook/practice/`, and `dashboard/` does its own `getCurrentUser()` + `redirect()` check instead. Don't move that check back up to the shared layout — that would re-block guest access to practice/mock.

**Admin** (`src/app/admin/`): gated by exact email match against the `ADMIN_EMAIL` secret (single-operator personal project, not a role system). CRUD for `questions`/`passages` via Server Actions in `src/app/admin/actions.ts`.

**Content seeding**: `scripts/seed-data.mjs` holds the original question/passage data as plain JS objects (it imports and spreads a few `seed-data-*-batch-*.mjs` files that were authored in parallel batches — merge new batches the same way rather than pasting huge arrays inline); `node scripts/generate-seed-sql.mjs` renders it all to `seed.sql` (handles SQL-quote escaping) for `wrangler d1 execute --file=./seed.sql`. Currently seeded at the PRD's v1 target: 120 Structure + 150 Reading = 270 questions across 25 passages. Growing/replacing content further should still happen continuously through the admin UI in practice (see `docs/toefl-itp-engineering-tasks.md` Epic 8) — none of these questions have had real human end-users try them yet, so treat the bank as a first pass worth revisiting, not a finished, never-touch-again artifact.

**Mock test scoring** (`src/lib/mock-scoring.ts`): raw percent-correct → scaled score (31–68) via a hand-built piecewise table, since ETS's real conversion table is unpublished. This is deliberately percentage-based (not raw-count-based) so it stays valid as the question bank grows past the real exam's 40/50-item counts.

## Deployment

Production secrets are never committed — `.dev.vars` (gitignored) is for local dev only. Before the first real deploy:

```
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
npx wrangler secret put ADMIN_EMAIL
npm run db:migrate:remote      # apply migrations/ to the real D1
npx wrangler d1 execute english-db --remote --file=./seed.sql   # (re-run after regenerating seed.sql for new content)
npm run deploy
```

The Google Cloud Console OAuth client (authorized redirect URI `https://<production-domain>/api/auth/callback`) has to be created through the Google account owner's own console access — an agent cannot provision it.

## Environment note

`web/AGENTS.md` (imported by `web/CLAUDE.md`) warns that this Next.js 16 install may differ from training data — check `node_modules/next/dist/docs/` before relying on remembered API shapes for App Router conventions.
