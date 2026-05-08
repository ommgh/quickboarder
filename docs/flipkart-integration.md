# Flipkart Seller Integration Documentation

## Overview

The Flipkart Seller Integration feature enables QuickBoarder users to connect their Flipkart Seller Central accounts using OAuth 2.0 authentication. This Phase 1 MVP focuses exclusively on the connection flow - allowing users to authenticate, securely store credentials, and manage their connection status. The implementation mirrors the existing Amazon Seller Integration architecture and prepares the foundation for future product upload capabilities.

## Architecture

### Components

1. **OAuth Manager** (`lib/flipkart/oauth.ts`)
   - Handles OAuth 2.0 authorization flow
   - Generates authorization URLs with CSRF protection
   - Exchanges authorization codes for tokens
   - Refreshes expired access tokens with exponential backoff retry logic

2. **Token Manager** (`lib/flipkart/token-manager.ts`)
   - Manages token lifecycle and encryption
   - Automatically refreshes tokens when expiring (< 5 minutes remaining)
   - Stores encrypted tokens in database
   - Handles token expiration and connection status

3. **Server Actions** (`actions/flipkart-connection.ts`)
   - Type-safe server actions for connection management
   - Validates user authentication and subscription plans
   - Prevents concurrent connection attempts
   - Handles connection initiation, disconnection, and status checks

4. **OAuth Callback Route** (`app/api/flipkart/callback/route.ts`)
   - Handles OAuth redirects from Flipkart
   - Validates state parameters and exchanges codes for tokens
   - Enforces subscription plan requirements
   - Redirects users with success/error messages

5. **UI Component** (`components/dashboard/flipkart-connection-status.tsx`)
   - Displays connection status with visual indicators
   - Provides connect/disconnect controls
   - Shows seller ID and connection date
   - Handles loading states and error feedback

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Flipkart Seller Integration
FLIPKART_CLIENT_ID=your_client_id_here
FLIPKART_CLIENT_SECRET=your_client_secret_here
FLIPKART_REDIRECT_URI=http://localhost:3000/api/flipkart/callback
FLIPKART_ENCRYPTION_KEY=your_64_character_encryption_key_here
```

### Getting Flipkart Credentials

1. Register as a Flipkart Seller at https://seller.flipkart.com/
2. Navigate to API Settings in your Seller Dashboard
3. Create a new OAuth application
4. Note your Client ID and Client Secret
5. Configure the OAuth redirect URI to match your application URL:
   - Development: `http://localhost:3000/api/flipkart/callback`
   - Production: `https://yourdomain.com/api/flipkart/callback`

### Generating Encryption Key

Generate a secure 64-character encryption key (32 bytes):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important:** Use a different encryption key than your Amazon integration for security isolation.

## Database Setup

The integration requires two database models:

1. **FlipkartConnection** - Stores encrypted OAuth tokens and seller information
2. **OAuthState** - Temporary storage for OAuth state parameters (shared with Amazon)

Run Prisma migrations to create the tables:

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

### Database Schema

```prisma
model FlipkartConnection {
  id                    String   @id @default(cuid())
  userId                String   @unique
  sellerId              String
  encryptedAccessToken  String   @db.Text
  encryptedRefreshToken String   @db.Text
  accessTokenExpiresAt  DateTime
  refreshTokenExpiresAt DateTime
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sellerId])
}

model OAuthState {
  id            String   @id @default(cuid())
  state         String   @unique
  userId        String
  marketplaceId String   // "flipkart" for Flipkart connections
  expiresAt     DateTime
  createdAt     DateTime @default(now())

  @@index([state])
  @@index([expiresAt])
}
```

## OAuth Flow

### Architecture Diagram

```
User → Settings UI → Server Action → OAuth Manager → Flipkart OAuth API
                                          ↓
                                    Store State in DB
                                          ↓
                                    Redirect to Flipkart
                                          ↓
User Authorizes on Flipkart → Callback Route → Validate State
                                          ↓
                                    Exchange Code for Tokens
                                          ↓
                                    Encrypt & Store Tokens
                                          ↓
                                    Redirect to Settings
```

