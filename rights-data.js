// Legible's legal knowledge base.
//
// Every entry was checked against the linked official source (the U.S.
// Department of Education's IDEA regulations site, the eCFR, or state code)
// when it was written, and carries the date of that check in VERIFIED_DATE.
// Nothing in this file is generated at runtime: the AI layer may explain
// these rights in context, but it can never add to them, and every citation
// shown to a family resolves to the official text linked here.

const VERIFIED_DATE = '2026-10-24';

// Official source URL patterns (all confirmed reachable on VERIFIED_DATE):
//   IDEA regulations — https://sites.ed.gov/idea/regs/b/<subpart>/<section>
//   Section 504 regs — https://www.ecfr.gov/current/title-34/part-104/section-<n>
//   Virginia regs    — https://law.lis.virginia.gov/admincode/title8/agency20/chapter81/
const IDEA = (subpart, section) => `https://sites.ed.gov/idea/regs/b/${subpart}/${section}`;
const S504 = (section) => `https://www.ecfr.gov/current/title-34/part-104/section-${section}`;

const PARENT_CENTER_URL = 'https://www.parentcenterhub.org/find-your-center/';

// Rights that apply to every family, regardless of the concern.
const UNIVERSAL_RIGHTS = [
  {
    text: 'Every school district has a legal duty, called Child Find, to identify and evaluate any child who may have a disability. The duty belongs to the school, and it applies even without a diagnosis.',
    cite: '34 CFR § 300.111',
    url: IDEA('b', '300.111'),
  },
  {
    text: 'You can ask for an initial evaluation at any time, in writing. You do not need the school’s permission or a doctor’s diagnosis first.',
    cite: '34 CFR § 300.301(b)',
    url: IDEA('d', '300.301'),
  },
  {
    text: 'After you sign consent for testing, the school has 60 days to complete the initial evaluation, unless your state sets its own timeline. Many states do.',
    cite: '34 CFR § 300.301(c)(1)',
    url: IDEA('d', '300.301'),
  },
  {
    text: 'If your child qualifies, they are entitled to a free appropriate public education, shaped to their needs, at no cost to your family.',
    cite: '34 CFR § 300.101',
    url: IDEA('b', '300.101'),
  },
  {
    text: 'You are a legally required member of your child’s IEP team. Your observations carry weight in every decision.',
    cite: '34 CFR § 300.321(a)(1)',
    url: IDEA('d', '300.321'),
  },
  {
    text: 'Before the school changes, or refuses to change, your child’s identification, evaluation, or placement, it must explain its reasons to you in writing.',
    cite: '34 CFR § 300.503',
    url: IDEA('e', '300.503'),
  },
  {
    text: 'If you disagree with the school’s evaluation, you can ask for an independent educational evaluation at public expense. The school must then pay for one or promptly request a hearing to defend its own.',
    cite: '34 CFR § 300.502(b)',
    url: IDEA('e', '300.502'),
  },
  {
    text: 'Even if your child does not qualify under IDEA, Section 504 still protects them from disability discrimination, and can require accommodations when a condition substantially limits a major life activity such as learning.',
    cite: '29 U.S.C. § 794; 34 CFR § 104.33',
    url: S504('104.33'),
  },
];

