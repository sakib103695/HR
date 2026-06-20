// Fill MongoDB with realistic demo applicants so the admin dashboard has data to show.
// Run: npm run seed:demo
// Demo docs are tagged { isDemo: true } and wiped/reinserted each run — real applications
// (without that tag) are never touched.
const crypto = require('crypto')
const { MongoClient } = require('mongodb')
const config = require('../lib/config')

const ORDER = ['applied', 'screened', 'round_invited', 'round_submitted', 'interview', 'offer', 'hired']

function expPoints(years) {
  const y = Number(years) || 0
  if (y >= 7) return 20
  if (y >= 5) return 16
  if (y >= 4) return 13
  if (y >= 3) return 10
  if (y >= 2) return 7
  if (y >= 1) return 4
  return 1
}

function buildEvents(stage, createdAt) {
  const now = Date.now()
  if (stage === 'rejected') {
    return [
      { from: null, to: 'applied', actor: 'candidate', at: createdAt },
      { from: 'applied', to: 'screened', actor: 'admin', at: new Date(Math.min(now, createdAt.getTime() + 86400000)) },
      { from: 'screened', to: 'rejected', actor: 'admin', reason: 'Not a fit this round', at: new Date(Math.min(now, createdAt.getTime() + 2 * 86400000)) },
    ]
  }
  const idx = ORDER.indexOf(stage)
  const events = [{ from: null, to: 'applied', actor: 'candidate', at: createdAt }]
  for (let i = 1; i <= idx; i++) {
    const at = new Date(Math.min(now, createdAt.getTime() + i * 86400000))
    events.push({ from: ORDER[i - 1], to: ORDER[i], actor: 'admin', at })
  }
  return events
}

const JOB_META = {
  wordpress: { slug: 'senior-wordpress-developer', title: 'Senior WordPress Developer' },
  uiux: { slug: 'ui-ux-designer', title: 'UI/UX Designer' },
  smm: { slug: 'social-media-manager', title: 'Social Media Manager' },
  marketer: { slug: 'performance-marketer', title: 'Performance Marketer' },
  seo: { slug: 'seo-specialist', title: 'SEO Specialist' },
}

const ROLE_DEFAULTS = {
  wordpress: {
    heavy: ['custom plugin', 'gutenberg block', 'rest api', 'woocommerce'],
    signals: ['github.com', 'wordpress.org/plugins/'],
    portfolio: ['https://github.com/dev', 'https://wordpress.org/plugins/sample/'],
    answer: 'Built custom WooCommerce plugins from scratch with the REST API and Gutenberg blocks; published a plugin on WordPress.org.',
  },
  uiux: {
    heavy: ['figma', 'design system', 'prototyping', 'user research'],
    signals: ['behance.net', 'dribbble.com', 'figma.com'],
    portfolio: ['https://www.behance.net/designer', 'https://dribbble.com/designer'],
    answer: 'Redesigned a checkout flow that lifted conversion; built and maintained the team design system in Figma.',
  },
  smm: {
    heavy: ['content calendar', 'reels', 'engagement rate', 'campaign'],
    signals: ['instagram.com', 'tiktok.com'],
    portfolio: ['https://instagram.com/brand', 'https://tiktok.com/@brand'],
    answer: 'Grew an Instagram account from 5k to 60k in 8 months with short-form reels and a consistent content calendar.',
  },
  marketer: {
    heavy: ['roas', 'cac', 'a/b testing', 'funnel'],
    signals: ['case study', 'dashboard'],
    portfolio: ['https://drive.google.com/casestudy', 'https://example.com/dashboard'],
    answer: 'Ran Meta + Google campaigns; cut CAC 32% and pushed ROAS to 4.1 through disciplined A/B testing.',
  },
  seo: {
    heavy: ['technical seo', 'core web vitals', 'schema markup', 'search console'],
    signals: ['ahrefs.com', 'case study'],
    portfolio: ['https://ahrefs.com/profile', 'https://example.com/seo-case-study'],
    answer: 'Recovered a site after a migration drop and grew organic traffic 140% in 6 months via technical fixes + content.',
  },
}