### 1. Initiate Connection

User clicks "Connect Flipkart" in Settings:

```typescript
import { initiateFlipkartConnection } from "@/actions/flipkart-connection";

const result = await initiateFlipkartConnection();

if (result.authorizationUrl) {
  window.location.href = result.authorizationUrl;
}

if (result.error) {
  if (result.requiresUpgrade) {
    // Show upgrade prompt for FREE users
    toast.error(result.error, {
      action: {
        label: "Upgrade",
        onClick: () => window.location.href = "/pricing"
      }
    });
  } else {
    toast.error(result.error);
  }
}
```

**Flow Details:**
- Validates user authentication via NextAuth session
- Checks subscription plan (blocks FREE users)
- Generates cryptographically secure state parameter (64-character hex)
- Stores state in database with 10-minute expiration
- Constructs authorization URL with required parameters
- Returns URL for client-side redirect

### 2. OAuth Callback

Flipkart redirects to `/api/flipkart/callback` with authorization code:

**Query Parameters:**
- `code` - Authorization code to exchange for tokens
- `state` - State parameter for CSRF validation
- `error` (optional) - Error code if authorization failed
- `error_description` (optional) - Human-readable error description

**Callback Processing:**
1. Validates state parameter matches database record
2. Checks state hasn't expired (10-minute limit)
3. Verifies user subscription plan (blocks FREE users)
4. Exchanges authorization code for access and refresh tokens
5. Encrypts tokens using AES-256-GCM
6. Stores encrypted tokens in database
7. Deletes state parameter (one-time use)
8. Redirects to Settings with success/error message

### 3. Token Refresh

Tokens are automatically refreshed when they have less than 5 minutes remaining:

```typescript
import { getValidAccessToken } from "@/lib/flipkart/token-manager";

try {
  const accessToken = await getValidAccessToken(userId);
  // Returns fresh token, automatically refreshing if needed
} catch (error) {
  if (error instanceof TokenExpiredError) {
    // Refresh token expired, user needs to reconnect
    console.error("Connection expired:", error.message);
  }
}
```

**Refresh Strategy:**
- Threshold: Refresh when < 5 minutes remaining
- Retry logic: Up to 3 attempts with exponential backoff (1s, 2s, 4s)
- Failure handling: Throws `TokenExpiredError` if refresh fails
- Refresh token expiration: Tracked separately, prompts reconnection when expired

## Connection Management

### Check Connection Status

```typescript
import { getFlipkartConnectionStatus } from "@/actions/flipkart-connection";

const result = await getFlipkartConnectionStatus();

if (result.status) {
  console.log("Connected:", result.status.connected);
  console.log("Seller ID:", result.status.sellerId);
  console.log("Connected At:", result.status.connectedAt);
}
```

### Disconnect Account

```typescript
import { disconnectFlipkart } from "@/actions/flipkart-connection";

const result = await disconnectFlipkart();

if (result.success) {
  toast.success(result.message);
} else {
  toast.error(result.error);
}
```

**Disconnection Process:**
- Validates user authentication
- Deletes FlipkartConnection record from database
- Cascades to remove all related data
- Returns success confirmation

## Error Handling

### Error Categories

1. **Authentication Errors**
   - Invalid/expired tokens → Trigger reconnection flow
   - Invalid state parameter → Display security error and log
   - OAuth exchange failure → Log and show generic error

2. **Network Errors**
   - Connection timeout → Retry with exponential backoff
   - DNS resolution failure → Display connectivity error
   - Flipkart API unreachable → Display service unavailable message

3. **Configuration Errors**
   - Missing environment variables → Log error and disable Flipkart features
   - Invalid encryption key → Throw error on startup

4. **Subscription Errors**
   - FREE plan user attempting connection → Display upgrade prompt
   - Direct callback access by FREE user → Redirect to pricing page

### Error Messages

The integration provides user-friendly error messages defined in `types/flipkart.ts`:

