import { baseApi } from "./baseApi";
import {
  normalizeEmployeeList,
  toJsonServerListParams,
} from "./employeeTransforms";

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: (args = {}) => ({
        url: "/employees",
        params: toJsonServerListParams(args),
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
      providesTags: (_result, _error, id) => [{ type: "Employee", id }],
    }),

    createEmployee: builder.mutation({
      query: (employee) => ({
        url: "/employees",
        method: "POST",
        body: employee,
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),

    updateEmployee: builder.mutation({
      query: ({ id, ...employeeData }) => ({
        url: `/employees/${id}`,
        method: "PATCH",
        body: employeeData,
      }),
      invalidatesTags: (_result, error, { id }) =>
        error
          ? []
          : [
              { type: "Employee", id },
              { type: "Employee", id: "LIST" },
            ],
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
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
