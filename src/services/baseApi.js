import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { API_TIMEOUT_MS, NON_RETRYABLE_STATUSES } from "../utils/constants";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  timeout: API_TIMEOUT_MS,
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    return headers;
  },
});

/**
 * json-server demo has no auth — plain fetchBaseQuery is enough.
 * Retry only transient failures; client errors fail immediately.
 */
const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error) {
      const { status } = result.error;
      if (
        NON_RETRYABLE_STATUSES.includes(status) ||
        status === "CUSTOM_ERROR"
      ) {
        retry.fail(result.error);
      }
    }

    return result;
  },
  { maxRetries: 2 },
);

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Employee"],
  // Brief retention avoids flicker list ↔ detail navigation.
  keepUnusedDataFor: 60,
  // Refresh after idle tab return.
  refetchOnFocus: true,
  // Recover after offline → online.
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