```typescript
export const FLIPKART_ERROR_MESSAGES = {
  TOKEN_EXPIRED: "Flipkart connection expired. Please reconnect your account.",
  INVALID_STATE: "Security validation failed. Please try connecting again.",
  NETWORK_ERROR: "Unable to reach Flipkart. Please check your internet connection and try again.",
  AUTH_FAILED: "Failed to connect Flipkart account. Please try again.",
  SUBSCRIPTION_REQUIRED: "Upgrade to Pro to connect marketplaces.",
  CONFIG_MISSING: "Flipkart integration is not configured. Please contact support.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  CONNECTION_NOT_FOUND: "Flipkart connection not found. Please connect your account in Settings.",
  DISCONNECT_FAILED: "Failed to disconnect Flipkart account. Please try again.",
};
```

### Error Logging

All errors are logged with structured format:

```typescript
console.error("Error initiating Flipkart connection:", {
  userId: session.user.id,
  operation: "initiate_connection",
  error: error.message,
  timestamp: new Date().toISOString(),
});
```

## Security

### Token Encryption

- **Algorithm:** AES-256-GCM (authenticated encryption)
- **Key Derivation:** PBKDF2 with 100,000 iterations from `FLIPKART_ENCRYPTION_KEY`
- **Unique IV:** Generated per encryption operation using `crypto.randomBytes(16)`
- **Format:** `salt:iv:authTag:encryptedData` (base64 encoded)
- **Implementation:** Reuses existing encryption service from `lib/amazon/encryption.ts`

**Encryption Process:**

```typescript
import { encryptToken, decryptToken } from "@/lib/amazon/encryption";

// Temporarily swap encryption key for Flipkart
const originalKey = process.env.AMAZON_ENCRYPTION_KEY;
process.env.AMAZON_ENCRYPTION_KEY = process.env.FLIPKART_ENCRYPTION_KEY;

try {
  const encrypted = encryptToken(plaintext);
  const decrypted = decryptToken(encrypted);
} finally {
  process.env.AMAZON_ENCRYPTION_KEY = originalKey;
}
```

### CSRF Protection

- **State Parameter:** Generated with `crypto.randomBytes(32)` (64-character hex)
- **Storage:** Stored in database with 10-minute expiration
- **One-Time Use:** Deleted after validation to prevent replay attacks
- **User Association:** Includes userId to prevent session fixation
- **Shared Table:** Reuses existing `OAuthState` table (shared with Amazon)

### Input Validation

- All user inputs validated with Zod schemas
- Server actions validate authentication and subscription
- Callback route validates required parameters (code, state)
- Error parameters from Flipkart sanitized before display

### Subscription Enforcement

- Check subscription plan before generating authorization URL
- Check subscription plan in callback route
- FREE users blocked with upgrade prompt
- PRO and ENTERPRISE users allowed
- Log all subscription enforcement events

## Differences from Amazon Integration

While the Flipkart integration mirrors the Amazon integration architecture, there are key differences:

### 1. OAuth Endpoints

**Flipkart:**
- Authorization: `https://api.flipkart.net/oauth-service/oauth/authorize`
- Token: `https://api.flipkart.net/oauth-service/oauth/token`
- Scope: `Seller_Api`

**Amazon:**
- Authorization: `https://sellercentral.amazon.com/apps/authorize/consent`
- Token: `https://api.amazon.com/auth/o2/token`
- Scope: Multiple scopes for different SP-API operations

### 2. Token Expiration

**Flipkart:**
- Access token: 1 hour (3600 seconds)
- Refresh token: 30 days (2592000 seconds)
- Both expiration times tracked separately in database

**Amazon:**
- Access token: 1 hour (3600 seconds)
- Refresh token: No expiration (long-lived)
- Only access token expiration tracked

### 3. Database Schema

**Flipkart:**
```prisma
model FlipkartConnection {
  accessTokenExpiresAt  DateTime
  refreshTokenExpiresAt DateTime  // Additional field
}
```

**Amazon:**
```prisma
model AmazonConnection {
  tokenExpiresAt DateTime  // Single expiration field
  marketplaceId  String    // Required field
}
```

### 4. Seller ID Extraction

**Flipkart:**
- May or may not include `seller_id` in OAuth response
- Falls back to "UNKNOWN" if not present
- No additional API call to fetch seller profile

