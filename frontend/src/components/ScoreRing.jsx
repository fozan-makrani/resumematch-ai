export default function ScoreRing({ score }) {
  // Color-codes the ring by score band — semantic, matches the locked
  // design's good/medium/poor distinction from the history table mockup.
  const getColor = () => {
    if (score >= 75)
      return { border: "var(--accent)", text: "var(--accent-text)" };
    if (score >= 50) return { border: "#BA7517", text: "#EF9F27" };
    return { border: "#A32D2D", text: "#E24B4A" };
  };
  const { border, text } = getColor();

  return (
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-lg"
      style={{ border: `3px solid ${border}`, color: text }}
    >
      {score}
    </div>
  );
}