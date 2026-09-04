import {
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
} from "../../utils/constants";

export const EMPTY_EMPLOYEE_FORM = {
  name: "",
  email: "",
  phone: "",
  department: DEPARTMENTS[0],
  designation: "",
  salary: "",
  joiningDate: "",
  status: EMPLOYEE_STATUSES[0],
};

export function employeeToFormValues(employee) {
  if (!employee) return { ...EMPTY_EMPLOYEE_FORM };

  return {
    name: employee.name ?? "",
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    department: employee.department ?? DEPARTMENTS[0],
    designation: employee.designation ?? "",
    salary: employee.salary != null ? String(employee.salary) : "",
    joiningDate: employee.joiningDate
      ? String(employee.joiningDate).slice(0, 10)
      : "",
    status: employee.status ?? EMPLOYEE_STATUSES[0],
  };
}

/** Normalize form values into the shape expected by the API. */
export function formValuesToPayload(values) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    department: values.department,
    designation: values.designation.trim(),
    salary: Number(values.salary),
    joiningDate: values.joiningDate,
    status: values.status,
  };
}

export function formatSalary(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getPaginationRange(pagination) {
  const { currentPage = 1, limit = 10, totalItems = 0 } = pagination ?? {};
  if (totalItems === 0) {
    return { from: 0, to: 0, totalItems: 0 };
  }
  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, totalItems);
  return { from, to, totalItems };
}
