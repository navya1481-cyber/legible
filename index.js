const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { safeParseJson, stripUnverifiedCitations, decodeEntities } = require('./lib');
const {
  VERIFIED_DATE, PARENT_CENTER_URL,
  UNIVERSAL_RIGHTS, CATEGORY_RIGHTS, STATE_DATA, NEXT_STEPS,
} = require('./rights-data');

const app = express();

// ── Event persistence via Upstash Redis (free, survives all deploys) ──
// Fallback: in-memory only (resets on redeploy) if env vars not set.
async function redisCmd(...args) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    const data = await res.json();
    return data.result;
  } catch(e) { return null; }
}

let eventLog = [];

async function loadEvents() {
  const raw = await redisCmd('lrange', 'legible_events', 0, -1);
  if (!raw) return;
  eventLog = raw.map(s => { try { return JSON.parse(s); } catch(e) { return null; } }).filter(Boolean);
  console.log(`Loaded ${eventLog.length} events from Upstash.`);
}

async function logEvent(type, details, success) {
  const event = { t: new Date().toISOString(), type, success, ...details };
  eventLog.push(event);
  if (eventLog.length > 10000) eventLog.splice(0, eventLog.length - 10000);
  // Persist to Redis — fire and forget
  redisCmd('rpush', 'legible_events', JSON.stringify(event))
    .then(() => redisCmd('ltrim', 'legible_events', -10000, -1))
    .catch(() => {});
}

// Load persisted events before server starts
loadEvents().then(() => {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Legible backend running on port ${PORT}`));
});

const allowedOrigins = [
  'https://getlegible.org',
  'https://www.getlegible.org',
  'https://legible-nn7i.onrender.com',
  'http://localhost:3001',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  }
}));

// Redirect www to non-www
app.use((req, res, next) => {
  if (req.hostname === 'www.getlegible.org') {
    return res.redirect(301, 'https://getlegible.org' + req.url);
  }
  next();
});

app.set('trust proxy', 1); // Render sits behind a proxy
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You have reached the request limit. Please try again later.' },
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// Files are held in memory only for the duration of a single request.
// They are never written to disk and never logged.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

async function callClaude(messages, maxTokens = 1500) {
  const headers = { "Content-Type": "application/json" };
  // When deployed outside the Claude Artifacts environment, this key must be set.
  if (process.env.ANTHROPIC_API_KEY) {
    headers["x-api-key"] = process.env.ANTHROPIC_API_KEY;
    headers["anthropic-version"] = "2023-06-01";
  }
  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${text}`);
  }
  const data = await response.json();
  return data.content.map(b => b.text || "").join("");
}

