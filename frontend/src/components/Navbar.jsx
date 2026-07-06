import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { History as HistoryIcon } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ remaining, limit }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmLogout = () => {
    setConfirmOpen(false);
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
    <>
      <nav className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-border">
        <Logo />
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/history"
            aria-label="Match history"
            className="p-2 rounded-lg text-secondary hover:bg-panel hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <HistoryIcon size={18} />
            <span className="hidden sm:inline text-sm">History</span>
          </Link>
          {typeof remaining === "number" && (
            <span className="text-xs text-secondary bg-panel border border-border rounded-lg px-2.5 py-1 whitespace-nowrap hidden xs:inline">
              {remaining}/{limit} left today
            </span>
          )}
          <ThemeToggle />
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-7 h-7 rounded-full bg-accent-soft border border-[var(--accent)] flex items-center justify-center text-xs font-medium text-accent-text"
            aria-label="Open account menu"
          >
            {initials || "?"}
          </button>
        </div>
      </nav>

      <ConfirmDialog
        open={confirmOpen}
        title="Log out?"
        message="You'll need to log back in to see your match history and run new matches."
        onConfirm={handleConfirmLogout}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}