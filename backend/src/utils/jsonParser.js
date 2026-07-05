// Safely parses LLM JSON output with a fallback shape, so a single
// malformed response never crashes the request or corrupts saved history.
const FALLBACK_RESULT = {
  matchScore: 0,
  missingKeywords: [],
  suggestions: [
    'The analysis could not be completed due to an unexpected response format. Please try again.',
  ],
  parseError: true,
};

function safeParseMatchResult(rawText) {
  let candidate = rawText.trim();

  // Defensive: strip markdown code fences if the model wraps JSON in ```json ... ```
  // despite responseSchema enforcement (belt-and-suspenders for a preview/edge case).
  candidate = candidate.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');

  let parsed;
  try {
    parsed = JSON.parse(candidate);
  } catch (err) {
    console.error('LLM JSON parse failed:', err.message, '| raw:', rawText.slice(0, 300));
    return FALLBACK_RESULT;
  }

  // Validate shape — don't trust the LLM blindly even when JSON.parse succeeds
  const isValidScore =
    typeof parsed.matchScore === 'number' && parsed.matchScore >= 0 && parsed.matchScore <= 100;
  const isValidKeywords = Array.isArray(parsed.missingKeywords);
  const isValidSuggestions = Array.isArray(parsed.suggestions);

  if (!isValidScore || !isValidKeywords || !isValidSuggestions) {
    console.error('LLM JSON shape invalid:', JSON.stringify(parsed).slice(0, 300));
    return FALLBACK_RESULT;
  }

  return {
    matchScore: Math.round(parsed.matchScore),
    missingKeywords: parsed.missingKeywords.map(String).slice(0, 20), // cap defensively
    suggestions: parsed.suggestions.map(String).slice(0, 5),
    parseError: false,
  };
}

module.exports = safeParseMatchResult;