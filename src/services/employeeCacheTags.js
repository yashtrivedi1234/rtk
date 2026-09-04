/** Cache tag contracts used by employee mutations (kept pure for tests). */
export function getCreateInvalidationTags() {
  return [{ type: "Employee", id: "LIST" }];
}

export function getUpdateInvalidationTags(id) {
  return [
    { type: "Employee", id },
    { type: "Employee", id: "LIST" },
  ];
}

export function getDeleteInvalidationTags(id) {
  return [
    { type: "Employee", id },
    { type: "Employee", id: "LIST" },
  ];
}
