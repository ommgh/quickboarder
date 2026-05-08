/**
 * Marketplace Error Handling
 *
 * This module defines error types, codes, and messages for the unified marketplace system.
 * It provides structured error handling with user-friendly messages and detailed logging.
 */

import type { MarketplaceProvider } from "@/types/marketplace";

/**
 * Marketplace error codes
 *
 * Standardized error codes for all marketplace operations.
 * These codes help identify the type of error and provide appropriate user feedback.
 */
export enum MarketplaceErrorCode {
  /** OAuth configuration is missing or invalid */
  CONFIG_MISSING = "CONFIG_MISSING",
  /** OAuth state parameter is invalid or expired */
  INVALID_STATE = "INVALID_STATE",
  /** Failed to exchange authorization code for tokens */
  TOKEN_EXCHANGE_FAILED = "TOKEN_EXCHANGE_FAILED",
  /** Failed to refresh access token */
  TOKEN_REFRESH_FAILED = "TOKEN_REFRESH_FAILED",
  /** Network error occurred during API call */
  NETWORK_ERROR = "NETWORK_ERROR",
  /** User subscription plan does not allow marketplace connections */
  SUBSCRIPTION_REQUIRED = "SUBSCRIPTION_REQUIRED",
  /** Marketplace connection not found for user */
  CONNECTION_NOT_FOUND = "CONNECTION_NOT_FOUND",
  /** Marketplace provider is not supported */
  UNSUPPORTED_PROVIDER = "UNSUPPORTED_PROVIDER",
  /** Failed to encrypt token */
  ENCRYPTION_FAILED = "ENCRYPTION_FAILED",
  /** Failed to decrypt token */
  DECRYPTION_FAILED = "DECRYPTION_FAILED",
}

/**
 * User-friendly error messages
 *
 * Maps error codes to messages that can be displayed to users.
 * These messages are intentionally generic to avoid exposing sensitive information.
 */
export const ERROR_MESSAGES: Record<MarketplaceErrorCode, string> = {
  [MarketplaceErrorCode.CONFIG_MISSING]:
    "Marketplace integration is not configured. Please contact support.",
  [MarketplaceErrorCode.INVALID_STATE]:
    "Security validation failed. Please try connecting again.",
  [MarketplaceErrorCode.TOKEN_EXCHANGE_FAILED]:
    "Failed to connect marketplace account. Please try again.",
  [MarketplaceErrorCode.TOKEN_REFRESH_FAILED]:
    "Marketplace connection expired. Please reconnect your account.",
  [MarketplaceErrorCode.NETWORK_ERROR]:
    "Unable to reach marketplace. Please check your internet connection.",
  [MarketplaceErrorCode.SUBSCRIPTION_REQUIRED]:
    "Upgrade to Pro to connect marketplaces.",
  [MarketplaceErrorCode.CONNECTION_NOT_FOUND]:
    "Marketplace connection not found. Please connect your account.",
  [MarketplaceErrorCode.UNSUPPORTED_PROVIDER]:
    "Marketplace provider is not supported.",
  [MarketplaceErrorCode.ENCRYPTION_FAILED]:
    "Failed to secure connection data. Please try again.",
  [MarketplaceErrorCode.DECRYPTION_FAILED]:
    "Failed to retrieve connection data. Please reconnect your account.",
};

/**
 * Marketplace Error Class
 *
 * Custom error class for marketplace operations.
 * Includes error code, provider, and additional context for debugging.
 */
export class MarketplaceError extends Error {
  /** Error code for programmatic handling */
  public readonly code: MarketplaceErrorCode;
  /** Marketplace provider (if applicable) */
  public readonly provider?: MarketplaceProvider;
  /** Additional context for debugging */
  public readonly context?: Record<string, any>;

  constructor(
    code: MarketplaceErrorCode,
    message?: string,
    provider?: MarketplaceProvider,
    context?: Record<string, any>,
  ) {
    super(message || ERROR_MESSAGES[code]);
    this.name = "MarketplaceError";
    this.code = code;
    this.provider = provider;
    this.context = context;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MarketplaceError);
    }
  }

  /**
   * Get user-friendly error message
   *
   * @returns Message safe to display to users
   */
  getUserMessage(): string {
    return ERROR_MESSAGES[this.code];
  }

  /**
   * Convert error to JSON for logging
   *
   * @returns JSON representation of error
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      provider: this.provider,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Log marketplace error with context
 *
 * Logs errors with structured data for debugging and monitoring.
 * Includes timestamp, operation, user ID, provider, and full error details.
 *
 * @param error - The error to log
 * @param context - Additional context (operation, userId, provider, etc.)
 *
 * @example
 * ```typescript
 * try {
 *   await connectMarketplace();
 * } catch (error) {
 *   logMarketplaceError(error, {
 *     operation: "connectMarketplace",
 *     userId: "user123",
 *     provider: "amazon"
 *   });
 *   throw error;
 * }
 * ```
 */
export function logMarketplaceError(
  error: Error,
  context: {
    operation: string;
    userId?: string;
    provider?: MarketplaceProvider;
    [key: string]: any;
  },
): void {
  const logData: Record<string, any> = {
    timestamp: new Date().toISOString(),
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack,
    ...context,
  };

  // If it's a MarketplaceError, include additional details
  if (error instanceof MarketplaceError) {
    logData.errorCode = error.code;
    logData.errorContext = error.context;
  }

  console.error("[Marketplace Error]", JSON.stringify(logData, null, 2));
}

/**
 * Check if error is a MarketplaceError
 *
 * @param error - Error to check
 * @returns True if error is a MarketplaceError
 */
export function isMarketplaceError(error: any): error is MarketplaceError {
  return error instanceof MarketplaceError;
}

/**
 * Wrap unknown errors as MarketplaceError
 *
 * Converts unknown errors into MarketplaceError instances for consistent handling.
 *
 * @param error - Unknown error
 * @param defaultCode - Default error code to use
 * @param provider - Marketplace provider (if applicable)
 * @returns MarketplaceError instance
 *
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   throw wrapError(error, MarketplaceErrorCode.NETWORK_ERROR, "amazon");
 * }
 * ```
 */
export function wrapError(
  error: unknown,
  defaultCode: MarketplaceErrorCode,
  provider?: MarketplaceProvider,
): MarketplaceError {
  if (error instanceof MarketplaceError) {
    return error;
  }

  if (error instanceof Error) {
    return new MarketplaceError(defaultCode, error.message, provider, {
      originalError: error.name,
      originalStack: error.stack,
    });
  }

  return new MarketplaceError(defaultCode, String(error), provider, {
    originalError: error,
  });
}
