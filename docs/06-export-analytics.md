# 06 — Export & Analytics

You explicitly want to **download data locally and analyze it** at each step — the pilot was
literally driven from an xlsx workbook. The platform makes that a first-class, one-click
workflow at every stage, and adds live analytics on top.

## Export, everywhere

Every list view in `/admin` (applicants, round submissions, interviews, a whole pipeline) has
an **Export** button. You pick:

- **Scope:** a role, a stage, a date range, or a custom filter (e.g. "SEO + round_submitted +
  desired_salary ≤ 35k").
- **Format:** **XLSX** (rich, multi-sheet) or **CSV** (raw, scriptable).

Server builds the file (via a background job for large sets) and returns a signed download link.

## XLSX export structure (mirrors your pilot workbook)

The pilot's "Top 10 CV Ranking.xlsx" had exactly the right shape. The platform reproduces and
generalizes it:

| Sheet | Contents |
|-------|----------|
| **Ranking** | One row per candidate, ranked by score: Rank, Name, Score/100, sub-scores, years, salary, portfolio, email, contact, CV link, "why they rank here" note |
| **Full Rankings (All)** | Every applicant in scope, same columns — for offline deep-dives |
| **Scoring Methodology** | Auto-generated from the role's rubric config — so the workbook is self-documenting, like your pilot's methodology sheet |
| **Comfort Values** | (round+ stages) desired salary, flexibility, hours, availability, work style, motivators |
| **Round Detail** | (round+ stages) per-task scores, time spent, strengths/gaps summary |
| **Funnel** | Stage counts + conversion rates for the scope |

> This means your existing manual artifact becomes a **generated** artifact — same analysis,
> zero manual labor, repeatable for every role.

## CSV export

Flat, one row per application, all structured fields. For when you want to drop it into
pandas/Sheets and run your own cuts. Stable column order, UTF-8, quoted.

## Importing the pilot data

The 124 existing responses shouldn't be thrown away — they seed the system and let you test
analytics on real data from day one.

- **`Instaquirk Developer form (Responses).xlsx`** → import as `Candidate` + `Application`
  rows for the WordPress job (the column mapping is in
  [02-data-model.md](./02-data-model.md#mapping-from-the-pilot-google-form)).
- **`Upload your CV (File responses)/`** (118 PDF, 4 DOCX, 2 images) → import as `Attachment`
  rows, run extraction + OCR, attach to the matching application by email.
- **`Instaquirk - Top 10 CV Ranking.xlsx`** → import as historical `Score` rows so the new
  auto-scorer can be validated against your hand-built ranking (does the engine reproduce your
  top 10? a great calibration test).

A one-off import script lives in the build plan ([08-roadmap.md](./08-roadmap.md)).

## Live analytics (the dashboard)

Beyond export, `/admin/pipeline` shows it live:

### Funnel view
Per role, counts and conversion at each stage:
```
Applied 124  →  Screened 124  →  Round invited 25  →  Round submitted 11  →  Interview 4  →  Offer 2  →  Hired 1
                                  (20% of screened)    (44% finished)       (36%)          (50%)
```
Instantly shows where you're losing good people (or not filtering enough).

### Score distribution
Histogram of CV and round scores (the pilot's was: 2 above 80, 4 in 60s, 14 in 50s, 19 in 40s,
85 below 40). Helps you set the shortlist cutoff intelligently per role.

### Source attribution
Since `Application.source` tracks ad vs referral vs direct, you can see **which ads bring
quality** (high mean score), not just volume — directly informing your ad spend.

### Comfort-value analytics
Distribution of desired salary, hours, availability among **round finishers** (the people you'd
actually hire). Answers "what will it cost to hire the top tier for this role?" before you
even interview.

### Calibration view
Correlate CV score → round score → interview outcome over time, so you can tune the rubric
([05-scoring-rubric.md](./05-scoring-rubric.md)) and trust it more each cycle.

## Retention & data hygiene

- Exports are PII — links are signed + expiring, downloads are logged.
- Configurable auto-purge of rejected candidates' files after N months (keep aggregate
  analytics, drop personal data) — see [03-architecture.md](./03-architecture.md#security--integrity).