// Rights specific to each concern. Keys match the <select id="disability">
// option values in index.html exactly. Each entry has a short title the UI
// shows as a heading, with the fuller explanation underneath.
const CATEGORY_RIGHTS = {
  'ADHD': [
    {
      title: 'ADHD is named in the law',
      text: 'IDEA’s Other Health Impairment category lists ADHD by name. A diagnosis alone does not decide anything, though: the evaluation team looks at whether ADHD adversely affects your child’s education.',
      cite: '34 CFR § 300.8(c)(9)',
      url: IDEA('a', '300.8'),
    },
    {
      title: 'Behavior support is part of the plan',
      text: 'When behavior gets in the way of learning, the IEP team must consider positive behavioral supports, not just discipline.',
      cite: '34 CFR § 300.324(a)(2)(i)',
      url: IDEA('d', '300.324'),
    },
  ],
  'Dyslexia or other learning disability': [
    {
      title: 'Dyslexia is in the definition',
      text: 'IDEA’s Specific Learning Disability category names dyslexia. Schools may use the word in evaluations and IEP documents.',
      cite: '34 CFR § 300.8(c)(10)',
      url: IDEA('a', '300.8'),
    },
    {
      title: 'The evaluation must be thorough',
      text: 'Testing has to cover every area tied to the suspected disability, including reading, writing, and language processing.',
      cite: '34 CFR § 300.304(c)(4)',
      url: IDEA('d', '300.304'),
    },
    {
      title: 'Waiting is not a substitute',
      text: 'A school may not use a response-to-intervention process to delay or deny an evaluation you have requested.',
      cite: 'U.S. Dept. of Education, OSEP Memo 11-07',
      url: null,
    },
  ],
  'Autism': [
    {
      title: 'Autism is its own category',
      text: 'If autism affects your child’s education, they may be entitled to specially designed instruction, not just classroom accommodations.',
      cite: '34 CFR § 300.8(c)(1)',
      url: IDEA('a', '300.8'),
    },
    {
      title: 'Communication and behavior count',
      text: 'The IEP team must consider your child’s communication needs, and positive behavior supports when behavior affects learning.',
      cite: '34 CFR § 300.324(a)(2)',
      url: IDEA('d', '300.324'),
    },
  ],
  'Anxiety, depression, or other mental health condition': [
    {
      title: 'Mental health is covered',
      text: 'Anxiety, depression, and other conditions can qualify under IDEA when they affect educational performance, or under Section 504 when they substantially limit a major life activity.',
      cite: '34 CFR § 300.8(c)(4), (c)(9)',
      url: IDEA('a', '300.8'),
    },
    {
      title: 'Counseling can be a school service',
      text: 'Related services under IDEA include psychological services, counseling, and social work in school.',
      cite: '34 CFR § 300.34(c)',
      url: IDEA('a', '300.34'),
    },
  ],
  'Hearing impairment': [
    {
      title: 'Hearing differences are covered',
      text: 'Deafness and hearing impairment are both eligibility categories under IDEA.',
      cite: '34 CFR § 300.8(c)(3), (c)(5)',
      url: IDEA('a', '300.8'),
    },
    {
      title: 'Language access gets specific attention',
      text: 'The IEP team must consider your child’s language and communication needs, including direct instruction in their own language and communication mode.',
      cite: '34 CFR § 300.324(a)(2)(iv)',
      url: IDEA('d', '300.324'),
    },
    {
      title: 'Services can include interpreters',
      text: 'Audiology and interpreting services are recognized related services.',
      cite: '34 CFR § 300.34(c)(1), (c)(4)',
      url: IDEA('a', '300.34'),
    },
  ],
  'Vision impairment': [
    {
      title: 'Vision loss is covered',
      text: 'Visual impairment, including blindness, is an eligibility category under IDEA.',
      cite: '34 CFR § 300.8(c)(13)',
      url: IDEA('a', '300.8'),
    },
    {
      title: 'Braille is the default consideration',
      text: 'The IEP team must provide for Braille instruction unless an evaluation shows it is not appropriate for your child.',
      cite: '34 CFR § 300.324(a)(2)(iii)',
      url: IDEA('d', '300.324'),
    },
    {
      title: 'Getting around counts too',
      text: 'Orientation and mobility services are recognized related services.',
      cite: '34 CFR § 300.34(c)(7)',
      url: IDEA('a', '300.34'),
    },
  ],
  'Speech or language impairment': [
    {
      title: 'Speech services can stand alone',
      text: 'Speech or language impairment is its own category, and speech services can count as special education on their own. Your child does not need a second disability to qualify.',
      cite: '34 CFR § 300.8(c)(11); § 300.39(a)(2)',
      url: IDEA('a', '300.8'),
    },
    {
      title: 'Support can come alongside',
      text: 'Speech-language pathology is also a related service that can support other special education.',
      cite: '34 CFR § 300.34(c)(15)',
      url: IDEA('a', '300.34'),
    },
  ],
  'Physical or mobility disability': [
    {
      title: 'Mobility needs are covered',
      text: 'Orthopedic impairment is an eligibility category under IDEA.',
      cite: '34 CFR § 300.8(c)(8)',
      url: IDEA('a', '300.8'),
    },
    {
      title: 'Therapy can be part of school',
      text: 'Physical therapy, occupational therapy, and transportation are recognized related services.',
      cite: '34 CFR § 300.34(c)(6), (c)(9), (c)(16)',
      url: IDEA('a', '300.34'),
    },
    {
      title: 'Programs must be accessible',
      text: 'Section 504 separately requires school programs and activities to be accessible to students with disabilities.',
      cite: '34 CFR §§ 104.21–104.22',
      url: S504('104.22'),
    },
  ],
  'Chronic illness (diabetes, epilepsy, asthma, etc.)': [
    {
      title: 'Chronic conditions are named',
      text: 'IDEA’s Other Health Impairment category lists asthma, diabetes, epilepsy, and other conditions that limit strength, vitality, or alertness.',
      cite: '34 CFR § 300.8(c)(9)',
      url: IDEA('a', '300.8'),
    },
    {
      title: 'The nurse’s office can be in the plan',
      text: 'School health services and school nurse services can be written into an IEP as related services.',
      cite: '34 CFR § 300.34(c)(13)',
      url: IDEA('a', '300.34'),
    },
    {
      title: 'A 504 plan may fit',
      text: 'Many children with chronic illnesses are served under a Section 504 plan, which also requires a free appropriate public education.',
      cite: '34 CFR § 104.33',
      url: S504('104.33'),
    },
  ],
  'Processing or memory difficulty': [
    {
      title: 'Processing differences can qualify',
      text: 'Specific Learning Disability covers disorders in the basic psychological processes behind understanding and using language.',
      cite: '34 CFR § 300.8(c)(10)',
      url: IDEA('a', '300.8'),
    },
    {
      title: 'The evaluation must find everything',
      text: 'Testing must be comprehensive enough to identify all of your child’s needs, in every area of suspected disability.',
      cite: '34 CFR § 300.304(c)(4), (c)(6)',
      url: IDEA('d', '300.304'),
    },
  ],
  'Not sure yet, just concerned': [
    {
      title: 'A concern is enough',
      text: 'Child Find requires schools to evaluate children suspected of having a disability. You do not need a diagnosis or a label to ask.',
      cite: '34 CFR § 300.111',
      url: IDEA('b', '300.111'),
    },
    {
      title: 'You don’t have to pick a category',
      text: 'The evaluation itself must look at every area of suspected disability, so you do not need to know the right name before asking.',
      cite: '34 CFR § 300.304(c)(4)',
      url: IDEA('d', '300.304'),
    },
  ],
  'Other / describe below': [
    {
      title: 'The evaluation must be complete',
      text: 'Whatever the concern, testing must cover every area of suspected disability and be thorough enough to identify all of your child’s needs.',
      cite: '34 CFR § 300.304(c)(4), (c)(6)',
      url: IDEA('d', '300.304'),
    },
  ],
};

