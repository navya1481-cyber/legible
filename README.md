# Legible

**[getlegible.org](https://getlegible.org)** — a free web app that helps families understand and use their special education rights: IEPs, Section 504, IDEA, and accommodations, in plain language, for all 50 states.

Built by [Navya Tuteja](https://www.linkedin.com/in/navya-tuteja-440193319/).

## What it does

- **Evaluation screener** — 27 questions across six areas of a child's school experience, scored entirely in the browser. Nothing is sent anywhere.
- **Rights checker** — verified federal rights (with official citations and links) for the family's state, grade, and concern, plus an AI-generated explanation of how it may apply to their situation.
- **Document explainer** — paste an IEP or 504 plan and get a plain-English breakdown of what it grants and what looks vague or missing. Pasted text is processed once and never stored.
- **Letter generator** — a formal accommodation-request letter the family can edit in place, copy, or download as a PDF.
- **Student Passport** — a record of what's been tried and what worked, stored only in the family's own browser (localStorage), exportable as a PDF. It belongs to the family, not the school.

## How trustworthiness is engineered

The core design decision: **legal content is never generated at runtime.**

1. **Verified knowledge base** (`rights-data.js`) — every federal right shown to a family was hand-checked against the official text (ED.gov's IDEA regulation pages, the eCFR for Section 504, state code for state rules). Each entry carries its citation, a link to the official source, and the date it was verified. Smoke tests enforce that every UI concern category has coverage and that every citation in the knowledge base passes the validator.
2. **AI as an explanation layer only** (`index.js`, `/api/rights`) — Claude is prompted under strict rules: it may describe the process only in general terms — no specific legal rules or timelines, no eligibility determinations, no citations. Its only job is connecting the family's described situation to the process in plain English and suggesting questions to ask the school.
3. **Citation validator** (`lib.js`) — a backstop that scans AI output for citation-like text and removes anything outside the known ranges of IDEA (20 U.S.C. §§ 1400–1482, 34 CFR Part 300), Section 504 (29 U.S.C. § 794, 34 CFR Part 104), and Virginia's regulations (8VAC20-81). Letter generation is restricted to citations from the verified list.
4. **Graceful degradation** — if the AI call fails, the verified rights, state information, and next steps still return. The AI is never load-bearing.
5. **State honesty** — state timelines appear only when hand-verified against state code (Virginia first: 65 business days, 8VAC20-81-60). Other states get the federal default plus a link to their federally funded parent center — never a guess.

## Architecture

```
index.html          single-page frontend (vanilla JS, no framework)
translations.js     UI + pre-translated rights content (en, es, zh, vi, ar, hi)
index.js            Node/Express backend: static hosting + 3 AI endpoints
rights-data.js      hand-verified legal knowledge base (data only)
lib.js              citation validator + model-output parsing
admin.html          /admin — live activity dashboard (ADMIN_KEY-gated)
tests/              smoke tests (npm test)
```

The backend holds the Anthropic API key so it is never exposed to the browser, rate-limits AI endpoints (20/hour/IP), and keeps an anonymous event log (feature, state, grade, category, timestamp — never free text) in Upstash Redis for reliability monitoring.

## Privacy, by design

- The screener runs entirely client-side; answers never leave the page.
- The Passport lives in the user's own localStorage, never on a server.
- Pasted documents are held in memory for a single request — never written to disk, logged, or retained.
- No accounts, no sign-ups. Google Analytics counts aggregate feature usage only.

The privacy policy in the app matches this implementation precisely.

## Run it locally

```
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # required for the AI endpoints
npm start                              # serves http://localhost:3001
npm test                               # knowledge base + validator smoke tests
```

Without an API key the site still runs; AI endpoints return errors and the frontend degrades gracefully (the verified content requires no AI).

Optional environment variables: `ADMIN_KEY` (enables `/admin`), `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (persists the event log), `PORT`.

## Deploy

Deployed on Render from this repository. Set the environment variables above in the Render dashboard — never in code.
