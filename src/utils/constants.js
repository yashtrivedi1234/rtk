export const DEFAULT_EMPLOYEE_QUERY = {
  page: 1,
  limit: 10,
  search: "",
  department: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const DEBOUNCE_MS = 400;

export const API_TIMEOUT_MS = 10000;

export const DEPARTMENTS = [

  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
];

export const EMPLOYEE_STATUSES = ["Active", "Inactive", "On Leave"];

export const SORT_BY_OPTIONS = [
  { value: "createdAt", label: "Created Date" },
  { value: "name", label: "Name" },
  { value: "salary", label: "Salary" },
  { value: "department", label: "Department" },
];

export const SORT_ORDER_OPTIONS = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
