export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onCancel} // clicking the backdrop cancels — standard modal behavior
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()} // prevent backdrop click from firing when clicking inside the card
        className="bg-panel border border-border rounded-xl p-5 w-full max-w-xs"
      >
        <h3 id="confirm-dialog-title" className="text-base font-medium text-primary mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-secondary mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="text-sm px-4 py-2 rounded-lg border border-border text-primary hover:bg-page transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-sm px-4 py-2 rounded-lg bg-accent text-accent-soft font-medium hover:opacity-90 transition-opacity"
          >
            Yes, log out
          </button>
        </div>
      </div>
    </div>
  );
}