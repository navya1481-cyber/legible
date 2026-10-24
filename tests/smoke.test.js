// Smoke tests for Legible's verified knowledge base and server utilities.
// Run with: npm test

const test = require('node:test');
const assert = require('node:assert');

const { safeParseJson, findCitations, stripUnverifiedCitations, decodeEntities } = require('../lib');
const { UNIVERSAL_RIGHTS, CATEGORY_RIGHTS, STATE_DATA, NEXT_STEPS, VERIFIED_DATE } = require('../rights-data');

// The exact option values of <select id="disability"> in index.html.
const DISABILITY_OPTIONS = [
  'ADHD',
  'Dyslexia or other learning disability',
  'Autism',
  'Anxiety, depression, or other mental health condition',
  'Hearing impairment',
  'Vision impairment',
  'Speech or language impairment',
  'Physical or mobility disability',
  'Chronic illness (diabetes, epilepsy, asthma, etc.)',
  'Processing or memory difficulty',
  'Not sure yet, just concerned',
  'Other / describe below',
];

test('every disability option in the UI has verified category rights', () => {
  for (const option of DISABILITY_OPTIONS) {
    assert.ok(Array.isArray(CATEGORY_RIGHTS[option]) && CATEGORY_RIGHTS[option].length > 0,
      `missing CATEGORY_RIGHTS for "${option}"`);
  }
});

test('every knowledge base entry has text, a citation, and a safe source link', () => {
  const allEntries = [
    ...UNIVERSAL_RIGHTS,
    ...Object.values(CATEGORY_RIGHTS).flat(),
  ];
  assert.ok(UNIVERSAL_RIGHTS.length >= 6, 'universal rights list looks too small');
  for (const entry of allEntries) {
    assert.ok(entry.text && entry.text.length > 20, `entry text too short: ${JSON.stringify(entry)}`);
    assert.ok(entry.cite && entry.cite.length > 3, `entry missing citation: ${entry.text}`);
    if (entry.url) {
      assert.match(entry.url, /^https:\/\//, `source link must be https: ${entry.url}`);
      assert.match(entry.url, /^https:\/\/(sites\.ed\.gov|www\.ecfr\.gov|law\.lis\.virginia\.gov|www\.parentcenterhub\.org|www\.doe\.virginia\.gov)\//,
        `source link must point to a known official domain: ${entry.url}`);
    }
  }
});

test('every citation in the knowledge base passes its own validator', () => {
  const allCites = [
    ...UNIVERSAL_RIGHTS.map(e => e.cite),
    ...Object.values(CATEGORY_RIGHTS).flat().map(e => e.cite),
    ...NEXT_STEPS.filter(s => s.cite).map(s => s.cite),
    STATE_DATA['Virginia'].timeline.cite,
  ];
  for (const cite of allCites) {
    const found = findCitations(cite);
    for (const c of found) {
      assert.ok(c.verified, `knowledge base citation failed validation: "${c.raw}" in "${cite}"`);
    }
  }
});

test('Virginia state data is complete', () => {
  const va = STATE_DATA['Virginia'];
  assert.ok(va.timeline.text.includes('65 business days'));
  assert.strictEqual(va.timeline.cite, '8VAC20-81-60(B)');
  assert.match(va.timeline.url, /^https:\/\/law\.lis\.virginia\.gov\//);
  assert.match(va.agency.url, /^https:\/\/www\.doe\.virginia\.gov\//);
});

test('next steps are present and dated knowledge base', () => {
  assert.ok(NEXT_STEPS.length >= 3);
  assert.match(VERIFIED_DATE, /^\d{4}-\d{2}-\d{2}$/);
});

test('citation validator accepts real citations', () => {
  const real = [
    '34 CFR § 300.301', '34 CFR § 300.8', '34 C.F.R. § 104.35',
    '20 U.S.C. § 1414', '29 U.S.C. § 794', '8VAC20-81-60',
  ];
  for (const cite of real) {
    const found = findCitations(cite);
    assert.ok(found.length > 0, `validator did not recognize: ${cite}`);
    assert.ok(found.every(c => c.verified), `validator rejected a real citation: ${cite}`);
  }
});

test('citation validator rejects invented citations', () => {
  const fake = ['34 CFR § 300.999', '34 CFR § 212.4', '20 U.S.C. § 9999', '8VAC20-99-10'];
  for (const cite of fake) {
    const found = findCitations(cite);
    assert.ok(found.length > 0, `validator did not even parse: ${cite}`);
    assert.ok(found.some(c => !c.verified), `validator wrongly verified an invented citation: ${cite}`);
  }
});

test('stripUnverifiedCitations removes fakes and keeps real ones', () => {
  const input = 'Under 34 CFR § 300.301 and the (invented) 34 CFR § 300.999, you have rights.';
  const { text, removed } = stripUnverifiedCitations(input);
  assert.strictEqual(removed, 1);
  assert.ok(text.includes('34 CFR § 300.301'));
  assert.ok(!text.includes('300.999'));
  assert.ok(text.includes('[citation removed'));
});

test('decodeEntities fixes HTML entities that models emit in plain text', () => {
  assert.strictEqual(decodeEntities('the child&#x27;s plan'), "the child's plan");
  assert.strictEqual(decodeEntities('&#65;DHD &amp; dyslexia'), 'ADHD & dyslexia');
  assert.strictEqual(decodeEntities('school&rsquo;s team &mdash; today'), 'school’s team — today');
  assert.strictEqual(decodeEntities('plain text stays plain'), 'plain text stays plain');
  assert.strictEqual(decodeEntities('unknown &zzz; stays'), 'unknown &zzz; stays');
});

test('Virginia timeline has a short form for the deadline card', () => {
  const tl = STATE_DATA['Virginia'].timeline;
  assert.ok(tl.short && tl.short.includes('65 business days'));
  assert.ok(tl.text.includes('referral'));
});

test('safeParseJson handles fenced, prefixed, and plain model output', () => {
  assert.deepStrictEqual(safeParseJson('{"a":1}'), { a: 1 });
  assert.deepStrictEqual(safeParseJson('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepStrictEqual(safeParseJson('Here is the JSON you asked for: {"a":{"b":2}}'), { a: { b: 2 } });
  assert.throws(() => safeParseJson('no json here'));
});