// ---------- Rights Navigator ----------
// Architecture: the legal content (federal rights, citations, state
// timelines, next steps) comes from the hand-verified database in
// rights-data.js and is returned deterministically — it cannot be wrong in
// a new way at runtime. The AI is used only as an explanation layer: it
// connects the family's described situation to the process in plain
// English, is instructed never to state law or citations, and its output
// is passed through a citation validator as a backstop. If the AI call
// fails, the verified content is still returned.
app.post('/api/rights', apiLimiter, async (req, res) => {
  try {
    const { state, grade, disability, extra } = req.body;
    if (typeof state !== 'string' || typeof grade !== 'string' || typeof disability !== 'string'
        || !state || !grade || !disability || state.length > 40 || grade.length > 60 || disability.length > 120) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const categoryRights = CATEGORY_RIGHTS[disability] || CATEGORY_RIGHTS['Other / describe below'];

    // The three facts a parent needs first, with the deadline resolved for
    // their state (verified state rule when we have one, honest federal
    // default when we don't).
    const stateEntry = STATE_DATA[state];
    const essentials = [
      {
        label: 'You can act today',
        text: 'Request an evaluation at any time, in writing. You don’t need a diagnosis or the school’s permission to ask.',
        cite: '34 CFR § 300.301(b)',
        url: 'https://sites.ed.gov/idea/regs/b/d/300.301',
      },
      stateEntry
        ? {
            label: 'The deadline that applies',
            text: stateEntry.timeline.short || stateEntry.timeline.text,
            cite: stateEntry.timeline.cite,
            url: stateEntry.timeline.url,
            stateVerified: true,
            agency: stateEntry.agency,
          }
        : {
            label: 'The deadline that applies',
            text: `60 days from the school receiving your written consent — the federal default. ${state} may set its own timeframe; we haven't hand-verified it yet, so your state's free parent center can confirm it.`,
            cite: '34 CFR § 300.301(c)(1)',
            url: 'https://sites.ed.gov/idea/regs/b/d/300.301',
            stateVerified: false,
            parentCenterUrl: PARENT_CENTER_URL,
          },
      {
        label: 'It costs you nothing',
        text: 'Public school evaluations, and the services that follow if your child qualifies, are provided at public expense.',
        cite: '34 CFR § 300.101',
        url: 'https://sites.ed.gov/idea/regs/b/b/300.101',
      },
    ];

    // AI explanation layer — optional, clearly scoped, never load-bearing.
    let ai = null;
    let aiUnavailable = false;
    const extraContext = typeof extra === 'string' ? extra.slice(0, 2000) : '';
    try {
      const prompt = `You are the explanation layer of Legible, a special education rights tool. A family in ${state} has a child in ${grade} with this concern: ${disability}.${extraContext ? " The family added: \"" + extraContext + "\"" : ""}

A separate hand-verified database already shows this family their legal rights with official citations. Your job is ONLY to connect their specific situation to the process, in warm, plain English a tired parent can read quickly.

Strict rules:
- You may describe the process in general terms (for example, that an evaluation can be requested in writing, or that school decisions can be formally challenged), but do NOT state any specific legal rules, numbers, deadlines, or timelines, and do NOT cite statutes or regulations. The verified database handles all specifics.
- Do NOT make eligibility determinations. Never say the child qualifies or will qualify; use "may" language.
- Do NOT invent facts about ${state}.
- If the family's added context describes a dispute or a denial, acknowledge it directly and note, in general terms, that they have formal ways to challenge school decisions.

Respond ONLY with valid JSON, no markdown:
{
  "applies": "3-5 sentences connecting their situation to the evaluation/IEP/504 process",
  "questions": ["up to 4 specific questions this family could ask their school, tailored to their situation"]
}`;

      const raw = await callClaude([{ role: "user", content: prompt }], 700);
      const parsed = safeParseJson(raw);
      const applies = stripUnverifiedCitations(decodeEntities(String(parsed.applies || '').slice(0, 1500)));
      const questions = Array.isArray(parsed.questions)
        ? parsed.questions.slice(0, 4).map(q => stripUnverifiedCitations(decodeEntities(String(q).slice(0, 300))).text)
        : [];
      if (applies.text.trim()) {
        ai = { applies: applies.text, questions, citationsRemoved: applies.removed };
      } else {
        aiUnavailable = true;
      }
    } catch (err) {
      console.error('Rights AI layer unavailable:', err.message);
      aiUnavailable = true;
    }

    logEvent('rights', { state, grade, disability: disability.slice(0, 80) }, true);
    res.json({
      version: 3,
      verifiedDate: VERIFIED_DATE,
      topic: { state, grade, disability },
      essentials,
      category: categoryRights,
      universal: UNIVERSAL_RIGHTS,
      ai,
      aiUnavailable,
      nextSteps: NEXT_STEPS,
    });
  } catch (err) {
    console.error("Rights lookup failed:", err.message);
    logEvent('rights', { state: req.body.state, grade: req.body.grade, disability: (req.body.disability || '').slice(0, 80) }, false);
    res.status(500).json({ error: "Could not generate rights information. Please try again." });
  }
});

