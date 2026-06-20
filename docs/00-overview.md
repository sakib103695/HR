# 00 — Overview & Principles

## The problem in one line

> You run ads, get a flood of applicants, and most of your time is wasted reading CVs and
> interviewing people who were never going to make it.

The pilot proved it: **124 applications, 6 genuinely strong candidates.** That's a 95% noise
rate. Interviewing even 30 of them would have burned days. The goal of this platform is to
**push the filtering work onto the funnel** so that by the time a human gets on a call, the
candidate has already proven they can do the job.

## What we're building

A hiring platform embedded in the Instaquirk website that handles the **entire lifecycle**:

- **Public side** — a careers page, individual job pages, and a clean application form
  (replacing Google Forms) that captures structured data + CV upload.
- **Candidate side** — after applying, candidates get a status page and, when approved, a
  link to the **story-driven online round**.
- **Admin side (you)** — a dashboard to review applicants, auto-scores and rankings,
  one-click stage approvals, the round submissions, interview scheduling, and **export at
  every stage**.

## Goals (ranked)

1. **Interview fewer, better people.** Success = the people you call are people you'd hire.
2. **100% managed in one place.** No more Google Forms + Drive + manual xlsx + OCR.
3. **A round that *attracts* top talent.** Strong people are bored by generic tests. A
   unique, story-driven challenge is itself a hiring magnet — and a self-filter (weak
   applicants don't finish it).
4. **Capture "comfort value" honestly.** Salary, hours, working style, what energizes them —
   gathered inside the experience, not as a dry form field that people game.
5. **Exportable, analyzable data at every stage.** You like to pull data locally and study it.
   The platform makes that a button, not a project.

## Design principles

### 1. The funnel does the filtering, not your calendar
Each stage removes more people than the last. Auto-scoring shortlists, the round filters by
effort and skill, and only a handful reach a human. Target funnel for a 124-applicant role:

```
124 apply  →  ~25 pass auto-screen  →  ~10 invited to round  →  ~4 finish well  →  2–3 interviews
```

### 2. Make candidates *do the work*, not *describe the work*
CVs are claims. The round is evidence. A WordPress dev fixes a broken plugin; a designer
redesigns a real screen; an SEO specialist audits a live page. You evaluate output, not adjectives.

### 3. Effort is a feature, not a bug
A round that takes real effort is *good*: it filters out spray-and-pray applicants and
leaves people who actually want *this* job. We keep it engaging (story, points, feedback) so
the right people enjoy it and the wrong people self-select out.

### 4. Structured data over free text
The pilot's salary column had `30k`, `30000`, `25`, and a full paragraph. Every field a human
will later sort or filter on must be structured (dropdowns, ranges, numbers) — free text only
where nuance genuinely matters.

### 5. Every stage is exportable
You should be able to download "everyone in the round stage for the SEO role, with scores and
comfort values" as a clean XLSX in one click. Offline analysis is a first-class workflow.

### 6. Role-agnostic engine, role-specific content
The pipeline, scoring engine, and export work the same for all 5 roles. Only the **rubric
weights**, **round challenges**, and **job copy** differ per role. Adding a 6th role later =
adding config, not rebuilding.

## Success metrics

| Metric | Pilot (manual) | Target (platform) |
|--------|----------------|-------------------|
| Time from "ad live" to shortlist | days (manual) | hours (auto-score) |
| Manual CV reads per hire | ~124 | ~10 (round finishers) |
| Interviews per hire | unknown / high | 2–4 |
| Salary data clean enough to sort | no | yes (structured) |
| Repeatable for next role | no | yes (config only) |
| Candidate experience | generic form | memorable, story-driven |

## Who the candidates are (from pilot data)

Mostly Bangladesh + South Asia based (phone prefixes `+880`, regional names), experience
ranging fresher → 10 years, expected salaries clustered **25k–50k BDT** for the WordPress role.
This informs copy tone (clear, English, remote-friendly), salary input ranges, and timezone
defaults for scheduling. See [02-data-model.md](./02-data-model.md) and
[07-job-posts.md](./07-job-posts.md).
