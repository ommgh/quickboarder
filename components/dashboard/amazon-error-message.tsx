import { AlertCircle, WifiOff, ShieldAlert, FileWarning } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ERROR_MESSAGES } from "@/types/amazon";

/**
 * Amazon Error Message Component
 * Maps API error codes to user-friendly messages with appropriate icons
 */

interface AmazonErrorMessageProps {
  error: string;
  className?: string;
}

export function AmazonErrorMessage({
  error,
  className,
}: AmazonErrorMessageProps) {
  // Determine error type and icon
  let icon = <AlertCircle className="h-4 w-4" />;
  let title = "Error";
  let message = error;

  if (error.includes("rate limit") || error.includes("Rate limit")) {
    icon = <AlertCircle className="h-4 w-4" />;
    title = "Rate Limit Reached";
    message = ERROR_MESSAGES.RATE_LIMIT;
  } else if (
    error.includes("expired") ||
    error.includes("Invalid access token") ||
    error.includes("authentication")
  ) {
    icon = <ShieldAlert className="h-4 w-4" />;
    title = "Connection Expired";
    message = ERROR_MESSAGES.TOKEN_EXPIRED;
  } else if (
    error.includes("network") ||
    error.includes("fetch failed") ||
    error.includes("Unable to reach")
  ) {
    icon = <WifiOff className="h-4 w-4" />;
    title = "Network Error";
    message = ERROR_MESSAGES.NETWORK_ERROR;
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

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
