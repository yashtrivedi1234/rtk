import { Link } from "react-router-dom";
import { formatDate, formatSalary } from "../employeeUtils";

export default function EmployeeTable({
  employees = [],
  onEdit,
  onDelete,
}) {
  if (!employees.length) {
    return (
      <div className="empty-state">
        <p>No employees match your filters.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Salary</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
                <Link className="table-link" to={`/employees/${employee.id}`}>
                  {employee.name}
                </Link>
              </td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
              <td>{employee.designation ?? "—"}</td>
              <td>{formatSalary(employee.salary)}</td>
              <td>
                <span className={`status-pill status-pill--${String(employee.status ?? "").toLowerCase().replace(/\s+/g, "-")}`}>
                  {employee.status ?? "—"}
                </span>
              </td>
              <td>{formatDate(employee.joiningDate ?? employee.createdAt)}</td>
              <td>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onEdit(employee)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-ghost btn-sm"
                    onClick={() => onDelete(employee)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
