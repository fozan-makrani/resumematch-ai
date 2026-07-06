import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ remaining, limit }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-border">
      <Logo />
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          to="/history"
          className="text-sm text-secondary hover:text-primary transition-colors hidden sm:inline"
        >
          History
        </Link>
        {typeof remaining === "number" && (
          <span className="text-xs text-secondary bg-panel border border-border rounded-lg px-2.5 py-1 whitespace-nowrap">
            {remaining}/{limit} left today
          </span>
        )}
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="w-7 h-7 rounded-full bg-accent-soft border border-[var(--accent)] flex items-center justify-center text-xs font-medium text-accent-text"
          title="Log out"
        >
          {initials || "?"}
        </button>
      </div>
    </nav>
  );
}