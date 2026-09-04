import { createApi, retry } from "@reduxjs/toolkit/query/react";
import { NON_RETRYABLE_STATUSES } from "../utils/constants";
import {
  clearAuthTokens,
  getRefreshToken,
  persistTokens,
  rawBaseQuery,
  refreshBaseQuery,
} from "./authBaseQuery";

/**
 * Auth note (Ponytail):
 * This app demos against json-server, which has no login/refresh.
 * Reauth stays modular for a real JWT backend: it only runs when a request
 * returns 401 and a refreshToken exists in localStorage. No fake login UI.
 */

/** Shared promise so concurrent 401s wait on one refresh. */
let refreshPromise = null;

async function refreshAccessToken(api, extraOptions) {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthTokens();
    return false;
  }

  // Do not log tokens. Uses refreshBaseQuery (no Authorization header).
  const refreshResult = await refreshBaseQuery(
    {
      url: "/auth/refresh",
      method: "POST",
      body: { refreshToken },
    },
    api,
    extraOptions,
  );

  const newAccessToken =
    refreshResult.data?.data?.accessToken ??
    refreshResult.data?.accessToken;

  if (refreshResult.data && newAccessToken) {
    persistTokens({
      accessToken: newAccessToken,
      refreshToken:
        refreshResult.data?.data?.refreshToken ??
        refreshResult.data?.refreshToken,
    });
    return true;
  }

  clearAuthTokens();
  api.dispatch(baseApi.util.resetApiState());
  return false;
}

/**
 * On 401 → single shared refresh → retry original request once.
 */
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  const requestUrl = typeof args === "string" ? args : args?.url;
  if (requestUrl?.includes("/auth/refresh")) {
    clearAuthTokens();
    return result;
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(api, extraOptions).finally(() => {
      refreshPromise = null;
    });
  }

  const refreshed = await refreshPromise;

  if (!refreshed) {
    return {
      error: {
        status: 401,
        data: { message: "Your session has expired. Please sign in again." },
      },
    };
  }

  result = await rawBaseQuery(args, api, extraOptions);
  return result;
};

const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    const result = await baseQueryWithReauth(args, api, extraOptions);

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
