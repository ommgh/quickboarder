import { AlertCircle, ShieldAlert, WifiOff, FileWarning } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FLIPKART_ERROR_MESSAGES } from "@/types/flipkart";

/**
 * Flipkart Error Message Component
 * Maps API error codes to user-friendly messages with appropriate icons
 */

interface FlipkartErrorMessageProps {
  error: string;
  className?: string;
}

export function FlipkartErrorMessage({
  error,
  className,
}: FlipkartErrorMessageProps) {
  // Determine error type and icon
  let icon = <AlertCircle className="h-4 w-4" />;
  let title = "Error";
  let message = error;

  if (
    error.includes("expired") ||
    error.includes("Invalid access token") ||
    error.includes("authentication") ||
    error.includes("token_expired")
  ) {
    icon = <ShieldAlert className="h-4 w-4" />;
    title = "Connection Expired";
    message = FLIPKART_ERROR_MESSAGES.TOKEN_EXPIRED;
  } else if (
    error.includes("network") ||
    error.includes("fetch failed") ||
    error.includes("Unable to reach") ||
    error.includes("network_error")
  ) {
    icon = <WifiOff className="h-4 w-4" />;
    title = "Network Error";
    message = FLIPKART_ERROR_MESSAGES.NETWORK_ERROR;
  } else if (
    error.includes("Failed to connect") ||
    error.includes("auth_failed") ||
    error.includes("invalid_grant") ||
    error.includes("invalid_client")
  ) {
    icon = <ShieldAlert className="h-4 w-4" />;
    title = "Authentication Failed";
    message = FLIPKART_ERROR_MESSAGES.AUTH_FAILED;
  } else if (
    error.includes("Authorization failed") ||
    error.includes("invalid_state")
  ) {
    icon = <FileWarning className="h-4 w-4" />;
    title = "Authorization Failed";
    message = error; // Use the specific error_description from OAuth callback
  } else if (error.includes("validation") || error.includes("Invalid")) {
    icon = <FileWarning className="h-4 w-4" />;
    title = "Validation Error";
    message = error;
  }

  return (
    <Alert variant="destructive" className={className}>
      {icon}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

/**
 * Get user-friendly error message from error object
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return FLIPKART_ERROR_MESSAGES.UNKNOWN_ERROR;
}
