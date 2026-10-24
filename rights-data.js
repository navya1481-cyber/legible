// Legible's verified legal knowledge base.
//
// Every entry in this file was checked by hand against the linked official
// source (the U.S. Department of Education's IDEA regulations site, the
// eCFR, or state code) on VERIFIED_DATE. Nothing in this file is generated
// at runtime: the AI layer may explain these rights in context, but it can
// never add to them, and every citation shown to a family resolves to the
// official text linked here.

const VERIFIED_DATE = '2026-10-24';

// Official source URL patterns (all verified reachable on VERIFIED_DATE):
//   IDEA regulations — https://sites.ed.gov/idea/regs/b/<subpart>/<section>
//   Section 504 regs — https://www.ecfr.gov/current/title-34/part-104/section-<n>
//   Virginia regs    — https://law.lis.virginia.gov/admincode/title8/agency20/chapter81/
const IDEA = (subpart, section) => `https://sites.ed.gov/idea/regs/b/${subpart}/${section}`;
const S504 = (section) => `https://www.ecfr.gov/current/title-34/part-104/section-${section}`;

const PARENT_CENTER_URL = 'https://www.parentcenterhub.org/find-your-center/';

// Rights that apply to every family, regardless of the concern.
const UNIVERSAL_RIGHTS = [
  {
    text: "The school district must identify and evaluate every child who may have a disability. This duty, called Child Find, belongs to the school — and it applies even without a diagnosis.",
    cite: '34 CFR § 300.111',
    url: IDEA('b', '300.111'),
  },
  {
    text: 'You can request an initial evaluation at any time, in writing. You do not need the school’s permission or a doctor’s diagnosis to ask.',
    cite: '34 CFR § 300.301(b)',
    url: IDEA('d', '300.301'),
  },
  {
    text: 'Once the school has your written consent, the initial evaluation must be completed within 60 days — unless your state sets its own timeframe, which then applies instead.',
    cite: '34 CFR § 300.301(c)(1)',
    url: IDEA('d', '300.301'),
  },
  {
    text: 'If your child qualifies, they are entitled to a free appropriate public education (FAPE) tailored to their needs, at no cost to you.',
    cite: '34 CFR § 300.101',
    url: IDEA('b', '300.101'),
  },
  {
    text: 'You are a legally required member of your child’s IEP team. Your observations and input carry legal weight in every decision.',
    cite: '34 CFR § 300.321(a)(1)',
    url: IDEA('d', '300.321'),
  },
  {
    text: 'Before the school changes — or refuses to change — your child’s identification, evaluation, or placement, it must explain its reasons to you in writing.',
    cite: '34 CFR § 300.503',
    url: IDEA('e', '300.503'),
  },
  {
    text: 'If you disagree with the school’s evaluation, you can request an independent educational evaluation (IEE) at public expense. The school must then either fund it or promptly request a due-process hearing to defend its own evaluation.',
    cite: '34 CFR § 300.502(b)',
    url: IDEA('e', '300.502'),
  },
  {
    text: 'Even if your child does not qualify under IDEA, Section 504 still prohibits disability discrimination and can require accommodations when a condition substantially limits a major life activity, such as learning.',
    cite: '29 U.S.C. § 794; 34 CFR § 104.33',
    url: S504('104.33'),
  },
];