// ---------- Letter Generation (on-demand) ----------
app.post('/api/letter', apiLimiter, async (req, res) => {
  try {
    const { state, grade, disability, extra } = req.body;
    if (typeof state !== 'string' || typeof grade !== 'string' || typeof disability !== 'string'
        || !state || !grade || !disability || state.length > 40 || grade.length > 60 || disability.length > 120) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Citations come from the verified database, never from the client or
    // the model's own memory.
    const categoryRights = CATEGORY_RIGHTS[disability] || CATEGORY_RIGHTS['Other / describe below'];
    const allowedCites = [...new Set([
      ...categoryRights.map(r => r.cite),
      '34 CFR § 300.301(b)',
      '34 CFR § 300.111',
    ])].join('; ');
    const extraContext = typeof extra === 'string' ? extra.slice(0, 2000) : '';

    const prompt = `Write a formal, ready-to-send accommodation request letter for a parent in ${state} whose child is in ${grade} with the following concern: ${disability}.${extraContext ? " Additional context: " + extraContext : ""}

The letter should be addressed to 'Dear Principal/IEP Team,' and request evaluation or accommodations appropriate to the concern. When citing law, use ONLY citations from this verified list, exactly as written: ${allowedCites}. Do not cite anything not on that list, and do not state any state-specific timelines or deadlines. Write the full letter body only, 3 to 4 paragraphs, professional tone. Use only these placeholders: [Child's Name], [Your Name], [School Name]. No subject line, no greeting before 'Dear', no sign-off — just the body paragraphs.`;

    const letterBody = await callClaude([{ role: "user", content: prompt }], 700);
    const cleaned = stripUnverifiedCitations(decodeEntities(letterBody.trim()));
    logEvent('letter', { state, grade, disability: disability.slice(0, 80) }, true);
    res.json({ letterBody: cleaned.text, citationsRemoved: cleaned.removed });
  } catch (err) {
    console.error("Letter generation failed:", err.message);
    logEvent('letter', { state: req.body.state, grade: req.body.grade, disability: (req.body.disability || '').slice(0, 80) }, false);
    res.status(500).json({ error: "Could not generate the letter. Please try again." });
  }
});

// ---------- IEP / 504 Document Analysis ----------
// The uploaded file or pasted text is used only for this single request.
// It is never written to disk, never logged, and never persisted anywhere.
app.post('/api/analyze-document', apiLimiter, upload.single('document'), async (req, res) => {
  try {
    let documentText = req.body.pastedText || "";

    if (req.file) {
      // Only plain text extraction is supported in this minimal server.
      // PDF/image OCR would need a parsing library added here, still in-memory only.
      documentText = req.file.buffer.toString('utf-8');
    }

    if (!documentText || documentText.trim().length < 20) {
      return res.status(400).json({ error: "Please paste the document text or upload a plain text version." });
    }

    const prompt = `You are a precise special education document assistant. Below is the text of a family's IEP or 504 plan. Explain, in plain English, what this document actually grants the student: specific accommodations, services, and any goals listed. Then flag, gently and without alarming the family, anything that seems to be missing or unusually vague compared to typical legally required components of an IEP or 504 plan, such as missing measurable goals, missing accommodation specifics, or missing review dates.

Document text:
"""
${documentText.slice(0, 12000)}
"""

Respond ONLY with valid JSON, no markdown:
{
  "summary": "2-3 sentence plain language summary of what this document grants",
  "accommodations": ["accommodation 1 in plain language", "accommodation 2"],
  "concerns": ["anything that looks missing or vague, in plain warm language, or an empty array if nothing stands out"],
  "questions": ["up to 3 specific questions the family could ask at their next school meeting, based on this document"]
}`;

    const raw = await callClaude([{ role: "user", content: prompt }], 1200);
    const parsed = safeParseJson(raw);
    parsed.summary = decodeEntities(String(parsed.summary || ''));
    for (const key of ['accommodations', 'concerns', 'questions']) {
      if (Array.isArray(parsed[key])) parsed[key] = parsed[key].map(v => decodeEntities(String(v)));
    }

    logEvent('analyze', { chars: documentText.length }, true);
    // documentText and req.file are not referenced again after this point
    // and go out of scope once the response is sent. Nothing is persisted.
    res.json(parsed);
  } catch (err) {
    console.error("Document analysis failed:", err.message);
    logEvent('analyze', {}, false);
    res.status(500).json({ error: "Could not analyze the document. Please try again." });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true, kbVerified: VERIFIED_DATE }));

// Admin event log — protected by ADMIN_KEY env var
app.get('/api/admin/events', (req, res) => {
  const key = req.query.key || req.headers['x-admin-key'];
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const persistent = !!(process.env.UPSTASH_REDIS_REST_URL);
  res.json({ events: eventLog.slice().reverse(), total: eventLog.length, persistent });
});

