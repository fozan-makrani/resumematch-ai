import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bolt, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import { getHistory } from "../api/match";

export default function History() {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getHistory(page, 10);
        if (!cancelled) {
          setHistory(data.history);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load your match history. Please try again.");
          console.log(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    // Cleanup guards against setting state after unmount/page change if the
    // request is still in flight when the user navigates away or pages again.
    return () => {
      cancelled = true;
    };
  }, [page]);

  const scoreColor = (score) => {
    if (score >= 75) return "text-accent-text";
    if (score >= 50) return "text-[#EF9F27]";
    return "text-[#E24B4A]";
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-page">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-medium text-primary">Match history</h1>
          <Link
            to="/workspace"
            className="text-sm px-3 py-1.5 rounded-lg bg-accent text-accent-soft font-medium hover:opacity-90 transition-opacity"
          >
            New match
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-secondary text-center py-8">
            Loading your history…
          </p>
        )}

        {error && (
          <div role="alert" className="text-sm text-[#E24B4A] text-center py-8">
            {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-secondary mb-4">
              You haven't run any matches yet.
            </p>
            <Link
              to="/workspace"
              className="text-sm px-4 py-2 rounded-lg bg-accent text-accent-soft font-medium hover:opacity-90 transition-opacity"
            >
              Run your first match
            </Link>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <>
            {/* Table view — sm and up */}
            <table
              className="w-full text-sm hidden sm:table"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-1 text-secondary font-medium">
                    Date
                  </th>
                  <th className="text-center py-2 px-1 text-secondary font-medium">
                    Score
                  </th>
                  <th className="text-left py-2 px-1 text-secondary font-medium">
                    Missing
                  </th>
                  <th className="text-center py-2 px-1 text-secondary font-medium">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id} className="border-b border-border">
                    <td className="py-2.5 px-1 text-primary">
                      {formatDate(item.createdAt)}
                    </td>
                    <td
                      className={`py-2.5 px-1 text-center font-medium ${scoreColor(item.matchScore)}`}
                    >
                      {item.matchScore}
                    </td>
                    <td className="py-2.5 px-1 text-secondary">
                      {item.missingKeywords.slice(0, 3).join(", ") || "—"}
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      {item.fromCache ? (
                        <Bolt size={14} className="inline text-accent-text" />
                      ) : (
                        <Sparkles size={14} className="inline text-secondary" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Card view — below sm, tables don't degrade well at narrow widths */}
            <div className="flex flex-col gap-2 sm:hidden">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="border border-border rounded-lg p-3 flex items-center gap-3"
                >
                  <span
                    className={`text-lg font-medium ${scoreColor(item.matchScore)}`}
                  >
                    {item.matchScore}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-secondary">
                      {formatDate(item.createdAt)}
                    </p>
                    <p className="text-sm text-primary truncate">
                      {item.missingKeywords.slice(0, 3).join(", ") ||
                        "No major gaps"}
                    </p>
                  </div>
                  {item.fromCache ? (
                    <Bolt
                      size={14}
                      className="text-accent-text flex-shrink-0"
                    />
                  ) : (
                    <Sparkles
                      size={14}
                      className="text-secondary flex-shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-secondary mt-4">
              <Bolt size={11} className="inline mb-0.5" /> cached, no API call ·{" "}
              <Sparkles size={11} className="inline mb-0.5" /> fresh LLM call
            </p>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border text-primary disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-secondary">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border text-primary disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}