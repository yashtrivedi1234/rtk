import { useEffect } from "react";

/**
 * Confirmation dialog before destructive delete.
 */
export default function DeleteEmployeeDialog({
  open,
  employeeName,
  isDeleting = false,
  errorMessage = null,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isDeleting) onCancel?.();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isDeleting, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={isDeleting ? undefined : onCancel}>
      <div
        className="modal-panel modal-panel--sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-employee-title"
        aria-describedby="delete-employee-desc"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="delete-employee-title">Delete employee</h2>
        </header>

        <div className="modal-body">
          <p id="delete-employee-desc">
            Are you sure you want to delete
            {employeeName ? (
              <>
                {" "}
                <strong>{employeeName}</strong>
              </>
            ) : (
              " this employee"
            )}
            ?
          </p>
          <p className="muted">This action cannot be undone.</p>

          {errorMessage && (
            <p className="alert alert-error" role="alert">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
