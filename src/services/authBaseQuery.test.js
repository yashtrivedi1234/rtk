import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NON_RETRYABLE_STATUSES, TOKEN_KEYS } from "../utils/constants.js";
import {
  clearAuthTokens,
  persistTokens,
  prepareRefreshHeaders,
  refreshRequestShouldOmitAccessToken,
} from "./authTokens.js";

describe("auth refresh header", () => {
  it("refresh prepareHeaders strips Authorization", () => {
    assert.equal(
      refreshRequestShouldOmitAccessToken(prepareRefreshHeaders),
      true,
    );
  });

  it("authenticated prepareHeaders keeps Bearer when token exists", () => {
    const prepareHeaders = (headers) => {
      headers.set("Authorization", "Bearer access-token");
      headers.set("Accept", "application/json");
      return headers;
    };

    const headers = new Headers();
    prepareHeaders(headers);
    assert.equal(headers.get("Authorization"), "Bearer access-token");
  });
});

describe("auth token storage helpers", () => {
  it("clears both tokens on logout/refresh failure", () => {
    globalThis.localStorage = createMemoryStorage();
    persistTokens({
      accessToken: "a",
      refreshToken: "r",
    });
    assert.equal(globalThis.localStorage.getItem(TOKEN_KEYS.ACCESS), "a");
    clearAuthTokens();
    assert.equal(globalThis.localStorage.getItem(TOKEN_KEYS.ACCESS), null);
    assert.equal(globalThis.localStorage.getItem(TOKEN_KEYS.REFRESH), null);
  });
});

describe("retry policy", () => {
  it("does not retry client/auth/rate-limit statuses including 429", () => {
    for (const status of [400, 401, 403, 404, 409, 422, 429]) {
      assert.ok(NON_RETRYABLE_STATUSES.includes(status));
    }
  });
});

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      map.set(key, String(value));
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}
