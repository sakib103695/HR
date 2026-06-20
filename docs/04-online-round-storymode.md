# 04 — The Online Round: Story Mode

This is the heart of the platform and the part you flagged as tricky. It has to be **fun,
engaging, unique, and story-driven**, while doing three serious jobs at once:

1. **Prove skill** — make the candidate actually *do the work* of the role.
2. **Surface gaps** — "point out all the things they need to work" — reveal strengths *and*
   weaknesses honestly.
3. **Capture comfort value** — salary, hours, working style, motivators — gathered *inside the
   story* so answers are honest, not gamed.

And it does a fourth job by existing: a memorable, well-crafted round is a **hiring magnet**
for strong people and a **self-filter** for weak ones (they won't finish it).

## The core idea: "Your First Week at Instaquirk"

The candidate is dropped into a narrative. They're **not taking a test** — they've "joined
Instaquirk" and it's their first week. A friendly in-story guide (a character — e.g.
"Quirk," the team mascot, or a fictional teammate "Mira") walks them through realistic
situations. Each situation is a **task** that doubles as an assessment.

Same world for everyone; the **missions are role-specific**. The story frame makes it
engaging; the tasks make it rigorous.

```
  Day 1 ── Onboarding & "comfort check-in"   (low-stakes, captures comfort value)
  Day 2 ── The real challenge                (the core skill task for the role)
  Day 3 ── A curveball / debugging moment     (surfaces depth & how they handle the unknown)
  Day 4 ── Communication & judgment           (write-up, prioritization, working style)
  Wrap ── "Reflection" + final comfort lock   (motivators, availability, salary they'd accept)
```

Candidates can pause and resume (progress saved per step). A soft deadline (e.g. 5 days)
keeps momentum. Total intended effort: **45–90 minutes** — enough to be real, short enough
that strong people will invest it.

## Why a story (not a generic test)

| Generic test | Story mode |
|--------------|------------|
| Feels like an exam, top talent skips it | Feels like a preview of the job, top talent leans in |
| Candidates game "right answers" | In-character choices reveal real preferences |
| Salary asked as a cold field | Comfort value emerges through the narrative |
| Boring → high drop-off of *everyone* | Engaging → drop-off concentrated among low-effort applicants |
| Forgettable | Memorable — strengthens employer brand even for those you don't hire |

## Capturing "comfort value" inside the story

Instead of a dry "Expected salary: ___" (which the pilot showed produces `30k` / `25` /
paragraphs), comfort is captured as **in-world choices** at natural moments:

- **Day 1 check-in** ("Mira asks how you like to work"): pick async vs sync, structured vs
  autonomous, solo vs pairing → `work_style`.
- **A "project scoping" beat**: "The client offers two engagement shapes" → reveals full-time
  vs project preference and `salary_flexibility`.
- **Wrap-up "offer letter" moment**: framed as *them* setting terms — a slider/range for
  salary they'd actually accept (`desired_salary_amount`), start availability, weekly hours.
- **Motivators**: throughout, small "what excited you most about today?" choices →
  `motivators[]`.

All of it lands in the structured **ComfortProfile** ([02-data-model.md](./02-data-model.md))
— sortable, filterable, exportable. You can later query *"round finishers who'd accept ≤35k,
want full-time, available within 2 weeks."*

## Per-role missions

The frame is identical; **Day 2–3 tasks are role-specific** and graded against that role's
rubric ([05-scoring-rubric.md](./05-scoring-rubric.md)). Each is designed so a faker can't
bluff it and a strong candidate can shine.

### Senior WordPress Developer
- **Day 2:** A live (sandboxed) WordPress install has a broken/insecure plugin. Mission: fix
  the bug, then extend it with a small feature (e.g. a Gutenberg block or a REST endpoint).
  Submit a diff + short explanation. *Tests: real PHP/WP depth, not buzzwords.*
- **Day 3 curveball:** "A user reports the site is slow." Given a snippet, identify the N+1
  query / missing cache and propose a fix. *Tests: debugging + judgment.*
- *Why this role first:* it's the role with pilot data, and CVs proved depth claims are cheap
  — the pilot's deciding factor was "verifiable shipped products." The round verifies live.

### UI/UX Designer
- **Day 2:** Redesign a real Instaquirk screen (provide the current one). Submit a Figma link
  or uploaded mockup + a 3-bullet rationale. *Tests: visual craft + reasoning.*