**Amazon:**
- Seller ID always included in OAuth response
- Marketplace ID required for API operations

### 5. Phase 1 Scope

**Flipkart:**
- Phase 1: Connection only (no product upload)
- Phase 2: Product upload features (planned)

**Amazon:**
- Fully implemented with product upload, history tracking, and retry logic

### 6. Encryption Keys

**Flipkart:**
- Uses `FLIPKART_ENCRYPTION_KEY` environment variable
- Separate key for security isolation

**Amazon:**
- Uses `AMAZON_ENCRYPTION_KEY` environment variable

## Code Examples

### Complete Connection Flow

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  initiateFlipkartConnection,
  disconnectFlipkart,
  getFlipkartConnectionStatus,
} from "@/actions/flipkart-connection";

export function FlipkartConnectionExample() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    try {
      const result = await initiateFlipkartConnection();

      if (result.error) {
        if (result.requiresUpgrade) {
          toast.error(result.error, {
            action: {
              label: "Upgrade",
              onClick: () => window.location.href = "/pricing"
            }
          });
        } else {
          toast.error(result.error);
        }
        return;
      }

      if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      }
    } catch (error) {
      toast.error("Failed to connect Flipkart account");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    setLoading(true);
    try {
      const result = await disconnectFlipkart();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      setConnected(false);
    } catch (error) {
      toast.error("Failed to disconnect Flipkart account");
    } finally {
      setLoading(false);
    }
  }

  async function checkStatus() {
    const result = await getFlipkartConnectionStatus();
    if (result.status) {
      setConnected(result.status.connected);
    }
  }

  return (
    <div>
      {connected ? (
        <Button onClick={handleDisconnect} disabled={loading}>
          Disconnect Flipkart
        </Button>
      ) : (
        <Button onClick={handleConnect} disabled={loading}>
          Connect Flipkart
        </Button>
      )}
    </div>
  );
}
```

### Server-Side Token Usage

```typescript
import { getValidAccessToken } from "@/lib/flipkart/token-manager";
import { TokenExpiredError } from "@/lib/flipkart/token-manager";

export async function makeFlipkartAPICall(userId: string) {
  try {
    // Get valid access token (auto-refreshes if needed)
    const accessToken = await getValidAccessToken(userId);

    // Make API call to Flipkart
    const response = await fetch("https://api.flipkart.net/sellers/v3/...", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Flipkart API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      // Refresh token expired, user needs to reconnect
      throw new Error("Flipkart connection expired. Please reconnect your account.");
    }
    throw error;
  }
}
```

### Custom Error Handling

```typescript
import { FLIPKART_ERROR_MESSAGES } from "@/types/flipkart";

export function handleFlipkartError(error: unknown): string {
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes("state parameter")) {
      return FLIPKART_ERROR_MESSAGES.INVALID_STATE;
    }
    if (error.message.includes("expired")) {
      return FLIPKART_ERROR_MESSAGES.TOKEN_EXPIRED;
    }
    if (error.message.includes("network") || error.message.includes("ECONNREFUSED")) {
      return FLIPKART_ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.message.includes("configuration")) {
      return FLIPKART_ERROR_MESSAGES.CONFIG_MISSING;
    }

    // Return original error message if no pattern matches
    return error.message;
  }

  return FLIPKART_ERROR_MESSAGES.UNKNOWN_ERROR;
}
```

## Testing

### Manual Testing Checklist

- [ ] OAuth flow with Flipkart Seller Central account
- [ ] Token refresh after expiration (may require time manipulation)
- [ ] Disconnection and reconnection
- [ ] Error handling for various API failures
- [ ] UI state updates during connection process
- [ ] Subscription plan enforcement (FREE vs PRO)
- [ ] Concurrent connection attempts (race condition handling)
- [ ] State parameter expiration (10-minute limit)
- [ ] Invalid state parameter handling
- [ ] Network error handling with retry logic

### Test Environment

Use Flipkart's sandbox environment for testing:
- Sandbox endpoint: `https://sandbox.flipkart.net` (if available)
- Test seller accounts available in Flipkart Seller Central
- Verify OAuth flow with test credentials before production

