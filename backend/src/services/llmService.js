const { GoogleGenAI, Type } = require("@google/genai");
const MatchHistory = require("../models/MatchHistory");
const generateInputHash = require("../utils/hash");
const safeParseMatchResult = require("../utils/jsonParser");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert technical recruiter and resume reviewer.
You will be given a candidate's resume text and a job description.
Analyze how well the resume matches the job description and respond with:
1. matchScore: an integer 0-100 representing overall fit
2. missingKeywords: important skills/keywords/technologies present in the job
   description but missing or weak in the resume (max 10, most important first)
3. suggestions: 3-5 specific, actionable rewrite suggestions for the resume
   (e.g. "Add a bullet quantifying impact of the X project" — not generic advice
   like "improve your resume")

Be honest and specific. Do not inflate the score to be encouraging — the user
needs an accurate assessment to actually improve their chances.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    matchScore: { type: Type.NUMBER },
    missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["matchScore", "missingKeywords", "suggestions"],
};

const LLM_TIMEOUT_MS = 20000;

// Wraps a promise with a timeout so a hung API call doesn't hold the
// request open indefinitely.
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("LLM_TIMEOUT")), ms),
    ),
  ]);
}

async function getMatchResult(userId, resumeText, jobDescriptionText) {
  const inputHash = generateInputHash(resumeText, jobDescriptionText);

  // 1. Check per-user cache first
  const cached = await MatchHistory.findOne({ userId, inputHash });
  if (cached) {
    return {
      matchScore: cached.matchScore,
      missingKeywords: cached.missingKeywords,
      suggestions: cached.suggestions,
      fromCache: true,
      historyId: cached._id,
    };
  }

  // 2. No cache hit — call the LLM
  let rawText;
  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescriptionText}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.3, // lower temperature — we want consistent, analytical output, not creative variation
        },
      }),
      LLM_TIMEOUT_MS,
    );
    rawText = response.text;
  } catch (err) {
    if (err.message === "LLM_TIMEOUT") {
      const timeoutErr = new Error(
        "The AI service took too long to respond. Please try again.",
      );
      timeoutErr.statusCode = 504;
      throw timeoutErr;
    }
    console.error("Gemini API call failed:", err.message);
    const apiErr = new Error(
      "The AI matching service is currently unavailable. Please try again shortly.",
    );
    apiErr.statusCode = 502;
    throw apiErr;
  }

  // 3. Parse and validate — never trust raw model output directly
  const result = safeParseMatchResult(rawText);

  // 4. Persist to history (this record IS the cache for next time)
  const saved = await MatchHistory.create({
    userId,
    resumeText,
    jobDescriptionText,
    inputHash,
    matchScore: result.matchScore,
    missingKeywords: result.missingKeywords,
    suggestions: result.suggestions,
    fromCache: false,
    llmProvider: "gemini",
    llmModel: process.env.GEMINI_MODEL,
  });

  return {
    matchScore: result.matchScore,
    missingKeywords: result.missingKeywords,
    suggestions: result.suggestions,
    fromCache: false,
    historyId: saved._id,
    parseError: result.parseError,
  };
}

module.exports = { getMatchResult };