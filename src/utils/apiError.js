/**
 * Converts RTK Query / Fetch errors into user-facing messages.
 * Keeps raw backend payloads out of the UI.
 */
export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;

  // Network / timeout (fetchBaseQuery)
  if (error.status === "FETCH_ERROR") {
    return "Network error. Check your connection and try again.";
  }

  if (error.status === "TIMEOUT_ERROR") {
    return "Request timed out. Please try again.";
  }

  if (error.status === "PARSING_ERROR") {
    return "Received an unexpected response from the server.";
  }

  if (error.status === "CUSTOM_ERROR") {
    return error.error || fallback;
  }

  const status = error.status;
  const data = error.data;

  // Prefer backend message when it's a safe string
  const backendMessage =
    typeof data?.message === "string"
      ? data.message
      : typeof data?.error === "string"
        ? data.error
        : Array.isArray(data?.errors)
          ? data.errors.map((e) => e?.message ?? e).filter(Boolean).join(", ")
          : null;

  switch (status) {
    case 400:
      return backendMessage || "Invalid request. Please check your input.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return backendMessage || "The requested resource was not found.";
    case 409:
      return backendMessage || "This record already exists or conflicts with existing data.";
    case 422:
      return backendMessage || "Validation failed. Please check the form fields.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Server error. Please try again later.";
    default:
      return backendMessage || fallback;
  }
}
