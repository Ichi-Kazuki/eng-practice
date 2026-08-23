# AGENTS.md

Repository guidance derived from `CLAUDE.md`. Keep this file aligned with `CLAUDE.md` when project conventions change.

## Repository

This is a Japanese-language English practice application for Grammar/Structure and Reading questions. The public brand is `英語演習`; do not use “TOEFL” or “ITP” in public-facing product names. Internal docs and identifiers may describe the exam format factually.

- `docs/` — product requirements, engineering tasks, design plans, and UI/UX review
- `web/` — deployable Next.js application; run commands from here
- `web/src/app/` — App Router pages, layouts, Route Handlers, and Server Actions
- `web/src/components/` — shared UI and shadcn primitives
- `web/src/db/schema.ts` — Drizzle/D1 schema
- `web/src/lib/auth/` — Google OAuth, sessions, admin checks, and guest identity
- `web/src/lib/mock-session.ts` — mock question selection and timing
- `web/src/lib/mock-scoring.ts` — unofficial score estimates
- `web/src/lib/notebook.ts` — mistake notebook and mastery logic
- `web/scripts/seed-data*.mjs` — source content; `seed.sql` is generated

Before product or visual changes, read the relevant source-of-truth document: `docs/toefl-itp-prd.md`, `docs/toefl-itp-engineering-tasks.md`, `docs/design-plan.md`, `docs/design-plan-app.md`, or `docs/UI_UX_IMPLEMENTATION_REVIEW.md`.

## Stack and framework rules

- Next.js 16.3.2 App Router, React 19, strict TypeScript, and `@/*` -> `src/*`
- Tailwind v4 and shadcn/ui `base-nova` using `@base-ui/react`
- Phosphor icons (`@phosphor-icons/react`), not Lucide
- Drizzle ORM over Cloudflare D1
- OpenNext deployed to Cloudflare Workers

`web/CLAUDE.md` imports `web/AGENTS.md`, which contains a generated warning that this Next.js install may differ from remembered APIs. Before changing App Router conventions, read the relevant guide under `web/node_modules/next/dist/docs/`. Do not remove that generated warning.

Use Server Components by default. Add `"use client"` only for browser state, effects, events, or browser APIs. Keep secrets, database access, ownership checks, and authoritative validation on the server.

## Commands and verification

Run from `web/` with Node.js 22 and npm:

```bash
npm ci
npm run dev
npm run lint
npm run build
npm run preview
npm run cf-typegen
npm run db:generate
npm run db:migrate:local
```

There is no test runner. For code changes, run `npm run lint` and `npm run build`; CI runs both on pull requests and pushes to `main`. Use browser checks for UI changes. `db:migrate:remote`, seed execution, secret changes, and deployment are production operations and require explicit user authorization.

## Product invariants

- V1 supports Grammar/Structure and Reading. Listening remains pluggable but unavailable.
- Practice and mock tests are guest-accessible. `guest_id` maps to a synthetic `users` row so attempts and mock sessions persist.
- Notebook and dashboard require a real Google-authenticated user. Do not gate the whole `/app` layout.
- `getOrCreateActiveIdentity()` may set cookies and is for Route Handlers/Server Actions. Server Components use read-only `getActiveIdentity()`.
- Do not add `proxy.ts` or `middleware.ts` for auth without verifying current OpenNext support; the installed adapter rejects Node.js middleware.
- Google OAuth is hand-rolled under `src/lib/auth/`; the callback verifies the ID token and creates an httpOnly HS256 session cookie.
- Admin authorization prefers `ADMIN_GOOGLE_SUB`; `ADMIN_EMAIL` is only a migration fallback. Check it server-side.
- Learner-facing practice/mock selection must use only `published` questions. Content must be original, not copied or closely adapted from official questions.
- Score displays must say they are unofficial estimates and omit Listening.
- Notebook mistakes leave the list only after two consecutive correct answers.
- Mock progress is stored in `mock_sessions.sections` and `mock_sessions.answers` and must survive reloads.
- Validate all IDs, indices, form data, JSON bodies, and resource ownership at server boundaries.

## Cloudflare and database constraints

Bindings in `web/wrangler.jsonc` include `DB`, `ASSETS`, `WORKER_SELF_REFERENCE`, and `ATTEMPTS_RATE_LIMITER` (60 answer submissions per 60 seconds per client IP).

`cloudflare-env.d.ts` is generated and gitignored; never edit it manually. Run `npm run cf-typegen` if binding types are missing or stale. Secret bindings are augmented separately in `src/env.d.ts`.

D1 queries in this project must keep bound parameters to 100 or fewer. Chunk large `inArray(...)` queries into batches of at most 100.

For schema changes: edit `src/db/schema.ts`, run `npm run db:generate`, inspect the migration, apply locally, and verify the affected flow.

## Content and UI

`scripts/seed-data.mjs` composes split batch modules. Add large content as another batch module and regenerate `seed.sql` with `node scripts/generate-seed-sql.mjs`. The target bank is 120 Grammar/Structure and 150 Reading questions across 25 passages. Preserve the `draft` -> `ai_verified` -> `published` review pipeline.

User-facing copy is Japanese; passages, stems, and choices are English. Preserve the Zinc/cobalt token system in `src/app/globals.css`, separate success/destructive feedback colors, Noto Sans JP UI font, Geist numeric/control fonts, and Literata reading-passage font. Reuse existing components and CSS variables. Maintain keyboard access, focus visibility, semantic headings, contrast, and reduced-motion behavior.

## Security and hygiene

- Never commit `.dev.vars`, other environment files, secrets, `cloudflare-env.d.ts`, `.wrangler/`, `.open-next/`, or `.next/` output.
- Security headers and CSP live in `next.config.ts`; consider Next.js hydration and OpenNext constraints before changing them.
- Account and guest deletion derive user identity from trusted session/cookie state, never a client-supplied user ID.
- Preserve unrelated working-tree changes.

Expected production secrets are `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `ADMIN_GOOGLE_SUB`, and transitional `ADMIN_EMAIL`. Google OAuth client creation and redirect URI setup require the account owner’s console access.
