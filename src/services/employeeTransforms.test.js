import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampPage,
  normalizeEmployeeList,
} from "./employeeTransforms.js";
import { toJsonServerListParams } from "./adapters/jsonServerEmployees.js";
import {
  getCreateInvalidationTags,
  getDeleteInvalidationTags,
  getUpdateInvalidationTags,
} from "./employeeCacheTags.js";

describe("clampPage", () => {
  it("keeps a valid page", () => {
    assert.equal(clampPage(2, 5), 2);
  });

  it("clamps out-of-range page down to totalPages", () => {
    assert.equal(clampPage(5, 4), 4);
  });

  it("clamps page below 1 up to 1", () => {
    assert.equal(clampPage(0, 4), 1);
    assert.equal(clampPage(-2, 4), 1);
  });

  it("handles empty result sets as page 1 of 1", () => {
    assert.equal(clampPage(3, 1), 1);
  });
});

describe("normalizeEmployeeList", () => {
  it("maps json-server payload and clamps currentPage", () => {
    const result = normalizeEmployeeList(
      {
        pages: 4,
        items: 40,
        data: [{ id: "1", name: "A" }],
      },
      { page: 5, limit: 10 },
    );

    assert.equal(result.pagination.currentPage, 4);
    assert.equal(result.pagination.totalPages, 4);
    assert.equal(result.pagination.totalItems, 40);
    assert.equal(result.employees.length, 1);
  });

  it("uses production envelope currentPage when present", () => {
    const result = normalizeEmployeeList(
      {
        success: true,
        data: [{ id: "1" }],
        pagination: {
          currentPage: 2,
          totalPages: 3,
          totalItems: 25,
          limit: 10,
        },
      },
      { page: 9, limit: 10 },
    );

    assert.equal(result.pagination.currentPage, 2);
    assert.equal(result.pagination.totalPages, 3);
  });

  it("clamps production envelope when server page is too high", () => {
    const result = normalizeEmployeeList(
      {
        data: [],
        pagination: {
          currentPage: 9,
          totalPages: 2,
          totalItems: 12,
          limit: 10,
        },
      },
      { page: 9, limit: 10 },
    );

    assert.equal(result.pagination.currentPage, 2);
  });

  it("handles empty json-server page after deletion", () => {
    const result = normalizeEmployeeList(
      { pages: 1, items: 0, data: [] },
      { page: 5, limit: 10 },
    );

    assert.equal(result.pagination.currentPage, 1);
    assert.equal(result.pagination.totalPages, 1);
    assert.equal(result.pagination.totalItems, 0);
  });
});

describe("json-server adapter", () => {
  it("maps REST query args to json-server params", () => {
    const params = toJsonServerListParams({
      page: 2,
      limit: 10,
      search: "aisha",
      department: "IT",
      sortBy: "name",
      sortOrder: "asc",
    });

    assert.equal(params._page, 2);
    assert.equal(params._per_page, 10);
    assert.equal(params._sort, "name");
    assert.ok(params._where.includes("aisha"));
    assert.ok(params._where.includes("IT"));
  });
});

describe("cache invalidation contract", () => {
  it("CREATE invalidates LIST only", () => {
    assert.deepEqual(getCreateInvalidationTags(), [
      { type: "Employee", id: "LIST" },
    ]);
  });

  it("UPDATE invalidates entity + LIST", () => {
    assert.deepEqual(getUpdateInvalidationTags("42"), [
      { type: "Employee", id: "42" },
      { type: "Employee", id: "LIST" },
    ]);
  });

  it("DELETE invalidates entity + LIST", () => {
    assert.deepEqual(getDeleteInvalidationTags("42"), [
      { type: "Employee", id: "42" },
      { type: "Employee", id: "LIST" },
    ]);
  });
});
