import { baseApi } from "./baseApi";
import {
  getCreateInvalidationTags,
  getDeleteInvalidationTags,
  getUpdateInvalidationTags,
} from "./employeeCacheTags";
import {
  mapEmployeeListParams,
  normalizeEmployee,
  normalizeEmployeeList,
} from "./employeeTransforms";

/**
 * Employee endpoints — REST-shaped args only.
 * json-server mapping lives in adapters/jsonServerEmployees.js.
 */
export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: (args = {}) => ({
        url: "/employees",
        params: mapEmployeeListParams(args),
      }),

      transformResponse: (response, _meta, arg) =>
        normalizeEmployeeList(response, arg),

      providesTags: (result) =>
        result
          ? [
              ...result.employees.map(({ id }) => ({
                type: "Employee",
                id,
              })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),

    getEmployeeById: builder.query({
      query: (id) => `/employees/${id}`,

      transformResponse: (response) => normalizeEmployee(response),

      providesTags: (_result, _error, id) => [{ type: "Employee", id }],
    }),

    createEmployee: builder.mutation({
      query: (employee) => ({
        url: "/employees",
        method: "POST",
        body: employee,
      }),

      invalidatesTags: getCreateInvalidationTags,
    }),

    updateEmployee: builder.mutation({
      query: ({ id, ...employeeData }) => ({
        url: `/employees/${id}`,
        method: "PATCH",
        body: employeeData,
      }),

      // Pessimistic + tags: list edits often have no detail cache; invalidation is enough.
      invalidatesTags: (_result, error, { id }) =>
        error ? [] : getUpdateInvalidationTags(id),
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, id) => getDeleteInvalidationTags(id),
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
