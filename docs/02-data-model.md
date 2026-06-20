# 02 — Data Model

The schema is designed to (a) absorb everything the pilot Google Form collected, (b) make
every sortable field structured, and (c) support strict forward-only pipeline transitions
with a full audit trail.

## Entities at a glance

```
Job ──< Application >── Candidate
                │
                ├──< StageEvent        (audit log of every transition)
                ├──< Score             (auto + manual, per dimension)
                ├──< RoundSession ──< RoundTaskResult
                ├──  ComfortProfile    (salary, hours, working style)
                ├──< InterviewEvent
                └──  Attachment (CV, portfolio files)
```

## Job

The thing you post. One row per open role.

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | |
| `slug` | string | URL: `/careers/senior-wordpress-developer` |
| `title` | string | e.g. "Senior WordPress Developer" |
| `role_key` | enum | `wordpress` \| `uiux` \| `smm` \| `marketer` \| `seo` — selects rubric + round |
| `description_md` | markdown | the JD ([07-job-posts.md](./07-job-posts.md)) |
| `employment_type` | enum | full-time / project / contract |
| `location_mode` | enum | remote / hybrid / onsite |
| `salary_range_min/max` | int | in a fixed currency (BDT) — used to sanity-check comfort values |
| `status` | enum | draft / open / paused / closed |
| `round_template_id` | fk | which story-driven round this role uses |
| `deadline_at` | datetime | optional application deadline |
| `created_at` / `updated_at` | datetime | |

## Candidate

A person. De-duplicated by email so re-applicants don't fork.

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | |
| `full_name` | string | |
| `email` | string (unique) | primary key for matching — fixes the pilot's name-matching pain |
| `phone` | string | normalized to E.164 where possible (`+8801…`) |
| `created_at` | datetime | |

> **Why email-keyed:** the pilot had to match CVs to form rows "by name, email-in-CV, or
> token overlap" and **6 candidates never matched**. Making email the join key eliminates
> that whole class of problem.

## Application

One candidate applying to one job. The core pipeline record.

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | |
| `job_id` | fk | |
| `candidate_id` | fk | |
| `stage` | enum | `applied` \| `screened` \| `round_invited` \| `round_submitted` \| `interview` \| `offer` \| `hired` \| `rejected` \| `withdrawn` |
| `current_org` | string | "Current Organization" from pilot form |
| `current_position` | string | |
| `years_experience` | decimal | **structured number** (pilot had `2.5 years`, `8.0`, `9` — normalize on intake) |
| `expected_salary_amount` | int | **structured** (pilot had `30k`, `30000`, `25`, paragraphs — parse + store clean) |
| `expected_salary_period` | enum | monthly / project / hourly |
| `portfolio_urls` | string[] | normalized list of URLs |
| `plugin_theme_answer` | text | role-specific long answer (the WP "active plugins/themes" question) |
| `cv_attachment_id` | fk | |
| `auto_score` | decimal | cached top-line score (0–100) |
| `source` | enum | ad / referral / direct / other — track which ads convert |
| `applied_at` | datetime | "Timestamp" from pilot form |

### Mapping from the pilot Google Form

| Pilot form column | New field |
|-------------------|-----------|
| Timestamp | `Application.applied_at` |
| Full Name | `Candidate.full_name` |
| Email | `Candidate.email` |
| Contact Number | `Candidate.phone` |
| Current Organization | `Application.current_org` |
| Current Position | `Application.current_position` |
| Total Year of Experience | `Application.years_experience` (parsed to decimal) |
| Expected Salary | `Application.expected_salary_amount` + `_period` (parsed) |
| Upload your CV | `Attachment` (file, not a Drive link) |
| Plugin/theme contribution answer | `Application.plugin_theme_answer` |
| Portfolio link | `Application.portfolio_urls[]` |

> The existing 124 responses can be **imported** as the platform's first dataset — see
> [06-export-analytics.md](./06-export-analytics.md#importing-the-pilot-data).

## StageEvent (audit log)

Immutable record of every pipeline move. Powers analytics and accountability.

| Field | Type |
|-------|------|
| `id` | uuid |
| `application_id` | fk |
| `from_stage` / `to_stage` | enum |
| `actor` | "system" or admin user id |
| `reason` | text (optional, required on reject if you choose) |
| `created_at` | datetime |

## Score

Per-dimension scores so you can re-weight without losing raw signals. Mirrors the pilot's
50/30/20 breakdown but generalized per role ([05-scoring-rubric.md](./05-scoring-rubric.md)).

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | |
| `application_id` | fk | |
| `kind` | enum | `cv_auto` \| `round_auto` \| `manual` |
| `dimension` | string | e.g. `technical_depth`, `portfolio`, `experience`, `round_task_1` |
| `points` | decimal | |
| `max_points` | decimal | |
| `evidence` | json | matched keywords, URLs found, notes — explains *why* the score |
| `created_at` | datetime | |

## ComfortProfile

The "comfort value" captured during the round — structured, so you can filter ("show me round
finishers under 35k who want full-time").

| Field | Type | Notes |
|-------|------|-------|
| `application_id` | fk | |
| `desired_salary_amount` | int | what they'd actually accept (may differ from `expected`) |
| `salary_flexibility` | enum | firm / negotiable / open |
| `weekly_hours` | int | capacity |
| `availability_start` | date | notice period |
| `work_style` | enum[] | async / sync / structured / autonomous |
| `motivators` | string[] | what energizes them (from in-story choices) |
| `comfort_notes` | text | free text, optional |

## RoundSession & RoundTaskResult

| RoundSession | Type |
|--------------|------|
| `id` | uuid |
| `application_id` | fk |
| `template_id` | fk |
| `status` | enum: invited / started / submitted / expired |
| `magic_token` | string (unique, expiring) |
| `started_at` / `submitted_at` | datetime |
| `total_score` | decimal |

| RoundTaskResult | Type |
|-----------------|------|
| `id` | uuid |
| `session_id` | fk |
| `task_key` | string |
| `response` | json (code, text, file ref, choices) |
| `auto_score` | decimal |
| `max_score` | decimal |
| `time_spent_sec` | int |

## InterviewEvent

| Field | Type |
|-------|------|
| `id` | uuid |
| `application_id` | fk |
| `scheduled_at` | datetime |
| `mode` | enum: video / phone / onsite |
| `scorecard` | json (your notes + decision) |
| `outcome` | enum: pending / pass / fail |

## Attachment

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | |
| `application_id` | fk | |
| `kind` | enum: cv / portfolio / round_upload | |
| `filename` | string | |
| `mime` | string | pdf, docx, png, jpg |
| `storage_url` | string | object storage key |
| `extracted_text` | text | parsed/OCR'd, cached for scoring & search |

## Enums summary

- **Stage:** `applied`, `screened`, `round_invited`, `round_submitted`, `interview`, `offer`, `hired`, `rejected`, `withdrawn`
- **Role key:** `wordpress`, `uiux`, `smm`, `marketer`, `seo`
- **Salary period:** `monthly`, `project`, `hourly`
- **Source:** `ad`, `referral`, `direct`, `other`

See [03-architecture.md](./03-architecture.md) for how this maps to actual storage tech.
