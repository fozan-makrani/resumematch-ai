import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";

export default function Landing() {
  return (
    <div className="min-h-screen bg-page">
      <nav className="flex items-center justify-between px-6 py-4 md:px-10 md:py-5">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden sm:inline-block text-sm px-4 py-2 rounded-lg border border-border text-primary hover:bg-panel transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-sm px-4 py-2 rounded-lg bg-accent text-accent-soft font-medium hover:opacity-90 transition-opacity"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <div className="grid md:grid-cols-[1.1fr_0.9fr] min-h-[calc(100vh-80px)]">
        <div className="flex flex-col justify-center px-6 py-12 md:px-16 max-w-xl">
          <h1 className="text-3xl md:text-4xl font-medium leading-tight mb-4 text-primary">
            Stop guessing why your resume gets ignored
          </h1>
          <p className="text-sm md:text-base text-secondary mb-6 max-w-md">
            A match score, the missing keywords, and specific rewrites in the
            time it takes to paste two blocks of text.
          </p>
          <div className="flex gap-3">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-lg bg-accent text-accent-soft font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Try a free match
            </Link>
            <Link
              to="/login"
              className="sm:hidden px-6 py-3 rounded-lg border border-border text-primary text-sm"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="bg-accent-soft flex flex-col justify-center gap-4 px-6 py-12 md:px-10">
          <div className="border border-[var(--accent)] rounded-xl p-4">
            <p className="text-xs text-accent-text mb-1.5">Match score</p>
            <p className="text-2xl font-medium text-primary">
              82<span className="text-sm text-secondary">/100</span>
            </p>
          </div>

          <div className="border border-[var(--accent)] rounded-xl p-4">
            <p className="text-xs text-accent-text mb-2">Missing keywords</p>
            <div className="flex gap-1.5 flex-wrap">
              {["Docker", "AWS", "CI/CD"].map((kw) => (
                <span
                  key={kw}
                  className="text-xs bg-[var(--accent)] text-accent-soft rounded-full px-2.5 py-1"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-[var(--accent)] rounded-xl p-4">
            <p className="text-xs text-accent-text mb-1.5">Top suggestion</p>
            <p className="text-xs text-secondary">
              Quantify the impact of your Node.js project with a specific
              metric.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}