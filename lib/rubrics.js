// Per-role scoring rubrics. Generalized from the proven WordPress pilot methodology
// (Technical/Depth 50 + Portfolio 30 + Experience 20). Tune the term lists over time.
//
// Each rubric: depth { heavy, medium }, proof { signals, ... }, weights.

export const EXPERIENCE_CURVE = [
  { min: 7, points: 20 },
  { min: 5, points: 16 },
  { min: 4, points: 13 },
  { min: 3, points: 10 },
  { min: 2, points: 7 },
  { min: 1, points: 4 },
  { min: 0, points: 1 },
]

const RUBRICS = {
  wordpress: {
    label: 'Senior WordPress Developer',
    depthMax: 50,
    proofMax: 30,
    expMax: 20,
    heavy: {
      points: 3, cap: 36,
      terms: ['custom plugin', 'plugin development', 'gutenberg block', 'gutenberg', 'rest api',
        'custom post type', 'advanced custom fields', 'acf', 'woocommerce custom', 'woocommerce',
        'oop', 'composer', 'wp-cli', 'from scratch', 'wp.org', 'wordpress.org/plugins',
        'wordpress.org/themes', 'themeforest', 'codecanyon', 'hooks', 'filters'],
    },
    medium: {
      points: 0.7, cap: 10,
      terms: ['php', 'mysql', 'elementor', 'jquery', 'sass', 'react', 'child theme', 'shortcode',
        'wordpress', 'javascript', 'api', 'git', 'figma to wordpress', 'responsive'],
    },
    proofSignals: [
      { match: 'wordpress.org/plugins/', points: 8 },
      { match: 'wordpress.org/themes/', points: 8 },
      { match: 'profiles.wordpress.org', points: 4 },
      { match: 'github.com', points: 4 },
      { match: 'themeforest', points: 4 },
      { match: 'codecanyon', points: 4 },
      { match: 'envato', points: 3 },
      { match: 'upwork', points: 1 },
      { match: 'stackoverflow', points: 1 },
      { match: 'linkedin', points: 0.5 },
    ],
  },

  uiux: {
    label: 'UI/UX Designer',
    depthMax: 50, proofMax: 30, expMax: 20,
    heavy: {
      points: 3, cap: 36,
      terms: ['figma', 'design system', 'prototyping', 'prototype', 'user research', 'wireframe',
        'usability testing', 'interaction design', 'accessibility', 'wcag', 'design tokens',
        'auto layout', 'information architecture', 'user flow'],
    },
    medium: {
      points: 0.7, cap: 10,
      terms: ['adobe xd', 'sketch', 'illustrator', 'photoshop', 'responsive', 'style guide',
        'mockup', 'ui', 'ux', 'typography', 'design'],
    },
    proofSignals: [
      { match: 'behance.net', points: 6 },
      { match: 'dribbble.com', points: 6 },
      { match: 'figma.com', points: 5 },
      { match: 'case study', points: 4 },
      { match: 'github.com', points: 2 },
      { match: 'linkedin', points: 0.5 },
    ],
  },

  smm: {
    label: 'Social Media Manager',
    depthMax: 50, proofMax: 30, expMax: 20,
    heavy: {
      points: 3, cap: 36,
      terms: ['content calendar', 'community management', 'analytics', 'reels', 'short-form',
        'brand voice', 'campaign', 'engagement rate', 'paid social', 'creator collaboration',
        'content strategy', 'social media strategy', 'influencer'],
    },
    medium: {
      points: 0.7, cap: 10,
      terms: ['instagram', 'tiktok', 'facebook', 'linkedin', 'canva', 'scheduling', 'captions',
        'hashtag', 'youtube', 'twitter', 'meta business'],
    },
    proofSignals: [
      { match: 'instagram.com', points: 4 },
      { match: 'tiktok.com', points: 4 },
      { match: 'case study', points: 4 },
      { match: 'followers', points: 3 },
      { match: 'growth', points: 3 },
      { match: 'linkedin', points: 0.5 },
    ],
  },

  marketer: {
    label: 'Performance Marketer',
    depthMax: 50, proofMax: 30, expMax: 20,
    heavy: {
      points: 3, cap: 36,
      terms: ['cac', 'roas', 'ltv', 'conversion rate', 'a/b testing', 'ab testing', 'attribution',
        'funnel', 'paid acquisition', 'retargeting', 'cohort', 'marketing analytics', 'cpa',
        'performance marketing', 'media buying'],
    },
    medium: {
      points: 0.7, cap: 10,
      terms: ['google ads', 'meta ads', 'facebook ads', 'email marketing', 'landing page', 'utm',
        'crm', 'seo', 'google analytics', 'ppc', 'campaign'],
    },
    proofSignals: [
      { match: 'case study', points: 5 },
      { match: 'dashboard', points: 3 },
      { match: 'roas', points: 3 },
      { match: 'github.com', points: 2 },
      { match: 'certification', points: 2 },
      { match: 'linkedin', points: 0.5 },
    ],
  },

  seo: {
    label: 'SEO Specialist',
    depthMax: 50, proofMax: 30, expMax: 20,
    heavy: {
      points: 3, cap: 36,
      terms: ['technical seo', 'core web vitals', 'schema markup', 'schema', 'log file analysis',
        'crawl budget', 'canonicalization', 'canonical', 'hreflang', 'search console',
        'screaming frog', 'ahrefs', 'semrush', 'indexing', 'sitemap'],
    },
    medium: {
      points: 0.7, cap: 10,
      terms: ['on-page', 'backlinks', 'keyword research', 'meta description', 'internal linking',
        'redirects', 'serp', 'google analytics', 'content strategy', 'link building'],
    },
    proofSignals: [
      { match: 'ahrefs.com', points: 4 },
      { match: 'search.google.com/search-console', points: 3 },
      { match: 'case study', points: 4 },
      { match: 'ranking', points: 3 },
      { match: 'github.com', points: 2 },
      { match: 'linkedin', points: 0.5 },
    ],
  },
}

export function getRubric(roleKey) {
  return RUBRICS[roleKey] || RUBRICS.wordpress
}

export const ROLE_KEYS = Object.keys(RUBRICS)
