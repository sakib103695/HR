# 01 — Hiring Pipeline

The pipeline is the backbone of the platform. Every application moves through the same
ordered **stages**, each protected by an **approval gate** that only you (admin) can open.

## Stages

| # | Stage | Who acts | Gate to advance |
|---|-------|----------|-----------------|
| 1 | **Applied** | Candidate submits form + CV | Auto-screen runs immediately |
| 2 | **Screened** | System auto-scores & ranks | Admin shortlists (manual) |
| 3 | **Round Invited** | Candidate gets round link | Candidate completes round |
| 4 | **Round Submitted** | System auto-scores round | Admin reviews & advances |
| 5 | **Interview** | Admin schedules + interviews | Admin decision |
| 6 | **Offer** | Admin sends offer | Candidate accepts |
| 7 | **Hired / Onboarding** | Onboarding begins | — |
| — | **Rejected** | (terminal, from any stage) | — |
| — | **Withdrawn** | (terminal, candidate-initiated) | — |

> **Rule:** a candidate can only ever move *forward one stage* or to a terminal state
> (`Rejected` / `Withdrawn`). No skipping. Every transition is timestamped and attributed,
> giving you a clean audit trail and accurate funnel analytics.

## Stage detail

### Stage 1 — Applied
The candidate fills the structured application form (see [02-data-model.md](./02-data-model.md))
and uploads a CV. On submit:
- File is stored, virus/size/type-checked (PDF, DOCX, PNG, JPG accepted — matching pilot reality).
- A `Candidate` + `Application` record is created.
- **Auto-screen** runs synchronously: CV text is extracted (PDF/DOCX parse, OCR fallback for
  images), and an initial score is computed against the role's rubric ([05-scoring-rubric.md](./05-scoring-rubric.md)).
- Candidate sees a confirmation + a personal status link.

### Stage 2 — Screened (auto-score + admin shortlist)
The admin dashboard shows all applicants for a role, **ranked by auto-score**, with the
score breakdown (technical / portfolio / experience), CV preview, and parsed highlights.
You can:
- Sort/filter by score, experience, expected salary, keywords.
- **Bulk-advance** the top N, or advance individuals.
- Reject (with optional templated email) the rest.

This is where 124 → ~25 happens, in minutes instead of days.

### Stage 3 — Round Invited
Advancing a candidate sends an automated email: "You're through to the Instaquirk Challenge."
The email contains a **unique, expiring link** to the story-driven round
([04-online-round-storymode.md](./04-online-round-storymode.md)). The round is role-specific.
- A deadline is set (e.g. 5 days). The link works once-per-candidate and tracks progress so
  they can resume.
- No-shows auto-flag after the deadline so you can sweep them.

### Stage 4 — Round Submitted
On completion, the round produces a **submission bundle**: the candidate's work product,
auto-scored sub-tasks, captured **comfort values** (salary, hours, working style), and a
narrative summary. The admin reviews submissions side-by-side and advances the strongest.
This is where ~25 → ~4 happens, and it's the stage that lets you **skip straight to interview
with confidence** because you've already seen them work.

### Stage 5 — Interview
Only the few who proved themselves. The platform provides:
- A scheduling link (candidate picks a slot from your availability).
- An **interview pack** per candidate: CV + auto-score + round submission + comfort values +
  suggested questions auto-generated from gaps the round surfaced.
- A scorecard form for your notes/decision.

### Stage 6 — Offer
Generate and send an offer (templated). Track accepted / declined / negotiating.

### Stage 7 — Hired / Onboarding
The "story-based onboarding" you mentioned lives here: the new hire's first days are framed
as a continuation of the round's story (same world, now they're "on the team"). See
[04-online-round-storymode.md](./04-online-round-storymode.md#story-based-onboarding).

## Approval gates & permissions

- **Only admins** can advance, reject, or move candidates between stages.
- Every gate action is logged: who, when, from-stage, to-stage, optional note.
- Optional: require a reason on rejection (feeds analytics + protects against bias).

## Candidate journey (what the applicant sees)

```
Apply  →  "Application received" + status link
          │
          ├─ (rejected)  →  polite email, status page shows "closed"
          │
          └─ (advanced)  →  email: "You're invited to the Instaquirk Challenge"
                            │
                            ▼
                       Story-driven round (resumable, deadline)
                            │
                            ├─ (rejected)  →  thank-you + feedback option
                            │
                            └─ (advanced)  →  "Pick your interview slot"
                                              │
                                              ▼
                                         Interview  →  Offer  →  Onboarding story
```

A single **status page** (one per candidate, magic-link access) reflects their current stage
at all times — no "did they get my email?" anxiety, fewer "what's the status?" emails to you.

## Admin journey (what you see)

```
Dashboard
 ├─ Jobs ......... create/edit/close posts, per-role settings
 ├─ Applicants ... ranked table per role, filters, bulk actions, CV preview
 ├─ Rounds ....... submissions, auto-scores, comfort values, side-by-side compare
 ├─ Interviews ... schedule, interview packs, scorecards
 ├─ Pipeline ..... funnel view (counts per stage per role)
 └─ Export ....... one-click CSV/XLSX for any stage/role/filter
```

## Funnel analytics

The pipeline's strict forward-only transitions make analytics trivial and trustworthy:
conversion rate per stage, time-in-stage, drop-off points, score-vs-outcome correlation
(does a high auto-score predict a good round? tune the rubric over time). See
[06-export-analytics.md](./06-export-analytics.md).
