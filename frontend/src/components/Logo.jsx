import { Target } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Target size={20} className="text-accent-text" />
      <span className="font-medium text-base text-primary">ResumeMatch</span>
    </div>
  );
}