import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_TIMEOUT_MS, TOKEN_KEYS } from "../utils/constants";
import { prepareRefreshHeaders } from "./authTokens";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Authenticated API calls — attaches Bearer access token when present.
 */
export const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  timeout: API_TIMEOUT_MS,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});

/**
 * Refresh must not send an expired access token.
 */
export const refreshBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  timeout: API_TIMEOUT_MS,
  prepareHeaders: prepareRefreshHeaders,
});

export {
  clearAuthTokens,
  getRefreshToken,
  persistTokens,
} from "./authTokens";
