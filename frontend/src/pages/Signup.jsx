import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(name, email, password);
    if (success) navigate("/workspace");
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Target size={20} className="text-accent-text" />
          <span className="font-medium text-base text-primary">
            ResumeMatch
          </span>
        </div>

        <h2 className="text-center text-lg font-medium text-primary mb-1">
          Create your account
        </h2>
        <p className="text-center text-sm text-secondary mb-6">
          10 free matches a day, no card required.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 text-sm text-[var(--text-danger,#E24B4A)] bg-[rgba(226,75,74,0.1)] border border-[rgba(226,75,74,0.3)] rounded-lg px-3 py-2"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="name" className="text-xs text-secondary block mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Jordan Lee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-panel border border-border text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-xs text-secondary block mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-panel border border-border text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-xs text-secondary block mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-panel border border-border text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 rounded-lg bg-accent text-accent-soft font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-secondary mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-text">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}