# 03 — Architecture

Built **on top of the existing repo** — a Next.js 14 app (`pages/` router, React 18, Dockerized,
CI/CD to GHCR already wired). We extend it rather than start over.

> **Note on the current dependency:** the repo pins `next@14.0.0`, which npm flags with a known
> security advisory. Bump to a patched 14.x as part of foundation work ([08-roadmap.md](./08-roadmap.md)).

## High-level shape

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js app (existing repo)                                 │
│                                                              │
│  Public                    Admin (auth-gated)                │
│  ─ /careers                ─ /admin/jobs                     │
│  ─ /careers/[slug]         ─ /admin/applicants               │
│  ─ /apply/[slug]           ─ /admin/rounds                   │
│  ─ /status/[token]         ─ /admin/interviews               │
│  ─ /round/[token]          ─ /admin/export                   │
│                                                              │
│  API routes (pages/api/* or app route handlers)             │
│  ─ applications  ─ scoring  ─ rounds  ─ export  ─ webhooks   │
└───────────────┬───────────────────────┬─────────────────────┘
                │                        │
        ┌───────▼───────┐        ┌───────▼────────┐
        │  Database     │        │ Object storage │
        │  (Postgres)   │        │ (CVs, uploads) │
        └───────────────┘        └────────────────┘
                │
        ┌───────▼────────────────────────────────┐
        │ Background jobs: CV parse, OCR, scoring,│
        │ email sends, export builds              │
        └─────────────────────────────────────────┘
```

## Stack recommendation

| Concern | Recommendation | Why |
|---------|----------------|-----|
| Framework | **Keep Next.js 14** (existing) | Already set up, Dockerized, CI/CD live |
| Database | **PostgreSQL** + Prisma ORM | Relational fits the pipeline; Prisma gives typed schema + migrations matching [02-data-model.md](./02-data-model.md) |
| File storage | **S3-compatible** (AWS S3 / Cloudflare R2 / Backblaze) | CVs and round uploads; cheap, signed URLs |
| Auth (admin) | **NextAuth / Auth.js** (email or OAuth) | Small admin team; magic-link is enough |
| Auth (candidate) | **Magic-link tokens** (no password) | Candidates only need their status + round link |
| Email | **Resend / Postmark / SES** | Transactional: confirmations, invites, scheduling |
| CV text extraction | `pdf-parse` (PDF), `mammoth` (DOCX), **Tesseract** (image OCR) | Matches the 118 PDF / 4 DOCX / 2 image reality |
| Background jobs | **Inngest** or a simple queue (BullMQ + Redis) | Parsing/OCR/scoring/export shouldn't block requests |
| Export | `exceljs` (XLSX) + native CSV | Reproduces the pilot's xlsx workflow as a button |
| Hosting | **Docker** (already) → any container host, or Vercel for the web + managed Postgres | Keep the existing Docker/GHCR pipeline |

> These are defaults, not dogma. Postgres + Prisma + S3 + Resend is a boring, proven stack
> that one person can operate. Swap pieces if you already pay for alternatives.

## Why this fits "100% managed"

- **One system, one login.** Jobs, applicants, rounds, interviews, exports — all in
  `/admin`. No Google Forms, no Drive folder, no separate spreadsheet.
- **Automated intake.** Apply → store CV → parse → OCR if needed → score → rank, with zero
  manual steps. The pilot did all of this by hand.
- **Automated comms.** Confirmations, round invites, rejections, interview scheduling — all
  templated and triggered by stage transitions.
- **Self-service candidate status.** Cuts the "what's my status?" support load to near zero.

## Key flows

### Application intake (synchronous + async)
```
POST /api/applications
  → validate + store Application/Candidate
  → store CV to object storage
  → enqueue: extract text → (OCR if image) → score against role rubric
  → return confirmation + status token
```
The score appears within seconds; the candidate isn't blocked waiting on OCR.

### Scoring engine
A pure module: `score(application, role_rubric) → { dimensions[], total }`. Deterministic and
**explainable** — every point traces to matched keywords/URLs (stored in `Score.evidence`).
Same engine for CV auto-score and round auto-score. See [05-scoring-rubric.md](./05-scoring-rubric.md).

### Round delivery
The round is a sequence of steps defined by a **RoundTemplate** (JSON/config per role). The
`/round/[token]` page renders steps, saves progress per step (resumable), and on submit runs
auto-scoring + builds the submission bundle. See [04-online-round-storymode.md](./04-online-round-storymode.md).

### Export
`GET /api/export?stage=round_submitted&role=seo&format=xlsx` → builds a workbook server-side
(via a background job for large sets) → returns a signed download URL. See
[06-export-analytics.md](./06-export-analytics.md).

## Security & integrity

- **File upload hardening:** type/size allowlist, store outside web root, signed URLs, scan
  for malware where possible.
- **Magic tokens** are single-purpose, expiring, and rate-limited.
- **Admin routes** fully auth-gated; all stage actions audit-logged (`StageEvent`).
- **PII:** CVs and contact data are personal data — restrict access, set retention (auto-purge
  rejected candidates after N months), and keep an export/delete capability.
- **Round anti-cheat:** see [04-online-round-storymode.md](./04-online-round-storymode.md#integrity--anti-cheat).

## What we reuse from the existing repo

- The Next.js app shell, `styles/`, Docker build, and GHCR publish pipeline.
- Add `prisma/`, `lib/` (scoring, parsing, export), `pages/api/` routes (or migrate to the
  app router), and the `/admin` + public career pages.

See [08-roadmap.md](./08-roadmap.md) for the phased build.