// Compact demo roster: [name, email, phone, years, salaryRaw, position, org, depth, folio, stage, daysAgo]
const ROSTER = {
  wordpress: [
    ['MD Abu Bakker Siddik', 'abubakkers@example.com', '+8801911500125', 9, '38000', 'Senior WP Developer', 'ThemeMascot', 40, 27, 'interview', 14],
    ['Najmus Shadat', 'najmus@example.com', '+8801784013229', 6, '40000', 'Plugin Developer', 'Esor Studio', 50, 20, 'round_submitted', 12],
    ['Naeem Khan', 'naeem@example.com', '+8801712000001', 6, '50000', 'WordPress Engineer', 'Freelance', 38, 18, 'round_invited', 10],
    ['Masud Rana', 'masud@example.com', '+8801712000002', 3, '30k', 'WP Developer', 'Brand Studio', 36, 16, 'round_invited', 9],
    ['Imran Ahmed', 'imran@example.com', '+8801712000003', 9, '50000 BDT', 'Principal Engineer', 'Tech Co', 34, 14, 'screened', 8],
    ['Sirajum Mahdi', 'sirajum@example.com', '+8801712000004', 4, 'Negotiable', 'Web Developer', 'Agency', 30, 13, 'screened', 7],
    ['Delwer Hossain', 'delwer@example.com', '+8801712000005', 10, '35000', 'Full-stack Dev', 'Freelance', 28, 12, 'applied', 3],
    ['Abul Kalam Azad', 'azad@example.com', '+8801712000006', 5, '40000', 'WP Developer', 'Studio', 22, 11, 'applied', 2],
    ['Naimur Rahman', 'naimur@example.com', '+8801712000007', 5, '30000', 'Theme Developer', 'Freelance', 20, 9, 'applied', 2],
    ['Humayun Ahmed', 'humayun@example.com', '+8801712000008', 4, '25000', 'Junior Dev', 'Startup', 16, 6, 'rejected', 6],
    ['Md Rashedul Hossain', 'rashedul@example.com', '+8801624334529', 2.5, '30-35k', 'Student', 'Student', 9, 5, 'applied', 1],
    ['Razaul Bari Soikot', 'soikot@example.com', '+8801712000010', 1, '20000', 'Intern', 'Freelance', 7, 4, 'rejected', 5],
  ],
  uiux: [
    ['Avijit Maity', 'avijit@example.com', '+8801712100001', 7, '45000', 'Product Designer', 'SaaS Co', 40, 22, 'offer', 16],
    ['Mehedi Hasan Anik', 'mehedi@example.com', '+8801712100002', 5, '40000', 'UI/UX Designer', 'Agency', 38, 20, 'interview', 11],
    ['Farzana Islam', 'farzana@example.com', '+8801712100003', 4, '35000', 'Product Designer', 'Freelance', 32, 16, 'round_submitted', 9],
    ['Inun Jarin Dristy', 'inun@example.com', '+8801712100004', 3, '30000', 'UX Designer', 'Studio', 28, 14, 'screened', 6],
    ['Rabia Abbasi', 'rabia@example.com', '+923001000005', 2, '25000', 'UI Designer', 'Freelance', 20, 11, 'applied', 2],
    ['Shobhan Das', 'shobhan@example.com', '+8801712100006', 1, '20000', 'Junior Designer', 'Startup', 14, 8, 'applied', 1],
  ],
  smm: [
    ['Mahbubul Mithu', 'mithu@example.com', '+8801712200001', 6, '40000', 'Social Media Lead', 'Brand', 40, 20, 'interview', 13],
    ['Ayesha Ashraf', 'ayesha@example.com', '+923001000002', 4, '25000', 'SMM Specialist', 'Agency', 36, 18, 'round_invited', 8],
    ['Tanzid Rahman', 'tanzid@example.com', '+8801712200003', 3, '28000', 'Content Manager', 'Freelance', 30, 15, 'screened', 6],
    ['Nadia Akter', 'nadia@example.com', '+8801712200004', 2, '22000', 'Social Media Exec', 'Startup', 22, 12, 'applied', 2],
    ['Sajid Wahid', 'sajid@example.com', '+8801712200005', 2, '20000', 'Community Manager', 'Brand', 18, 10, 'applied', 1],
  ],
  marketer: [
    ['Zohaib Hassan', 'zohaib@example.com', '+923001000001', 7, '55000', 'Growth Marketer', 'eCom Co', 42, 22, 'interview', 15],
    ['Awais Ahmed', 'awais@example.com', '+923001000002', 5, '45000', 'Performance Marketer', 'Agency', 38, 18, 'round_submitted', 10],
    ['Furqan Shaikh', 'furqan@example.com', '+923001000003', 4, '38000', 'Paid Media Specialist', 'Freelance', 30, 15, 'screened', 6],
    ['Hira Mughal', 'hira@example.com', '+923001000004', 3, '30000', 'Marketing Exec', 'Startup', 24, 12, 'applied', 2],
    ['Usman Ahmad', 'usman@example.com', '+923001000005', 2, '25000', 'Junior Marketer', 'Brand', 18, 9, 'applied', 1],
  ],
  seo: [
    ['Ashik Khan', 'ashik@example.com', '+8801712400001', 8, '50000', 'SEO Lead', 'Agency', 44, 24, 'hired', 20],
    ['Haris Ali', 'haris@example.com', '+923001000011', 6, '42000', 'Technical SEO', 'SaaS Co', 40, 20, 'round_invited', 9],
    ['Sajedul Islam', 'sajedul@example.com', '+8801712400003', 5, '38000', 'SEO Specialist', 'Freelance', 34, 16, 'screened', 6],
    ['Amirul Shakil', 'amirul@example.com', '+8801712400004', 3, '30000', 'SEO Executive', 'Startup', 28, 13, 'applied', 2],
    ['Mahedi Hasan', 'mahedi@example.com', '+8801712400005', 2, '25000', 'Content + SEO', 'Agency', 22, 11, 'applied', 1],
    ['Adil Azhar', 'adil@example.com', '+923001000015', 1, '18000', 'Junior SEO', 'Freelance', 14, 8, 'rejected', 4],
  ],
}

