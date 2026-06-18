const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
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

function safeParseJson(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ---------- Rights Navigator ----------
app.post('/api/rights', apiLimiter, async (req, res) => {
  try {
    const { state, grade, disability, extra } = req.body;
    if (!state || !grade || !disability) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const prompt = `You are a precise, accurate special education rights assistant for a website called Legible. A family in ${state} has a child in ${grade} with the following concern: ${disability}.${extra ? " Additional context from the family: " + extra : ""}

Explain, in warm but precise plain English, exactly what federal law (IDEA and Section 504 of the Rehabilitation Act) guarantees this family, and note any commonly known ${state}-specific evaluation timelines or procedural rules if you are confident about them. If you are not confident about a state-specific detail, default to the accurate federal timeline and say so rather than guessing.

Respond ONLY with valid JSON in this exact format, no markdown, no preamble:
{
  "heading": "a short heading like 'Here is what Virginia and federal law say'",
  "points": ["point 1 in plain language, one full sentence each", "point 2", "point 3", "point 4"],
  "citation": "Citations: [real statute citations, e.g. Section 504 of the Rehabilitation Act, 34 CFR 104.35; IDEA 20 U.S.C. 1414]"
}`;

    const raw = await callClaude([{ role: "user", content: prompt }], 600);
    const parsed = safeParseJson(raw);
    res.json(parsed);
  } catch (err) {
    console.error("Rights lookup failed:", err.message);
    res.status(500).json({ error: "Could not generate rights information. Please try again." });
  }
});

// ---------- Letter Generation (on-demand) ----------
app.post('/api/letter', apiLimiter, async (req, res) => {
  try {
    const { state, grade, disability, extra, citation } = req.body;
    if (!state || !grade || !disability) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const prompt = `Write a formal, ready-to-send accommodation request letter for a parent in ${state} whose child is in ${grade} with the following concern: ${disability}.${extra ? " Additional context: " + extra : ""}

The letter should be addressed to 'Dear Principal/IEP Team,' cite the relevant law (IDEA and/or Section 504), and request evaluation or accommodations appropriate to the concern. Write the full letter body only, 3 to 4 paragraphs, professional tone. Use only these placeholders: [Child's Name], [Your Name], [School Name]. No subject line, no greeting before 'Dear', no sign-off — just the body paragraphs.`;

    const letterBody = await callClaude([{ role: "user", content: prompt }], 700);
    res.json({ letterBody: letterBody.trim() });
  } catch (err) {
    console.error("Letter generation failed:", err.message);
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
  "concerns": ["anything that looks missing or vague, in plain warm language, or an empty array if nothing stands out"]
}`;

    const raw = await callClaude([{ role: "user", content: prompt }], 1200);
    const parsed = safeParseJson(raw);

    // documentText and req.file are not referenced again after this point
    // and go out of scope once the response is sent. Nothing is persisted.
    res.json(parsed);
  } catch (err) {
    console.error("Document analysis failed:", err.message);
    res.status(500).json({ error: "Could not analyze the document. Please try again." });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Legible backend running on port ${PORT}`));