// Rights specific to each concern. Keys match the <select id="disability">
// option values in index.html exactly.
const CATEGORY_RIGHTS = {
  'ADHD': [
    {
      text: 'ADHD is named in IDEA’s “Other Health Impairment” category. A diagnosis alone doesn’t automatically qualify (or disqualify) a child — the evaluation team decides eligibility based on whether ADHD adversely affects their educational performance.',
      cite: '34 CFR § 300.8(c)(9)',
      url: IDEA('a', '300.8'),
    },
    {
      text: 'If behavior gets in the way of learning, the IEP team must consider positive behavioral interventions and supports — not just discipline.',
      cite: '34 CFR § 300.324(a)(2)(i)',
      url: IDEA('d', '300.324'),
    },
  ],
  'Dyslexia or other learning disability': [
    {
      text: 'Dyslexia is named in IDEA’s definition of “Specific Learning Disability.” Schools may use the word dyslexia in evaluations and IEP documents.',
      cite: '34 CFR § 300.8(c)(10)',
      url: IDEA('a', '300.8'),
    },
    {
      text: 'The evaluation must assess your child in all areas related to the suspected disability — reading, writing, and language processing included.',
      cite: '34 CFR § 300.304(c)(4)',
      url: IDEA('d', '300.304'),
    },
    {
      text: 'A school may not use a response-to-intervention (“wait and see”) process to delay or deny an evaluation you have requested.',
      cite: 'U.S. Dept. of Education, OSEP Memo 11-07',
      url: null,
    },
  ],
  'Autism': [
    {
      text: 'Autism is its own eligibility category under IDEA. If it affects your child’s education, they may be entitled to specially designed instruction — not just classroom accommodations.',
      cite: '34 CFR § 300.8(c)(1)',
      url: IDEA('a', '300.8'),
    },
    {
      text: 'The IEP team must consider your child’s communication needs, and must consider positive behavior supports when behavior affects learning.',
      cite: '34 CFR § 300.324(a)(2)',
      url: IDEA('d', '300.324'),
    },
  ],
  'Anxiety, depression, or other mental health condition': [
    {
      text: 'Mental health conditions can qualify under IDEA (as “emotional disturbance” or “other health impairment”) when they affect educational performance, or under Section 504 when they substantially limit a major life activity.',
      cite: '34 CFR § 300.8(c)(4), (c)(9)',
      url: IDEA('a', '300.8'),
    },
    {
      text: 'Related services under IDEA include psychological services, counseling services, and social work services in school.',
      cite: '34 CFR § 300.34(c)',
      url: IDEA('a', '300.34'),
    },
  ],
  'Hearing impairment': [
    {
      text: 'Deafness and hearing impairment are both eligibility categories under IDEA.',
      cite: '34 CFR § 300.8(c)(3), (c)(5)',
      url: IDEA('a', '300.8'),
    },
    {
      text: 'The IEP team must consider your child’s language and communication needs, including opportunities for direct instruction in your child’s own language and communication mode.',
      cite: '34 CFR § 300.324(a)(2)(iv)',
      url: IDEA('d', '300.324'),
    },
    {
      text: 'Related services can include audiology and interpreting services.',
      cite: '34 CFR § 300.34(c)(1), (c)(4)',
      url: IDEA('a', '300.34'),
    },
  ],
  'Vision impairment': [
    {
      text: 'Visual impairment, including blindness, is an eligibility category under IDEA.',
      cite: '34 CFR § 300.8(c)(13)',
      url: IDEA('a', '300.8'),
    },
    {
      text: 'The IEP team must provide for instruction in Braille unless the team determines, after an evaluation, that Braille is not appropriate for your child.',
      cite: '34 CFR § 300.324(a)(2)(iii)',
      url: IDEA('d', '300.324'),
    },
    {
      text: 'Related services can include orientation and mobility services.',
      cite: '34 CFR § 300.34(c)(7)',
      url: IDEA('a', '300.34'),
    },
  ],
  'Speech or language impairment': [
    {
      text: 'Speech or language impairment is an eligibility category under IDEA, and speech-language services can count as special education on their own — your child does not need a second disability to qualify.',
      cite: '34 CFR § 300.8(c)(11); § 300.39(a)(2)',
      url: IDEA('a', '300.8'),
    },
    {
      text: 'Speech-language pathology is also a related service that can support other special education.',
      cite: '34 CFR § 300.34(c)(15)',
      url: IDEA('a', '300.34'),
    },
  ],
  'Physical or mobility disability': [
    {
      text: 'Orthopedic impairment is an eligibility category under IDEA.',
      cite: '34 CFR § 300.8(c)(8)',
      url: IDEA('a', '300.8'),
    },
    {
      text: 'Related services can include physical therapy, occupational therapy, and transportation.',
      cite: '34 CFR § 300.34(c)(6), (c)(9), (c)(16)',
      url: IDEA('a', '300.34'),
    },
    {
      text: 'Section 504 separately requires that school programs and activities be accessible to students with disabilities.',
      cite: '34 CFR §§ 104.21–104.22',
      url: S504('104.22'),
    },
  ],
  'Chronic illness (diabetes, epilepsy, asthma, etc.)': [
    {
      text: 'IDEA’s “Other Health Impairment” category names asthma, diabetes, epilepsy, and other chronic conditions that limit strength, vitality, or alertness.',
      cite: '34 CFR § 300.8(c)(9)',
      url: IDEA('a', '300.8'),
    },
    {
      text: 'School health services and school nurse services can be related services under an IEP.',
      cite: '34 CFR § 300.34(c)(13)',
      url: IDEA('a', '300.34'),
    },
    {
      text: 'Many children with chronic illnesses are served under a Section 504 plan, which also requires a free appropriate public education.',
      cite: '34 CFR § 104.33',
      url: S504('104.33'),
    },
  ],
  'Processing or memory difficulty': [
    {
      text: 'Processing difficulties can qualify under “Specific Learning Disability,” which covers disorders in the basic psychological processes involved in understanding or using language.',
      cite: '34 CFR § 300.8(c)(10)',
      url: IDEA('a', '300.8'),
    },
    {
      text: 'The evaluation must be comprehensive enough to identify all of your child’s special education needs, in every area of suspected disability.',
      cite: '34 CFR § 300.304(c)(4), (c)(6)',
      url: IDEA('d', '300.304'),
    },
  ],
  'Not sure yet, just concerned': [
    {
      text: 'A concern is enough. Child Find requires schools to evaluate children suspected of having a disability — you do not need a diagnosis or a label to request an evaluation.',
      cite: '34 CFR § 300.111',
      url: IDEA('b', '300.111'),
    },
    {
      text: 'The evaluation must look at all areas of suspected disability, so you do not have to know the “right” category before asking.',
      cite: '34 CFR § 300.304(c)(4)',
      url: IDEA('d', '300.304'),
    },
  ],
  'Other / describe below': [
    {
      text: 'Whatever the concern, the evaluation must cover all areas of suspected disability and be comprehensive enough to identify all of your child’s needs.',
      cite: '34 CFR § 300.304(c)(4), (c)(6)',
      url: IDEA('d', '300.304'),
    },
  ],
};

