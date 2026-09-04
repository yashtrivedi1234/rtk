import {
  DEPARTMENTS,
  PAGE_SIZE_OPTIONS,
  SORT_BY_OPTIONS,
  SORT_ORDER_OPTIONS,
} from "../../../utils/constants";

/**
 * Client-owned filter UI. Parent syncs values into the RTK Query args.
 */
export default function EmployeeFilters({
  search,
  department,
  sortBy,
  sortOrder,
  limit,
  onSearchChange,
  onDepartmentChange,
  onSortByChange,
  onSortOrderChange,
  onLimitChange,
}) {
  return (
    <div className="filters">
      <label className="form-field filters__search">
        <span>Search</span>
        <input
          type="search"
          placeholder="Name, email, or employee ID"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search employees"
        />
      </label>

      <label className="form-field">
        <span>Department</span>
        <select
          value={department}
          onChange={(event) => onDepartmentChange(event.target.value)}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Sort by</span>
        <select
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value)}
        >
          {SORT_BY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Order</span>
        <select
          value={sortOrder}
          onChange={(event) => onSortOrderChange(event.target.value)}
        >
          {SORT_ORDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Page size</span>
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
