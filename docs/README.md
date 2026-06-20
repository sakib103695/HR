# Instaquirk Hiring Platform — Design Docs

A fully-managed, end-to-end hiring system built into the Instaquirk website. Post jobs,
collect applications, approve candidates stage-by-stage, run a fun **story-driven online
round**, and export clean data at every step so you interview *fewer, better* people.

## Why this exists

The first hiring round (WordPress Plugin/Theme Developer) drew **124 applicants**. After a
manual pipeline — download every CV, OCR the images, match names to a Google Form, hand-build
a scoring spreadsheet — only **2 candidates scored above 80/100** and just **6 above 60**.
Mean score: **34.6**. The signal was real but buried in noise, and the process didn't scale.

This platform turns that one-off manual effort into a repeatable, mostly-automated funnel.

## The funnel

```
  Ad / referral
        │
        ▼
   [1] Job post  ──►  [2] Apply  ──►  [3] Screen & approve  ──►  [4] Story-driven
   (public page)      (structured     (admin gate, auto-           online round
                       form + CV)       score, shortlist)           (skill + comfort)
                                                                         │
                                                                         ▼
                              [6] Hire / onboard  ◄──  [5] Interview  ◄──┘
                                                       (only the best
                                                        few, with full
                                                        submission data)
```

Every stage has an **approval gate** (you decide who advances) and an **export button**
(download the stage's data as CSV/XLSX for offline analysis).

## Documents

| # | Doc | What it covers |
|---|-----|----------------|
| 00 | [Overview & Principles](./00-overview.md) | Vision, goals, success metrics, design principles |
| 01 | [Hiring Pipeline](./01-hiring-pipeline.md) | Stages, statuses, approval gates, candidate & admin journeys |
| 02 | [Data Model](./02-data-model.md) | Entities, schema, status enums, mapped from existing form data |
| 03 | [Architecture](./03-architecture.md) | Tech stack on top of the existing Next.js app, storage, auth, email |
| 04 | [Online Round — Story Mode](./04-online-round-storymode.md) | The story-driven assessment: design, per-role challenges, comfort capture, anti-cheat |
| 05 | [Scoring & Ranking Rubric](./05-scoring-rubric.md) | Per-role rubrics generalizing the proven WordPress methodology |
| 06 | [Export & Analytics](./06-export-analytics.md) | Stage-by-stage export, formats, dashboards |
| 07 | [Job Posts](./07-job-posts.md) | Ready-to-publish JDs: WordPress Dev, UI/UX, SMM, Marketer, SEO |
| 08 | [Roadmap & Open Decisions](./08-roadmap.md) | Phased build plan, what to decide before building |

## Open roles this platform launches with

1. **Senior WordPress Developer** (plugin/theme) — the role already piloted
2. **UI/UX Designer**
3. **Social Media Manager**
4. **Performance Marketer**
5. **SEO Specialist**

## Status

These are **design documents**, not yet an implementation. They describe "the good way" to
build the system. See [08-roadmap.md](./08-roadmap.md) for the build sequence and the
decisions to lock before writing code.
