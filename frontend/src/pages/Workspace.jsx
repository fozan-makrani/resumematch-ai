import { useState } from "react";
import { Bolt, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import ScoreRing from "../components/ScoreRing";
import { submitMatch } from "../api/match";

const MIN_LENGTH = 50;
const MAX_LENGTH = 15000;

export default function Workspace() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [result, setResult] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  const validationError = () => {
    if (
      resumeText.trim().length < MIN_LENGTH ||
      jobDescriptionText.trim().length < MIN_LENGTH
    ) {
      return `Both fields need at least ${MIN_LENGTH} characters.`;
    }
    if (
      resumeText.length > MAX_LENGTH ||
      jobDescriptionText.length > MAX_LENGTH
    ) {
      return `Each field must be under ${MAX_LENGTH.toLocaleString()} characters.`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const clientError = validationError();
    if (clientError) {
      setError(clientError);
      return;
    }

    setLoading(true);
    setError(null);
    setRateLimitInfo(null);

    try {
      const data = await submitMatch(resumeText, jobDescriptionText);
      setResult(data);
      setUsage(data.usage);
    } catch (err) {
      if (err.response?.status === 429) {
        setRateLimitInfo({
          message: err.response.data.error,
          resetsAt: err.response.data.resetsAt,
        });
      } else {
        setError(
          err.response?.data?.error ||
            "Something went wrong. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatResetTime = (isoString) => {
    const resetDate = new Date(isoString);
    return resetDate.toLocaleString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <div className="min-h-screen bg-page">
      <Navbar remaining={usage?.remaining} limit={usage?.limit} />

      <div className="max-w-3xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-secondary block mb-1.5">
              Your resume
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here"
              className="w-full h-32 md:h-40 p-3 rounded-lg bg-panel border border-border text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <p className="text-xs text-secondary mt-1 text-right">
              {resumeText.length.toLocaleString()} /{" "}
              {MAX_LENGTH.toLocaleString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-secondary block mb-1.5">
              Job description
            </label>
            <textarea
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              placeholder="Paste the job description here"
              className="w-full h-32 md:h-40 p-3 rounded-lg bg-panel border border-border text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <p className="text-xs text-secondary mt-1 text-right">
              {jobDescriptionText.length.toLocaleString()} /{" "}
              {MAX_LENGTH.toLocaleString()}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 text-sm text-[#E24B4A] bg-[rgba(226,75,74,0.1)] border border-[rgba(226,75,74,0.3)] rounded-lg px-3 py-2"
          >
            {error}
          </div>
        )}

        {rateLimitInfo && (
          <div
            role="alert"
            className="mb-4 text-sm text-[#EF9F27] bg-[rgba(239,159,39,0.1)] border border-[rgba(239,159,39,0.3)] rounded-lg px-3 py-2"
          >
            {rateLimitInfo.message} Resets at{" "}
            {formatResetTime(rateLimitInfo.resetsAt)}.
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-accent text-accent-soft font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mb-6"
        >
          {loading ? "Analyzing…" : "Analyze match"}
        </button>

        {result && (
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row gap-4">
            <ScoreRing score={result.matchScore} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-primary">
                  Missing keywords
                </p>
                <span className="text-xs text-secondary flex items-center gap-1">
                  {result.fromCache ? (
                    <>
                      <Bolt size={12} /> served from cache
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} /> fresh analysis
                    </>
                  )}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap mb-4">
                {result.missingKeywords.length === 0 ? (
                  <span className="text-xs text-secondary">
                    No major gaps found.
                  </span>
                ) : (
                  result.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs bg-[#412402] text-[#FAC775] rounded-full px-2.5 py-1"
                    >
                      {kw}
                    </span>
                  ))
                )}
              </div>
              <p className="text-sm font-medium text-primary mb-2">
                Rewrite suggestions
              </p>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-secondary flex gap-2">
                    <span className="text-accent-text">·</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}