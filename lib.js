// Shared server utilities: model-output parsing and citation validation.

// Parse JSON out of a model response that may be wrapped in markdown fences
// or preceded by stray prose. Finds the outermost JSON object rather than
// trusting the whole string.
function safeParseJson(raw) {
  const cleaned = String(raw).replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end <= start) throw new Error('No JSON object in model response');
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

// Citations the app recognizes as real. The AI layer is instructed never to
// cite law (the verified database owns citations), but if a citation slips
// into its prose anyway, anything outside these ranges is removed before it
// can reach a family.
//   20 U.S.C. §§ 1400–1482  — the IDEA statute
//   29 U.S.C. § 794         — Section 504 of the Rehabilitation Act
//   34 CFR Part 300         — IDEA regulations (§§ 300.1–300.818)
//   34 CFR Part 104         — Section 504 regulations (§§ 104.1–104.61)
//   8VAC20-81               — Virginia's special education regulations
const USC_RE = /\b(\d{1,2})\s*U\.?\s*S\.?\s*C\.?\s*(?:§{1,2}\s*)?(\d{3,4})\b/gi;
const CFR_RE = /\b(\d{1,2})\s*C\.?\s*F\.?\s*R\.?\s*(?:§{1,2}\s*|[Pp]art\s*)?(\d{2,3})\.(\d{1,3})\b/gi;
const VAC_RE = /\b8\s*VAC\s*20-(\d{2,3})(?:-\d{1,3})?\b/gi;

function uscIsKnown(title, section) {
  if (title === 20) return section >= 1400 && section <= 1482;
  if (title === 29) return section === 794;
  return false;
}

function cfrIsKnown(title, part, section) {
  if (title !== 34) return false;
  if (part === 300) return section >= 1 && section <= 818;
  if (part === 104) return section >= 1 && section <= 61;
  return false;
}

// Scan text for citation-like strings and classify each as verified
// (within the known ranges above) or not.
function findCitations(text) {
  const found = [];
  let m;
  USC_RE.lastIndex = 0;
  while ((m = USC_RE.exec(text)) !== null) {
    found.push({ raw: m[0], verified: uscIsKnown(Number(m[1]), Number(m[2])) });
  }
  CFR_RE.lastIndex = 0;
  while ((m = CFR_RE.exec(text)) !== null) {
    found.push({ raw: m[0], verified: cfrIsKnown(Number(m[1]), Number(m[2]), Number(m[3])) });
  }
  VAC_RE.lastIndex = 0;
  while ((m = VAC_RE.exec(text)) !== null) {
    found.push({ raw: m[0], verified: Number(m[1]) === 81 });
  }
  return found;
}

// Remove citations that can't be verified against the known ranges.
// Returns the cleaned text and how many citations were removed.
function stripUnverifiedCitations(text) {
  let cleaned = String(text);
  let removed = 0;
  for (const c of findCitations(cleaned)) {
    if (!c.verified) {
      cleaned = cleaned.split(c.raw).join('[citation removed — could not be verified]');
      removed++;
    }
  }
  return { text: cleaned, removed };
}

module.exports = { safeParseJson, findCitations, stripUnverifiedCitations };
