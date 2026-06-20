# 08 — Roadmap & Open Decisions

How to build this incrementally on the existing Next.js app, plus the decisions to lock before
writing code.

## Guiding approach

Ship a **thin vertical slice** end-to-end first (one role, apply → score → export), then add
the round, then polish. Each phase is independently useful — you could start hiring on Phase 1
alone and it would already beat Google Forms.

## Phase 0 — Foundation (1 slice of setup)

- [ ] Bump `next` off `14.0.0` to a patched 14.x (current pin has a security advisory).
- [ ] Add Postgres + Prisma; model the schema from [02-data-model.md](./02-data-model.md).
- [ ] Add object storage (S3/R2) + signed-URL upload helper.
- [ ] Add admin auth (Auth.js) and the `/admin` shell.
- [ ] Add transactional email (Resend/Postmark) with a couple of templates.

**Outcome:** empty but real app skeleton, deployable via the existing Docker/GHCR pipeline.

## Phase 1 — Apply → Screen → Export (the MVP)

- [ ] `/careers` + `/careers/[slug]` from `Job` records; seed the 5 posts from
      [07-job-posts.md](./07-job-posts.md).
- [ ] `/apply/[slug]` structured form + CV upload (PDF/DOCX/PNG/JPG).
- [ ] CV text extraction (`pdf-parse`/`mammoth`/Tesseract) as a background job.
- [ ] Scoring engine + WordPress rubric ([05-scoring-rubric.md](./05-scoring-rubric.md)); show
      ranked applicants in `/admin/applicants` with score breakdown + CV preview.
- [ ] Stage transitions (advance/reject) with `StageEvent` audit + templated emails.
- [ ] **XLSX/CSV export** ([06-export-analytics.md](./06-export-analytics.md)).
- [ ] **Import the pilot's 124 responses + CVs** to validate the scorer reproduces your
      hand-built Top 10 (calibration test).

**Outcome:** you can run a real hiring round end-to-end and export like the pilot — but automated.

## Phase 2 — The Story-Driven Round

- [ ] Round engine: `RoundTemplate` config + step renderer + resumable sessions + magic tokens
      ([04-online-round-storymode.md](./04-online-round-storymode.md)).
- [ ] Task types: MCQ/branch, text, upload/link, ranking, sliders (comfort capture).
- [ ] Build the **WordPress round** first (matches your data), then the other four.
- [ ] Round auto-scoring + strengths/gaps summary + `ComfortProfile`.
- [ ] `/admin/rounds`: side-by-side submission review; advance to interview.
- [ ] Story, copy, and the guide character ("Quirk"/"Mira").

**Outcome:** the differentiator is live — candidates do the job, you interview only finishers.

## Phase 3 — Interview, Offer, Onboarding

- [ ] Candidate self-scheduling against your availability.
- [ ] Auto-generated **interview pack** (CV + scores + round + comfort + suggested questions).
- [ ] Scorecards + offer tracking.
- [ ] **Story-based onboarding** ("Season 2") for hires
      ([04-online-round-storymode.md](./04-online-round-storymode.md#story-based-onboarding)).

## Phase 4 — Analytics, polish, scale

- [ ] `/admin/pipeline` funnel, score distributions, **source/ad attribution**, comfort-value
      analytics, calibration view.
- [ ] Rubric tuning UI (edit weights/keywords as config).
- [ ] Retention/auto-purge, rate limits, anti-cheat telemetry hardening.
- [ ] Add roles #6+ by config only.

## Suggested build order rationale

1. **Apply + score + export first** because it immediately replaces the painful manual
   pilot workflow and starts collecting clean data.
2. **Round second** because it's the high-value differentiator but depends on the pipeline
   existing.
3. **Interview/onboarding third** because it only matters once people reach the end.
4. **Analytics last** because it gets better the more real data has flowed through.

## Open decisions to lock before coding

These genuinely change the build — worth deciding up front:

| # | Decision | Default recommendation |
|---|----------|------------------------|
| 1 | **Hosting & DB** — managed Postgres + Vercel, or self-host via existing Docker? | Managed Postgres (Neon/Supabase/RDS) + keep Docker deploy; least ops |
| 2 | **Storage** — S3 / Cloudflare R2 / Backblaze? | R2 (cheap, S3-compatible, no egress fees) |
| 3 | **Email provider** | Resend (simple) or Postmark (deliverability) |
| 4 | **Router** — stay on `pages/` or migrate to app router? | Stay on `pages/` for speed; migrate later if needed |
| 5 | **Salary currency & ranges per role** | BDT; fill `{{SALARY}}` in [07-job-posts.md](./07-job-posts.md) |
| 6 | **Round deadline & AI-use policy** | 5-day deadline; "use any tools, we grade judgment" + personalized prompts |
| 7 | **WP round depth** — live sandbox container vs curated snippet | Start with snippet; graduate to container in Phase 4 |
| 8 | **Guide character identity** | Invent a mascot ("Quirk") for brand continuity |
| 9 | **Data retention window** for rejected candidates | 6 months, then purge files; keep aggregates |
| 10 | **Who are the admins** (just you, or a small team)? | Single admin to start; roles later |

## What I can do next

- **Start Phase 0/1 implementation** in the `HR` repo (Prisma schema, careers pages, apply
  form, scoring engine, export).
- **Write the pilot-import script** so the 124 existing applications load in and validate the
  scorer against your Top 10.
- **Draft the full WordPress round** content (the actual Day 1–4 story + tasks).
- **Refine any doc** here as decisions get locked.

Tell me which, and whether to begin coding or keep refining the design first.
