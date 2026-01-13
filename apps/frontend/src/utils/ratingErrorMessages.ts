/**
 * Maps GraphQL error codes to user-friendly error messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: "Please log in to rate courses.",
  BAD_USER_INPUT: "An error occurred, please try again later",
  NOT_FOUND: "Rating not found. It may have already been deleted.",
  INVALID_ARGUMENT: "Invalid rating information provided.",
  INTERNAL_SERVER_ERROR: "An error occurred, please try again later",
};

/**
 * Special messages for specific validation errors
 */
const VALIDATION_ERROR_PATTERNS: Array<{
  pattern: RegExp;
  message: string;
}> = [
  {
    pattern: /maximum number of ratings/i,
    message:
      "You've reached the maximum number of ratings. Delete an existing rating to add a new one.",
  },
  {
    pattern: /maximum.*semester/i,
    message: "You've reached the maximum ratings for this semester.",
  },
  {
    pattern: /rating must be an integer/i,
    message: "Please select a valid rating value.",
  },
];

/**
 * Extracts a user-friendly error message from a GraphQL error
 * @param error - The error object
 * @returns A user-friendly error message
 */
export function getRatingErrorMessage(error: unknown): string {
  // Default fallback message
  const defaultMessage = "An error occurred, please try again later";

  if (!error) {
    return defaultMessage;
  }

  // Handle errors with graphQLErrors property
  if (typeof error === "object" && error !== null && "graphQLErrors" in error) {
    const graphQLErrors = error.graphQLErrors;
    if (Array.isArray(graphQLErrors) && graphQLErrors.length > 0) {
      const firstError = graphQLErrors[0];
      const errorCode = firstError.extensions?.code as string | undefined;
      const errorMessage = firstError.message;

      // Check for specific validation error patterns in the message
      for (const { pattern, message } of VALIDATION_ERROR_PATTERNS) {
        if (pattern.test(errorMessage)) {
          return message;
        }
      }

      // Use error code mapping
      if (errorCode && ERROR_MESSAGES[errorCode]) {
        return ERROR_MESSAGES[errorCode];
      }

      // Return the raw message if it's user-friendly
      if (errorMessage && !errorMessage.includes("Error:")) {
        return errorMessage;
      }
    }
  }

  // Check for network errors
  if (
    typeof error === "object" &&
    error !== null &&
    "networkError" in error &&
    error.networkError
  ) {
    return "Connection error. Please check your internet and try again.";
  }

  // Handle generic errors
  if (error instanceof Error) {
    // Check validation patterns in generic error messages
    for (const { pattern, message } of VALIDATION_ERROR_PATTERNS) {
      if (pattern.test(error.message)) {
        return message;
      }
    }

    // Return error message if it seems user-friendly
    if (error.message && !error.message.includes("Error:")) {
      return error.message;
    }
  }

  return defaultMessage;
}
