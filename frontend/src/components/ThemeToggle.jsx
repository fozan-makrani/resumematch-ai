import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="p-2 rounded-lg border border-border hover:bg-panel transition-colors"
    >
      {theme === "dark" ? (
        <Sun size={16} className="text-secondary" />
      ) : (
        <Moon size={16} className="text-secondary" />
      )}
    </button>
  );
}