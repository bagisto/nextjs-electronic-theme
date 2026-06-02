import { isObject } from "@utils/type-guards";

/**
 * Extract the best human-readable message out of an Apollo / network error.
 *
 * Apollo masks non-2xx responses behind a generic
 * "Response not successful: Received status code 500" message, while the real
 * backend message lives in `graphQLErrors` or in the parsed response body on
 * `networkError.result`. This walks those locations in priority order so the
 * actual message (e.g. "The requested quantity is not available...") can be
 * shown to the user.
 */
export function getApolloErrorMessage(
  error: unknown,
  fallback = "Something went wrong, please try again later."
): string {
  if (typeof error === "string") return error || fallback;
  if (!isObject(error)) return fallback;

  // 1. GraphQL errors returned in the standard `{ errors: [...] }` shape.
  const graphQLErrors = error.graphQLErrors;
  if (Array.isArray(graphQLErrors) && graphQLErrors.length) {
    const message = graphQLErrors[0]?.message;
    if (typeof message === "string" && message) return message;
  }

  // 2. A non-2xx response body parsed by Apollo onto `networkError.result`.
  const networkError = error.networkError;
  if (isObject(networkError)) {
    const result = networkError.result;
    if (isObject(result)) {
      const resultErrors = result.errors;
      if (Array.isArray(resultErrors) && resultErrors.length) {
        const message = resultErrors[0]?.message;
        if (typeof message === "string" && message) return message;
      }
      if (typeof result.error === "string" && result.error) return result.error;
      if (typeof result.message === "string" && result.message)
        return result.message;
    }
  }

  // 3. Plain Error / message-bearing object — but ignore Apollo's generic
  //    status-code message so we fall through to the fallback instead.
  if (typeof error.message === "string" && error.message) {
    if (!/Response not successful/i.test(error.message)) return error.message;
  }

  return fallback;
}