function makeDoc(roleKey, row) {
  const [name, email, phone, years, salaryRaw, position, org, depth, folio, stage, daysAgo] = row
  const meta = JOB_META[roleKey]
  const def = ROLE_DEFAULTS[roleKey]
  const exp = expPoints(years)
  const total = Math.round((depth + folio + exp) * 10) / 10
  const createdAt = new Date(Date.now() - daysAgo * 86400000)
  const salaryAmt = (() => {
    const m = String(salaryRaw).toLowerCase().replace(/,/g, '')
    const km = m.match(/(\d+(?:\.\d+)?)\s*k/)
    if (km) return Math.round(parseFloat(km[1]) * 1000)
    const n = m.match(/\d{4,7}/)
    return n ? Number(n[0]) : null
  })()

  const doc = {
    isDemo: true,
    jobSlug: meta.slug,
    jobTitle: meta.title,
    roleKey,
    fullName: name,
    email: email.toLowerCase(),
    phone,
    currentOrg: org,
    currentPosition: position,
    yearsExperience: years,
    expectedSalaryAmount: salaryAmt,
    expectedSalaryRaw: salaryRaw,
    portfolioUrls: def.portfolio,
    roleAnswer: def.answer,
    cvFileId: null,
    cvFilename: null,
    extractedText: '',
    autoScore: total,
    scoreBreakdown: [
      { dimension: 'technical_depth', points: depth, max: 50, evidence: { heavy: def.heavy, medium: [], formBonus: 6 } },
      { dimension: 'portfolio', points: folio, max: 30, evidence: { signals: def.signals, uniqueUrls: def.portfolio.length, liveProjects: 1 } },
      { dimension: 'experience', points: exp, max: 20, evidence: { years } },
    ],
    stage,
    statusToken: crypto.randomBytes(16).toString('hex'),
    source: ['ad', 'referral', 'direct'][Math.floor(years) % 3],
    stageEvents: buildEvents(stage, createdAt),
    createdAt,
    updatedAt: new Date(),
  }

  // Comfort profile appears once a candidate reaches the round-submitted stage onward.
  if (ORDER.indexOf(stage) >= ORDER.indexOf('round_submitted')) {
    doc.comfortProfile = {
      desiredSalaryAmount: salaryAmt,
      salaryFlexibility: ['firm', 'negotiable', 'open'][Math.floor(years) % 3],
      weeklyHours: 40,
      availabilityStart: '2 weeks',
      workStyle: ['async', 'autonomous'],
      motivators: ['ownership', 'learning', 'shipping fast'].slice(0, (Math.floor(years) % 3) + 1),
    }
  }
  return doc
}

async function main() {
  const uri = config.MONGODB_URI
  const dbName = config.MONGODB_DB_NAME || 'hr_instaquirk'
  if (!uri) throw new Error('MONGODB_URI not set')

  const docs = []
  for (const roleKey of Object.keys(ROSTER)) {
    for (const row of ROSTER[roleKey]) docs.push(makeDoc(roleKey, row))
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 })
  await client.connect()
  const col = client.db(dbName).collection('applications')
  await col.createIndex({ statusToken: 1 }, { unique: true })

  const removed = await col.deleteMany({ isDemo: true })
  const res = await col.insertMany(docs)

  console.log(`Removed ${removed.deletedCount} old demo applicants.`)
  console.log(`Inserted ${res.insertedCount} demo applicants across ${Object.keys(ROSTER).length} roles:`)
  for (const roleKey of Object.keys(ROSTER)) {
    console.log(`  ${JOB_META[roleKey].title}: ${ROSTER[roleKey].length}`)
  }
  console.log('Open http://localhost:3000/admin to view.')
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
