# 07 — Job Posts

Ready-to-publish job descriptions for the five launch roles. Each becomes a `Job` record
([02-data-model.md](./02-data-model.md)) rendered at `/careers/[slug]`. They share a structure
so the careers page feels consistent, and each names the **story-driven Instaquirk Challenge**
so candidates know the process is different (and self-select).

> **Fill before publishing:** salary ranges (`{{SALARY}}`), exact employment type, and any
> company specifics. Ranges below are placeholders informed by the pilot (WordPress applicants
> clustered 25k–50k BDT/month).

---

## Shared structure (every post)

1. One-line hook
2. About Instaquirk (2–3 lines)
3. What you'll do
4. What we're looking for
5. Nice to have
6. How hiring works (the Challenge) + comp & logistics
7. Apply CTA

**About Instaquirk (reusable blurb):**
> Instaquirk builds products people actually enjoy using. We're a small, fast team that ships,
> measures, and iterates. We hire for craft and judgment, not buzzwords — which is why our
> process lets you *show* your skills, not just list them.

**How hiring works (reusable, appended to every post):**
> **No endless interviews.** You apply, and if it's a fit we invite you to the **Instaquirk
> Challenge** — a short, story-driven round (≈60–90 min) where you do a slice of the real job.
> It's genuinely a bit fun. Do well and you go straight to a final conversation. We respect
> your time and tell you where you stand at every step.

---

## 1. Senior WordPress Developer
**slug:** `senior-wordpress-developer` · **role_key:** `wordpress`

**Build plugins and themes people actually ship with.**

We need a WordPress developer who lives in the code — not someone who drags widgets, but
someone who writes clean PHP, ships custom plugins, and knows WordPress from `wp-config` to the
REST API.

**What you'll do**
- Build and maintain **custom plugins and themes** from scratch.
- Work with Gutenberg blocks, custom post types, the REST API, and WooCommerce where needed.
- Write maintainable, secure, performant code (and care about why an N+1 query is bad).
- Ship real features and fix real bugs — fast.

**What we're looking for**
- Strong PHP + WordPress internals (hooks, filters, the plugin/theme APIs).
- Evidence of **shipped work**: plugins on WordPress.org, themes on ThemeForest under your
  name, or substantial plugin repos on GitHub. *We verify this.*
- Comfort with custom development, not just page builders.

**Nice to have**
- Published WordPress.org plugin/theme author profile, OOP/Composer/WP-CLI, React/Gutenberg,
  performance & security chops.

*Appended: How hiring works · {{SALARY}} · Remote · Full-time*

---

## 2. UI/UX Designer
**slug:** `ui-ux-designer` · **role_key:** `uiux`

**Design products that feel obvious to use.**

We're looking for a designer who thinks in flows and systems, not just pretty screens — someone
who can research, wireframe, prototype, and hand off pixel-clean work.

**What you'll do**
- Design end-to-end flows: research → wireframe → prototype → polished UI.
- Build and maintain a **design system** so the product stays consistent as it grows.
- Partner with developers on practical, build-ready handoffs.
- Use data and usability feedback to make screens measurably better.

**What we're looking for**
- A portfolio that shows **thinking**, not just visuals (problem → decision → outcome).
- Fluency in **Figma** (auto layout, components, prototyping).
- A real sense for accessibility, hierarchy, and interaction.

**Nice to have**
- Design-system experience, motion/interaction design, basic HTML/CSS literacy, user-research
  experience.

*Appended: How hiring works · {{SALARY}} · Remote · Full-time/Project*

---

## 3. Social Media Manager
**slug:** `social-media-manager` · **role_key:** `smm`

**Own our voice. Make people stop scrolling.**

We want someone who understands platforms deeply, writes hooks that land, and grows a community
on purpose — not by luck.

**What you'll do**
- Own the content calendar across platforms (Instagram, TikTok, Facebook, LinkedIn).
- Write scroll-stopping hooks and captions in a consistent brand voice.
- Plan and run campaigns; manage community and engagement.
- Track what works (engagement, reach, growth) and double down.

**What we're looking for**
- A track record of **growing accounts** — with numbers you can show.
- Strong short-form instincts (reels, trends, formats) and platform fluency.
- Sharp writing and a feel for brand voice.

**Nice to have**
- Paid social experience, creator collaborations, Canva/light design, basic analytics.

*Appended: How hiring works · {{SALARY}} · Remote · Full-time/Project*

---

## 4. Performance Marketer
**slug:** `performance-marketer` · **role_key:** `marketer`

**Spend a dollar, make two. Then prove it.**

We need a marketer who thinks in funnels and unit economics — someone who can launch campaigns,
read the numbers honestly, and find growth that compounds.

**What you'll do**
- Plan and run paid acquisition across channels (Meta, Google, and beyond).
- Own the funnel: audiences, creative, landing pages, conversion.
- Watch the metrics that matter (CAC, ROAS, LTV) and run disciplined A/B tests.
- Turn data into the next experiment.

**What we're looking for**
- Demonstrated results with **real numbers** (case studies, dashboards).
- Fluency with paid platforms and analytics/attribution.
- An experiment mindset — hypothesis, test, learn, repeat.

**Nice to have**
- Email/lifecycle marketing, landing-page optimization, SQL/Sheets modeling, CRM experience.

*Appended: How hiring works · {{SALARY}} · Remote · Full-time/Project*

---

## 5. SEO Specialist
**slug:** `seo-specialist` · **role_key:** `seo`

**Win the long game in search.**

We want an SEO who goes beyond checklists — someone fluent in technical SEO, content strategy,
and the kind of audits that actually move rankings.

**What you'll do**
- Run technical + on-page audits and turn them into prioritized fixes.
- Own keyword strategy, content briefs, and internal-linking structure.
- Monitor Core Web Vitals, indexing, crawl health, and migrations.
- Track rankings and traffic, and report on what's working.

**What we're looking for**
- Real **technical SEO** depth (schema, canonicalization, crawl budget, Search Console, log
  analysis) — not just "write meta descriptions."
- Case studies with **before/after** ranking or traffic results.
- Comfort with Ahrefs/SEMrush/Screaming Frog and Search Console.

**Nice to have**
- Content strategy, basic HTML/JS understanding, link-building experience, analytics fluency.

*Appended: How hiring works · {{SALARY}} · Remote · Full-time/Project*

---

## Careers page

All five render as cards on `/careers` (title, one-line hook, type, location, "Apply"). Each
card → `/careers/[slug]` (full JD) → `/apply/[slug]` (structured application form +
CV upload). Closed roles show as "filled" rather than 404, which keeps SEO value and signals an
active, growing team — useful when your ads point people at the careers page.