// State-specific rules, verified against that state's code. States not
// listed here get an honest fallback (the federal default plus a referral
// to the state's parent center) rather than a guess.
const STATE_DATA = {
  'Virginia': {
    timeline: {
      text: 'Virginia’s own deadline applies instead of the federal default: the evaluation must be completed and eligibility decided within 65 business days of the referral being received by the school division’s special education administrator or designee. The clock starts at that referral, not at parental consent. Limited exceptions exist, such as a family repeatedly missing evaluation appointments.',
      short: '65 business days, counted from the day the special education administrator or designee receives the referral. This replaces the federal 60-day default and starts at referral, not at consent. A few exceptions exist, like repeatedly missed evaluation appointments.',
      cite: '8VAC20-81-60(B)',
      url: 'https://law.lis.virginia.gov/admincode/title8/agency20/chapter81/section60/',
    },
    agency: {
      name: 'Virginia Department of Education, Special Education',
      url: 'https://www.doe.virginia.gov/programs-services/special-education',
    },
  },
};

// What the family wants to do next. The chosen intent drives the letter
// button's label and the instructions the letter generator receives, so
// the drafted letter actually matches the promised action.
const INTENTS = {
  evaluation: {
    ctaLabel: 'Draft my evaluation request',
    letterInstruction: 'a formal written request for an initial special education evaluation. Ask the school to treat the letter as a referral, request written confirmation of the date it was received, and ask for a copy of the procedural safeguards notice for parents.',
  },
  accommodation: {
    ctaLabel: 'Draft my accommodation request',
    letterInstruction: 'a formal request for specific accommodations appropriate to the concern, under a Section 504 plan or the child’s existing plan. Ask for a written response, and for written reasons if the school declines.',
  },
  refusal: {
    ctaLabel: 'Draft my response to the school',
    letterInstruction: 'a measured, firm response to a school that declined the family’s request. Restate the request, ask for the school’s reasons in writing as prior written notice, and note that the family understands it can pursue mediation, a state complaint, or a due process hearing. Keep the tone collaborative, never threatening.',
  },
  meeting: {
    ctaLabel: 'Draft my meeting request',
    letterInstruction: 'a formal request to convene the child’s IEP or Section 504 team to review current supports. Propose meeting within a reasonable time and briefly list the family’s main concerns to discuss.',
  },
};

// Deterministic next steps shown with every result: a short action first,
// then the detail.
const NEXT_STEPS = [
  {
    title: 'Put it in writing.',
    text: 'Email the principal or the special education director, keep a copy, and ask them to confirm they received it. A written request creates a record, and in many states it begins the referral process.',
  },
  {
    title: 'If the school says no, ask why in writing.',
    text: 'Schools must give you written reasons before refusing to evaluate. You can challenge that decision through mediation, a state complaint, or a due process hearing.',
    cite: '34 CFR §§ 300.503, 300.506–300.507',
    url: IDEA('e', '300.503'),
  },
  {
    title: 'Get free local guidance.',
    text: 'Every state has a federally funded Parent Training and Information Center staffed by people who navigate this process every day.',
    url: PARENT_CENTER_URL,
    linkLabel: 'Find your parent center',
  },
  {
    title: 'Keep a record.',
    text: 'Log what has been tried and what worked in your child’s Passport. It belongs to you and follows your child across schools.',
  },
];

module.exports = {
  VERIFIED_DATE,
  PARENT_CENTER_URL,
  UNIVERSAL_RIGHTS,
  CATEGORY_RIGHTS,
  STATE_DATA,
  INTENTS,
  NEXT_STEPS,
};
