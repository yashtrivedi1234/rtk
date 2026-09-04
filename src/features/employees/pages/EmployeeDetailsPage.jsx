import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeleteEmployeeMutation,
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
} from "../../../services/employeeApi";
import { getApiErrorMessage } from "../../../utils/apiError";
import { formatDate, formatSalary } from "../employeeUtils";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeModal from "../components/EmployeeModal";
import DeleteEmployeeDialog from "../components/DeleteEmployeeDialog";

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formError, setFormError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const {
    data: employee,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetEmployeeByIdQuery(id, { skip: !id });

  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  const handleUpdate = async (payload) => {
    setFormError(null);
    try {
      await updateEmployee({ id, ...payload }).unwrap();
      setEditOpen(false);
      setFeedback({ type: "success", message: "Employee updated successfully." });
    } catch (err) {
      setFormError(
        getApiErrorMessage(err, "Unable to update employee. Please try again."),
      );
    }
  };

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteEmployee(id).unwrap();
      navigate("/employees", {
        replace: true,
        state: { flash: "Employee deleted successfully." },
      });
    } catch (err) {
      setDeleteError(
        getApiErrorMessage(err, "Unable to delete employee. Please try again."),
      );
    }
  };

  if (isLoading) {
    return (
      <main className="page">
        <div className="loading-panel" aria-busy="true">
          <div className="spinner" />
          <p>Loading employee…</p>
        </div>
      </main>
    );
  }

  if (isError || !employee) {
    return (
      <main className="page">
        <div className="error-panel" role="alert">
          <p>
            {getApiErrorMessage(error, "Failed to load employee. Please try again.")}
          </p>
          <div className="row-actions">
            <button type="button" className="btn btn-primary" onClick={() => refetch()}>
              Retry
            </button>
            <Link className="btn btn-ghost" to="/employees">
              Back to list
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <Link className="back-link" to="/employees">
            ← Back to employees
          </Link>
          <h1>
            {employee.name}
            {isFetching && !isLoading && (
              <span className="inline-fetching" aria-live="polite">
                {" "}
                Updating…
              </span>
            )}
          </h1>
          <p className="muted">{employee.designation} · {employee.department}</p>
        </div>
        <div className="row-actions">
          <button type="button" className="btn btn-ghost" onClick={() => {
            setFormError(null);
            setEditOpen(true);
          }}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              setDeleteError(null);
              setDeleteOpen(true);
            }}
          >
            Delete
          </button>
        </div>
      </header>

      {feedback && (
        <p
          className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}
          role="status"
        >
          {feedback.message}
          <button
            type="button"
            className="alert-dismiss"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </p>
      )}

      <dl className="detail-grid">
        <div>
          <dt>Email</dt>
          <dd>{employee.email}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{employee.phone ?? "—"}</dd>
        </div>
        <div>
          <dt>Department</dt>
          <dd>{employee.department}</dd>
        </div>
        <div>
          <dt>Designation</dt>
          <dd>{employee.designation ?? "—"}</dd>
        </div>
        <div>
          <dt>Salary</dt>
          <dd>{formatSalary(employee.salary)}</dd>
        </div>
        <div>
          <dt>Joining Date</dt>
          <dd>{formatDate(employee.joiningDate)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span
              className={`status-pill status-pill--${String(employee.status ?? "")
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {employee.status ?? "—"}
            </span>
          </dd>
        </div>
        <div>
          <dt>Employee ID</dt>
          <dd>
            <code>{employee.id}</code>
          </dd>
        </div>
      </dl>

      <EmployeeModal
        open={editOpen}
        title="Edit Employee"
        onClose={() => {
          if (!isUpdating) {
            setEditOpen(false);
            setFormError(null);
          }
        }}
      >
        <EmployeeForm
          employee={employee}
          onSubmit={handleUpdate}
          onCancel={() => {
            if (!isUpdating) {
              setEditOpen(false);
              setFormError(null);
            }
          }}
          isSubmitting={isUpdating}
          errorMessage={formError}
        />
      </EmployeeModal>

      <DeleteEmployeeDialog
        open={deleteOpen}
        employeeName={employee.name}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteOpen(false);
            setDeleteError(null);
          }
        }}
      />
    </main>
  );
}
