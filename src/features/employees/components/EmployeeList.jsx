import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
} from "../../../services/employeeApi";
import { useDebounce } from "../../../hooks/useDebounce";
import { getApiErrorMessage } from "../../../utils/apiError";
import {
  DEFAULT_EMPLOYEE_QUERY,
  DEBOUNCE_MS,
} from "../../../utils/constants";
import EmployeeFilters from "./EmployeeFilters";
import EmployeeTable from "./EmployeeTable";
import EmployeePagination from "./EmployeePagination";
import EmployeeModal from "./EmployeeModal";
import EmployeeForm from "./EmployeeForm";
import DeleteEmployeeDialog from "./DeleteEmployeeDialog";

/**
 * List page orchestrator: query args (client) + RTK Query hooks (server).
 * Presentational pieces stay in sibling components.
 */
export default function EmployeeList() {
  const location = useLocation();
  const navigate = useNavigate();
  const flashFromNav = location.state?.flash ?? null;

  const [page, setPage] = useState(DEFAULT_EMPLOYEE_QUERY.page);
  const [limit, setLimit] = useState(DEFAULT_EMPLOYEE_QUERY.limit);
  const [searchInput, setSearchInput] = useState(DEFAULT_EMPLOYEE_QUERY.search);
  const [department, setDepartment] = useState(DEFAULT_EMPLOYEE_QUERY.department);
  const [sortBy, setSortBy] = useState(DEFAULT_EMPLOYEE_QUERY.sortBy);
  const [sortOrder, setSortOrder] = useState(DEFAULT_EMPLOYEE_QUERY.sortOrder);

  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_MS);
  const [searchForQuery, setSearchForQuery] = useState(debouncedSearch);

  if (debouncedSearch !== searchForQuery) {
    setSearchForQuery(debouncedSearch);
    setPage(1);
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [formError, setFormError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const activeFeedback =
    feedback ??
    (flashFromNav ? { type: "success", message: flashFromNav } : null);

  const dismissFeedback = () => {
    setFeedback(null);
    if (flashFromNav) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  };

  const queryArgs = {
    page,
    limit,
    search: searchForQuery.trim(),
    department,
    sortBy,
    sortOrder,
  };

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetEmployeesQuery(queryArgs);

  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  const employees = data?.employees ?? [];
  const pagination = data?.pagination ?? {
    currentPage: page,
    totalPages: 1,
    totalItems: 0,
    limit,
  };

  // Keep client page in sync when the server clamps (e.g. delete last row on last page).
  if (page !== pagination.currentPage) {
    setPage(pagination.currentPage);
  }

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const openCreate = () => {
    setEditingEmployee(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (employee) => {
    setEditingEmployee(employee);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isCreating || isUpdating) return;
    setModalOpen(false);
    setEditingEmployee(null);
    setFormError(null);
  };

  const handleFormSubmit = async (payload) => {
    setFormError(null);
    try {
      if (editingEmployee?.id) {
        await updateEmployee({ id: editingEmployee.id, ...payload }).unwrap();
        showFeedback("success", "Employee updated successfully.");
      } else {
        await createEmployee(payload).unwrap();
        showFeedback("success", "Employee created successfully.");
      }
      setModalOpen(false);
      setEditingEmployee(null);
    } catch (err) {
      setFormError(
        getApiErrorMessage(
          err,
          editingEmployee
            ? "Unable to update employee. Please try again."
            : "Unable to create employee. Please try again.",
        ),
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmployee?.id) return;
    setDeleteError(null);

    try {
      await deleteEmployee(deletingEmployee.id).unwrap();
      setDeletingEmployee(null);
      showFeedback("success", "Employee deleted successfully.");
    } catch (err) {
      setDeleteError(
        getApiErrorMessage(err, "Unable to delete employee. Please try again."),
      );
    }
  };

  return (
    <main className="page">
      <section className="employee-list">
      <header className="page-header">
        <div>
          <h1>Employees</h1>
          <p className="muted">Create, update, and manage employee records.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add Employee
        </button>
      </header>

      {activeFeedback && (
        <p
          className={`alert alert-${activeFeedback.type === "success" ? "success" : "error"}`}
          role="status"
        >
          {activeFeedback.message}
          <button
            type="button"
            className="alert-dismiss"
            onClick={dismissFeedback}
            aria-label="Dismiss"
          >
            ×
          </button>
        </p>
      )}

      <EmployeeFilters
        search={searchInput}
        department={department}
        sortBy={sortBy}
        sortOrder={sortOrder}
        limit={limit}
        onSearchChange={setSearchInput}
        onDepartmentChange={(value) => {
          setDepartment(value);
          setPage(1);
        }}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortOrderChange={(value) => {
          setSortOrder(value);
          setPage(1);
        }}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
      />

      {isLoading ? (
        <div className="loading-panel" aria-busy="true">
          <div className="spinner" />
          <p>Loading employees…</p>
        </div>
      ) : isError ? (
        <div className="error-panel" role="alert">
          <p>{getApiErrorMessage(error, "Failed to load employees. Please try again.")}</p>
          <button type="button" className="btn btn-primary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : (
        <div className={`list-body ${isFetching ? "is-fetching" : ""}`}>
          {isFetching && !isLoading && (
            <div className="refetch-bar" aria-live="polite">
              Updating…
            </div>
          )}

          <EmployeeTable
            employees={employees}
            onEdit={openEdit}
            onDelete={(employee) => {
              setDeleteError(null);
              setDeletingEmployee(employee);
            }}
          />

          <EmployeePagination
            pagination={pagination}
            onPageChange={setPage}
            disabled={isFetching}
          />
        </div>
      )}

      <EmployeeModal
        open={modalOpen}
        title={editingEmployee ? "Edit Employee" : "Create Employee"}
        onClose={closeModal}
      >
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isSubmitting={isCreating || isUpdating}
          errorMessage={formError}
        />
      </EmployeeModal>

      <DeleteEmployeeDialog
        open={Boolean(deletingEmployee)}
        employeeName={deletingEmployee?.name}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!isDeleting) {
            setDeletingEmployee(null);
            setDeleteError(null);
          }
        }}
      />
      </section>
    </main>
  );
}
