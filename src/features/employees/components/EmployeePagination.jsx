import { getPaginationRange } from "../employeeUtils";

export default function EmployeePagination({ pagination, onPageChange, disabled = false }) {
  const { currentPage = 1, totalPages = 1 } = pagination ?? {};
  const { from, to, totalItems } = getPaginationRange(pagination);

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <div className="pagination">
      <p className="pagination__summary">
        {totalItems === 0
          ? "No employees to show"
          : `Showing ${from}–${to} of ${totalItems} employees`}
      </p>

      <div className="pagination__controls">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || isFirst}
        >
          Previous
        </button>

        <span className="pagination__page" aria-live="polite">
          Page {currentPage} of {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || isLast || totalItems === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}