### Unit Testing

```typescript
import { generateAuthorizationUrl, handleCallback } from "@/lib/flipkart/oauth";
import { storeTokens, getValidAccessToken } from "@/lib/flipkart/token-manager";

describe("Flipkart OAuth", () => {
  it("generates authorization URL with state parameter", async () => {
    const { url, state } = await generateAuthorizationUrl("user123");
    
    expect(url).toContain("https://api.flipkart.net/oauth-service/oauth/authorize");
    expect(url).toContain(`state=${state}`);
    expect(state).toHaveLength(64); // 32 bytes = 64 hex characters
  });

  it("handles callback and exchanges code for tokens", async () => {
    const result = await handleCallback("auth_code_123", "valid_state");
    
    expect(result.userId).toBeDefined();
    expect(result.sellerId).toBeDefined();
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });

  it("automatically refreshes expiring tokens", async () => {
    // Store tokens that expire in 2 minutes
    await storeTokens("user123", {
      accessToken: "access_token",
      refreshToken: "refresh_token",
      expiresIn: 120, // 2 minutes
      refreshTokenExpiresIn: 2592000, // 30 days
    }, "seller123");

    // Should trigger automatic refresh
    const token = await getValidAccessToken("user123");
    expect(token).toBeDefined();
  });
});
```

## Troubleshooting

### Connection Issues

**Problem:** "Invalid state parameter" error

**Solution:** State may have expired (10-minute limit). Try connecting again. If the issue persists, check that the database `OAuthState` table is accessible and not experiencing issues.

---

**Problem:** "Token exchange failed"

**Solution:** 
1. Verify `FLIPKART_CLIENT_ID` and `FLIPKART_CLIENT_SECRET` are correct
2. Ensure `FLIPKART_REDIRECT_URI` matches the URI configured in Flipkart Seller Central
3. Check that the authorization code hasn't expired (typically 10 minutes)

---

**Problem:** "Flipkart integration is not configured"

**Solution:** Ensure all required environment variables are set:
- `FLIPKART_CLIENT_ID`
- `FLIPKART_CLIENT_SECRET`
- `FLIPKART_REDIRECT_URI`
- `FLIPKART_ENCRYPTION_KEY`

### Token Issues

**Problem:** "Flipkart connection expired. Please reconnect your account."

**Solution:** The refresh token has expired (30-day limit). Reconnect your Flipkart account in Settings.

---

**Problem:** "Failed to decrypt token"

**Solution:** 
1. Verify `FLIPKART_ENCRYPTION_KEY` hasn't changed since tokens were encrypted
2. Check that the encryption key is exactly 64 characters (32 bytes hex)
3. If key was changed, users will need to reconnect their accounts

### Database Issues

**Problem:** "Encryption key missing"

**Solution:** Ensure `FLIPKART_ENCRYPTION_KEY` is set in `.env` file and the application has been restarted.

---

**Problem:** Duplicate connection errors

**Solution:** The database enforces a unique constraint on `userId`. If you see constraint violations, the system will automatically handle them by updating the existing connection.

### Subscription Issues

**Problem:** "Upgrade to Pro to connect marketplaces"

**Solution:** User has a FREE plan. Upgrade to PRO or ENTERPRISE to access marketplace integrations.

---

**Problem:** FREE user bypassing UI restrictions

**Solution:** Server-side checks in both the server action and callback route prevent FREE users from connecting, even if they bypass UI restrictions.

## API Reference

### Server Actions

#### `initiateFlipkartConnection(values?)`

Initiates OAuth flow for Flipkart connection.

**Parameters:**
- `values` (optional) - Empty object for consistency with pattern

**Returns:**
```typescript
{
  success?: boolean;
  authorizationUrl?: string;
  error?: string;
  requiresUpgrade?: boolean;
}
```

**Example:**
```typescript
const result = await initiateFlipkartConnection();
if (result.authorizationUrl) {
  window.location.href = result.authorizationUrl;
}
```

---

#### `disconnectFlipkart()`

