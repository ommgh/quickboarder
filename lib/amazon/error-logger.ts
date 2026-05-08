/**
 * Error Logging Service for Amazon Integration
 * Provides structured error logging with classification
 */

export type ErrorCategory =
  | "authentication"
  | "validation"
  | "api"
  | "network"
  | "unknown";

export interface ErrorLog {
  timestamp: Date;
  userId: string;
  operation: string;
  errorCode: string;
  errorMessage: string;
  stackTrace?: string;
  context?: Record<string, unknown>;
  category: ErrorCategory;
}

/**
 * Classify error based on message and type
 */
function classifyError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();

  if (
    message.includes("token") ||
    message.includes("auth") ||
    message.includes("unauthorized") ||
    message.includes("403") ||
    message.includes("401")
  ) {
    return "authentication";
  }

  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required") ||
    message.includes("400")
  ) {
    return "validation";
  }

  if (
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("econnrefused") ||
    message.includes("etimedout")
  ) {
    return "network";
  }

  if (
    message.includes("api") ||
    message.includes("rate limit") ||
    message.includes("429") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503")
  ) {
    return "api";
  }

  return "unknown";
}

/**
 * Log error with structured format
 */
export function logError(
  userId: string,
  operation: string,
  error: Error,
  context?: Record<string, unknown>,
): void {
  const category = classifyError(error);

  const errorLog: ErrorLog = {
    timestamp: new Date(),
    userId,
    operation,
    errorCode: error.name,
    errorMessage: error.message,
    stackTrace: error.stack,
    context,
    category,
  };

  // Log to console with structured format
  console.error("[Amazon Integration Error]", {
    ...errorLog,
    stackTrace: undefined, // Don't log full stack trace in structured log
  });

  // Log stack trace separately for debugging
  if (error.stack) {
    console.error("[Stack Trace]", error.stack);
  }

  // In production, you would send this to a logging service
  // e.g., Sentry, LogRocket, CloudWatch, etc.
  // sendToLoggingService(errorLog);
}

/**
 * Log authentication error
 */
export function logAuthError(
  userId: string,
  operation: string,
  error: Error,
): void {
  logError(userId, operation, error, { category: "authentication" });
}

/**
 * Log API error
 */
export function logApiError(
  userId: string,
  operation: string,
  error: Error,
  apiEndpoint?: string,
  statusCode?: number,
): void {
  logError(userId, operation, error, {
    category: "api",
    apiEndpoint,
    statusCode,
  });
}

/**
 * Log network error
 */
export function logNetworkError(
  userId: string,
  operation: string,
  error: Error,
): void {
  logError(userId, operation, error, { category: "network" });
}

/**
 * Log validation error
 */
export function logValidationError(
  userId: string,
  operation: string,
  error: Error,
  validationDetails?: Record<string, unknown>,
): void {
  logError(userId, operation, error, {
    category: "validation",
    ...validationDetails,
  });
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: Error): string {
  const category = classifyError(error);

  switch (category) {
    case "authentication":
      return "Authentication failed. Please reconnect your Amazon account.";
    case "validation":
      return "Invalid data provided. Please check your input and try again.";
    case "api":
      if (error.message.includes("rate limit")) {
        return "Amazon rate limit reached. Please try again in a few minutes.";
      }
      return "Amazon API error. Please try again later.";
    case "network":
      return "Network error. Please check your internet connection and try again.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}
