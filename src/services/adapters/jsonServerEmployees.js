/**
 * json-server v1 adapter.
 * Keep REST-shaped args in employeeApi; map here only for the demo backend.
 * Swap this file (or mapEmployeeListParams) when moving to Express/Node.
 */

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   department?: string,
 *   sortBy?: string,
 *   sortOrder?: string,
 * }} query
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

    if (department) {
      where.department = { eq: department };
    }

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
