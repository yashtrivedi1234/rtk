/**
 * Normalize backend list payloads into a stable UI shape.
 * Clamps currentPage so the UI never shows "page 5 of 4".
 */
export function clampPage(page, totalPages) {
  const safeTotal = Math.max(1, Number(totalPages) || 1);
  const safePage = Number(page);
  if (!Number.isFinite(safePage) || safePage < 1) return 1;
  return Math.min(Math.floor(safePage), safeTotal);
}

export function normalizeEmployeeList(response, arg = {}) {
  const limit = arg.limit ?? 10;
  const requestedPage = arg.page ?? 1;

  // json-server v1 paginated payload
  if (response && Array.isArray(response.data) && response.items != null) {
    const totalPages = response.pages ?? 1;
    return {
      employees: response.data,
      pagination: {
        currentPage: clampPage(requestedPage, totalPages),
        totalPages,
        totalItems: response.items ?? 0,
        limit,
      },
    };
  }

  // Production-style envelope: { success, data, pagination }
  if (response && Array.isArray(response.data) && response.pagination) {
    const totalPages = response.pagination.totalPages ?? 1;
    const serverPage = response.pagination.currentPage ?? requestedPage;
    return {
      employees: response.data,
      pagination: {
        currentPage: clampPage(serverPage, totalPages),
        totalPages,
        totalItems: response.pagination.totalItems ?? 0,
        limit: response.pagination.limit ?? limit,
      },
    };
  }

  const employees = Array.isArray(response) ? response : [];
  return {
    employees,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: employees.length,
      limit,
    },
  };
}

export function normalizeEmployee(response) {
  if (!response) return null;
  if (
    response.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }
  return response;
}

/**
 * REST-shaped list params. Demo maps through json-server adapter.
 * For a real API, return these params unchanged (or map field names once here).
 */
export { toJsonServerListParams as mapEmployeeListParams } from "./adapters/jsonServerEmployees.js";
