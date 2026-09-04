/**
 * json-server list params + response shaping for the employee API.
 * Clamp currentPage so the UI never shows "page 5 of 4".
 */

export function toJsonServerListParams({
  page = 1,
  limit = 10,
  search = "",
  department = "",
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) {
  const params = {
    _page: page,
    _per_page: limit,
    _sort: sortOrder === "desc" ? `-${sortBy}` : sortBy,
  };

  const trimmedSearch = search.trim();
  if (trimmedSearch || department) {
    const where = {};
    if (department) where.department = { eq: department };
    if (trimmedSearch) {
      where.or = [
        { name: { contains: trimmedSearch } },
        { email: { contains: trimmedSearch } },
        { id: { contains: trimmedSearch } },
      ];
    }
    params._where = JSON.stringify(where);
  }

  return params;
}

function clampPage(page, totalPages) {
  const safeTotal = Math.max(1, Number(totalPages) || 1);
  const safePage = Number(page);
  if (!Number.isFinite(safePage) || safePage < 1) return 1;
  return Math.min(Math.floor(safePage), safeTotal);
}

export function normalizeEmployeeList(response, arg = {}) {
  const limit = arg.limit ?? 10;
  const requestedPage = arg.page ?? 1;

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