Disconnects Flipkart account and deletes tokens.

**Parameters:** None

**Returns:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
}
```

**Example:**
```typescript
const result = await disconnectFlipkart();
if (result.success) {
  toast.success(result.message);
}
```

---

#### `getFlipkartConnectionStatus()`

Retrieves current connection status for authenticated user.

**Parameters:** None

**Returns:**
```typescript
{
  success?: boolean;
  status?: {
    connected: boolean;
    sellerId?: string;
    connectedAt?: Date;
  };
  error?: string;
}
```

**Example:**
```typescript
const result = await getFlipkartConnectionStatus();
if (result.status?.connected) {
  console.log("Seller ID:", result.status.sellerId);
}
```

### Token Manager Functions

#### `getValidAccessToken(userId: string)`

Gets valid access token for user, automatically refreshing if needed.

**Parameters:**
- `userId` (string) - QuickBoarder user ID

**Returns:** `Promise<string>` - Decrypted access token

**Throws:** `TokenExpiredError` if refresh token expired

**Example:**
```typescript
try {
  const token = await getValidAccessToken(userId);
  // Use token for API calls
} catch (error) {
  if (error instanceof TokenExpiredError) {
    // Prompt user to reconnect
  }
}
```

---

#### `storeTokens(userId, tokens, sellerId)`

Stores encrypted tokens in database.

**Parameters:**
- `userId` (string) - QuickBoarder user ID
- `tokens` (object) - Token data
  - `accessToken` (string)
  - `refreshToken` (string)
  - `expiresIn` (number) - Seconds until access token expires
  - `refreshTokenExpiresIn` (number) - Seconds until refresh token expires
- `sellerId` (string) - Flipkart seller ID

**Returns:** `Promise<void>`

---

#### `revokeConnection(userId: string)`

Revokes connection and deletes tokens.

**Parameters:**
- `userId` (string) - QuickBoarder user ID

**Returns:** `Promise<void>`

---

#### `getConnectionStatus(userId: string)`

Gets connection status for user.

**Parameters:**
- `userId` (string) - QuickBoarder user ID

**Returns:**
```typescript
Promise<{
  connected: boolean;
  sellerId?: string;
  connectedAt?: Date;
} | null>
```

## Future Enhancements (Phase 2)

### Product Upload Features

Phase 2 will add product upload capabilities similar to the Amazon integration:

1. **Product Mapper**
   - Transform QuickBoarder products to Flipkart listing format
   - Category mapping with fallbacks
   - Image URL handling
   - SKU generation

2. **Upload Handler**
   - Sequential product upload with rate limiting
   - Retry logic for failures
   - Upload progress tracking
   - Batch operations

3. **Upload History**
   - Track uploaded products
   - Display upload status badges
   - Prevent duplicate uploads
   - Re-upload capability

4. **UI Enhancements**
   - Upload controls in Catalog page
   - Progress indicators
   - Error feedback
   - Upload history view

### Additional Features (Phase 3+)

- Inventory synchronization
- Order management
- Analytics and reporting
- Multi-account support
- Bulk operations
- Webhook integration for real-time updates

## Support

For issues or questions:

1. **Check this documentation** - Most common issues are covered in the Troubleshooting section
2. **Review error logs** - Check browser console and server logs for detailed error messages
3. **Verify environment variables** - Ensure all required variables are set correctly
4. **Test with sandbox** - Use Flipkart sandbox environment for testing before production
5. **Check database** - Verify Prisma migrations have been applied and tables exist

## Related Documentation

- [Amazon Integration Documentation](./amazon-integration.md) - Similar architecture and patterns
- [Flipkart Seller API Documentation](https://seller.flipkart.com/api-docs/) - Official API reference
- [OAuth 2.0 Specification](https://oauth.net/2/) - OAuth protocol details
- [Next.js 15 Documentation](https://nextjs.org/docs) - Framework reference
- [Prisma Documentation](https://www.prisma.io/docs) - ORM usage patterns

---

**Last Updated:** 2024
**Version:** 1.0.0 (Phase 1 MVP)
**Status:** Production Ready
