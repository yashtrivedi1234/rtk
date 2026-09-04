import { TOKEN_KEYS } from "../utils/constants.js";

export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
}

export function getRefreshToken() {
  return localStorage.getItem(TOKEN_KEYS.REFRESH);
}

export function persistTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
  }
}

/**
 * Pure helper for tests: refresh requests must never carry Authorization.
 */
export function refreshRequestShouldOmitAccessToken(prepareHeaders) {
  const headers = new Headers();
  headers.set("Authorization", "Bearer expired-access-token");
  prepareHeaders(headers);
  return !headers.has("Authorization");
}

/** Same stripping logic used by refreshBaseQuery.prepareHeaders */
export function prepareRefreshHeaders(headers) {
  headers.set("Accept", "application/json");
  headers.delete("Authorization");
  return headers;
}