- **Day 3 curveball:** "Users drop off at checkout." Given a flow, find the friction and
  sketch a fix. *Tests: UX thinking, not just visuals.*

### Social Media Manager
- **Day 2:** Given a brand brief + a trending topic, produce a 3-post mini-campaign (hook,
  caption, CTA, format choice per platform). *Tests: voice, hooks, platform fluency.*
- **Day 3 curveball:** A post is "going viral for the wrong reason" — draft the response and a
  recovery plan. *Tests: judgment under pressure.*

### Performance Marketer
- **Day 2:** Given a product + budget, design a campaign: channels, audience, a sample ad, and
  the **metrics you'd watch**. *Tests: funnel thinking + measurement discipline.*
- **Day 3 curveball:** "CAC doubled last week." Given mock numbers, diagnose and propose 3
  experiments. *Tests: analytical depth.*

### SEO Specialist
- **Day 2:** Audit a provided live URL — surface the top on-page/technical issues and a
  prioritized fix list. *Tests: real auditing vs checklist parroting.*
- **Day 3 curveball:** "Traffic dropped 40% after a migration." Diagnose likely causes
  (redirects, canonicals, indexing) and a recovery plan. *Tests: technical SEO depth.*

> **"Point out all the things they need to work":** every task auto-scores into sub-dimensions
> and emits a **strengths/gaps summary** per candidate (e.g. "strong on layout, weak on
> accessibility"; "great hooks, weak on measurement"). This drives both your advance/reject
> decision and the **auto-generated interview questions** that probe exactly those gaps.

## Task types the engine supports

So the same engine renders any role's round:

| Type | Use | Auto-scored? |
|------|-----|--------------|
| Multiple choice / scenario branch | judgment, knowledge checks, comfort capture | yes (keyed) |
| Short text / long write-up | rationale, communication | partial (keyword + length heuristics; flagged for human read) |
| Code / diff submission | WordPress task | partial (runs tests in sandbox) + human review |
| File / link upload | design mockups, campaign decks | human review, metadata captured |
| Ranking / prioritization | "what would you do first?" | yes (keyed) |
| Slider / range | comfort values (salary, hours) | captured, not scored |

## Scoring the round

Each task yields a `RoundTaskResult` with `auto_score` / `max_score` and `time_spent_sec`.
The session's `total_score` plus the **strengths/gaps summary** feed Stage 4 review. Human
judgment still decides — the round *informs*, it doesn't *auto-hire*. Weighting per role lives
in [05-scoring-rubric.md](./05-scoring-rubric.md).

## Integrity & anti-cheat

Strong people will (and should) use the tools they'd use on the job — the point isn't to ban
Google/AI, it's to make copying *useless*:

- **Personalized prompts:** small per-candidate variation (different sandbox bug, different
  screen, different URL) so answers aren't shareable.
- **Process over answer:** grade the diff/rationale/decision trail, not a single final value.
- **Time + telemetry:** capture time-per-task and paste-bursts as *signals* (not auto-reject).
- **Live curveball:** Day 3's "it broke, now what?" is hard to outsource and very revealing.
- **The interview confirms:** the few who advance defend their submission live — fakers
  collapse, doers expand. That's the real anti-cheat.

## Tone & craft

- Warm, witty, concise. The candidate should smile at least once.
- Show, don't lecture: drop them into situations, let choices speak.
- Always tell them where they are ("Day 2 of 4") and that progress is saved.
- End on a high note regardless of outcome — even rejected candidates should think *"that was
  the best application process I've done."* That's free employer-brand for your ads.

## Story-based onboarding

For people you hire, the **same world continues**. Day 1 on the job is framed as
"Season 2" — the guide character returns, the missions are now real onboarding tasks (set up
your environment, ship a tiny real change, meet the team), and the comfort values they set in
the round seed their actual working agreement. The round and onboarding share one narrative
spine, so the experience feels continuous from "applied" to "first real PR."

## Open design choices

- **Mascot/guide identity** — invent a character ("Quirk"/"Mira") or use a real teammate persona?
- **Sandbox depth for the WP task** — full live WP container vs a curated code snippet (start
  with snippet, graduate to container).
- **Deadline length** and resume policy.
- **AI-use stance** — recommend "use anything, we grade your judgment" + personalized prompts.

These are flagged again in [08-roadmap.md](./08-roadmap.md).