// Hand-verified state-specific rules. States not listed here get an honest
// fallback (the federal default plus a referral to the state's parent
// center) rather than an AI guess.
const STATE_DATA = {
  'Virginia': {
    timeline: {
      text: 'Virginia’s own deadline applies instead of the federal default: the evaluation must be completed and eligibility decided within 65 business days of the school receiving the referral. Note where the clock starts — at the referral, which is earlier than the federal default’s start at parental consent.',
      short: '65 business days from the school’s receipt of the referral — Virginia’s rule, which replaces the federal 60-day default and starts at referral, not consent.',
      cite: '8VAC20-81-60(B)',
      url: 'https://law.lis.virginia.gov/admincode/title8/agency20/chapter81/section60/',
    },
    agency: {
      name: 'Virginia Department of Education — Special Education',
      url: 'https://www.doe.virginia.gov/programs-services/special-education',
    },
  },
};

// Deterministic next steps shown with every result.
const NEXT_STEPS = [
  {
    text: 'Put your evaluation request in writing — email works — to the principal or the special education coordinator. The legal timeline starts when the school receives it, so keep a copy.',
  },
  {
    text: 'If the school declines, it must explain why in writing. You can challenge that decision through mediation, a state complaint, or a due process hearing.',
    cite: '34 CFR §§ 300.503, 300.506–300.507',
    url: IDEA('e', '300.503'),
  },
  {
    text: 'Talk it through for free: every state has a federally funded Parent Training and Information Center staffed by people who navigate this process every day.',
    url: PARENT_CENTER_URL,
    linkLabel: 'Find your parent center',
  },
  {
    text: 'Start keeping a record. Log what has been tried and what worked in your child’s Passport — it belongs to you and follows your child across schools.',
  },
];

module.exports = {
  VERIFIED_DATE,
  PARENT_CENTER_URL,
  UNIVERSAL_RIGHTS,
  CATEGORY_RIGHTS,
  STATE_DATA,
  NEXT_STEPS,
};
