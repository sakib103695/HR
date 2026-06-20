# 05 — Scoring & Ranking Rubric

The pilot already produced a strong, defensible scoring methodology for WordPress developers.
This doc **generalizes that proven approach** into a per-role rubric system the platform can
run automatically — for both the **CV auto-score** (Stage 2) and the **round auto-score**
(Stage 4).

## The pilot methodology (our proven baseline)

For the WordPress role, the pilot scored each candidate 0–100:

- **Technical / Plugin–Theme Depth — 0–50**
  - Heavy signals (3 pts each, cap 36): `custom plugin`, `plugin development`, `gutenberg
    block`, `rest api`, `custom post type`, `advanced custom fields`, `woocommerce custom`,
    `oop`, `composer`, `wp-cli`, `from scratch`, `wp.org`, `wordpress.org/plugins`,
    `themeforest`, …
  - Medium signals (0.7 each, cap 10): PHP, MySQL, Elementor, jQuery, Sass, React, child
    theme, shortcode, …
  - Form bonus (cap 6): substantive plugin/theme answer with URLs + the words
    plugin/theme/extension/contribute.
  - Small penalty for fresher/intern with no heavy signals.
- **Portfolio Quality — 0–30**
  - Up to 8 for breadth of unique URLs.
  - Strong-signal bonuses (cap 18): `wordpress.org/plugins/` +8, `wordpress.org/themes/` +8,
    `profiles.wordpress.org` +4, GitHub +4, ThemeForest/CodeCanyon +4, Envato +3,
    Upwork/StackOverflow +1, LinkedIn +0.5.
  - Up to 6 for live (non-marketplace) project URLs.
- **Years of Experience — 0–20** (signal-only modifier): 7+ → 20, 5–6 → 16, 4 → 13, 3 → 10,
  2 → 7, 1 → 4, <1 → 1.

**Result on 124 applicants:** max 87.4, mean 34.6, median 34.3 — only 6 above 60. The
spreadsheet then flagged that the *deciding* factor is **verifiable shipped products**, which
is exactly what the story-driven round now tests live.

> **Lesson encoded into the platform:** CV keywords are a *coarse filter* (they over-reward
> buzzword stuffing). Use them to shortlist, then let the **round** provide the real signal.
> The rubric is explainable (every point cites its evidence), never a black box.

## The generalized rubric shape

Every role uses the same three-bucket shape; only the **keyword sets, URL signals, and
weights** change.

```
Total (0–100) =
    Skill/Domain Depth   (40–50)   ← role-specific heavy + medium keyword signals
  + Proof/Portfolio      (25–30)   ← role-specific URL & artifact signals
  + Experience           (15–20)   ← years modifier (same curve as pilot)
  + (Round stage adds)   round_score, weighted per role
```

Each rubric is **config** (a JSON object), so adding/tuning a role doesn't touch code:

```jsonc
{
  "role_key": "seo",
  "weights": { "depth": 45, "proof": 30, "experience": 20, "round": "see below" },
  "depth": {
    "heavy":  { "points": 3, "cap": 33, "terms": ["technical seo", "core web vitals",
                "schema markup", "log file analysis", "crawl budget", "canonicalization",
                "hreflang", "search console", "screaming frog", "ahrefs", "semrush"] },
    "medium": { "points": 0.7, "cap": 12, "terms": ["on-page", "backlinks", "keyword research",
                "meta description", "internal linking", "sitemap", "redirects"] },
    "form_bonus_cap": 6
  },
  "proof": {
    "url_breadth_cap": 8,
    "signals": { "ahrefs.com/.../?target": 4, "search.google.com/search-console": 3,
                 "github.com": 2, "case study": 4, "ranking screenshot": 4 },
    "signal_cap": 18,
    "live_project_cap": 6
  },
  "experience_curve": { "7": 20, "5": 16, "4": 13, "3": 10, "2": 7, "1": 4, "0": 1 }
}
```

## Per-role signal sets (starter lists — tune over time)

### Senior WordPress Developer (= pilot, proven)
Use the pilot lists verbatim. Strongest proof: `wordpress.org/plugins/`, `wordpress.org/themes/`,
`profiles.wordpress.org`, substantive plugin GitHub repos, ThemeForest listings under the
candidate's own name.

### UI/UX Designer
- **Heavy:** `figma`, `design system`, `prototyping`, `user research`, `wireframe`, `usability
  testing`, `interaction design`, `accessibility`, `wcag`, `design tokens`, `auto layout`.
- **Medium:** `adobe xd`, `sketch`, `illustrator`, `responsive`, `style guide`, `user flow`.
- **Proof:** Behance, Dribbble, Figma community/profile, live product links, case studies.

### Social Media Manager
- **Heavy:** `content calendar`, `community management`, `analytics`, `reels`, `short-form`,
  `brand voice`, `campaign`, `engagement rate`, `paid social`, `creator collaboration`.
- **Medium:** `instagram`, `tiktok`, `facebook`, `canva`, `scheduling tools`, `captions`.
- **Proof:** managed-account handles (with reach/growth numbers), campaign case studies,
  portfolio of posts, follower-growth screenshots.

### Performance Marketer
- **Heavy:** `cac`, `roas`, `ltv`, `conversion rate`, `a/b testing`, `attribution`, `funnel`,
  `paid acquisition`, `retargeting`, `cohort`, `marketing analytics`.
- **Medium:** `google ads`, `meta ads`, `email marketing`, `landing page`, `utm`, `crm`.
- **Proof:** dashboards/case studies with real numbers, certifications, GitHub/Sheets models.

### SEO Specialist
- **Heavy:** see the JSON example above (`technical seo`, `core web vitals`, `schema`, `crawl
  budget`, `canonicalization`, `hreflang`, `log file analysis`).
- **Medium:** `on-page`, `backlinks`, `keyword research`, `internal linking`, `redirects`.
- **Proof:** ranking case studies with before/after, Search Console screenshots, Ahrefs/SEMrush
  profiles, published audits.

## Round scoring weight

The CV score gates entry to the round; the **round score dominates the advance-to-interview
decision**, because it's evidence, not claims. Suggested blend at Stage 4:

```
Stage-4 ranking = 0.25 × cv_auto_score  +  0.75 × round_score
```

(Configurable per role. The pilot's own conclusion — "the deciding factor is verifiable shipped
work" — is exactly why the round is weighted heavier than the CV.)

## Explainability & calibration

- Every score stores `evidence` (matched terms, URLs found, task breakdown) so you can see
  *why* — and defend it.
- **Calibrate over time:** because every stage transition and outcome is logged
  ([06-export-analytics.md](./06-export-analytics.md)), you can check whether high CV scores
  actually predicted strong rounds, and re-tune weights. The rubric improves each hiring cycle.
- **Guard against keyword stuffing:** caps on each bucket (from the pilot) prevent a CV that
  repeats "plugin plugin plugin" from running away. The round is the backstop.
